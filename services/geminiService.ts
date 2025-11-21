import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { UserProfile, DailyMetric, AIRecommendation } from "../types";

//
const getAiClient = () => {
  //
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing!");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

//
const MODEL_FAST = "gemini-2.5-flash";

export const generateHealthInsights = async (
  user: UserProfile,
  metrics: DailyMetric[]
): Promise<{ score: number; summary: string; recommendations: AIRecommendation[] } | null> => {
  const genAI = getAiClient();
  if (!genAI) return null;

  //
  const recentMetrics = [...metrics].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  const prompt = `
    Analyze the health data for this user:
    Profile: ${JSON.stringify(user)}
    Recent 7 Days Data: ${JSON.stringify(recentMetrics)}

    Task:
    1. Calculate a "Daily Health Score" (0-100) based on the most recent day's performance (sleep, steps, stress, etc.).
    2. Provide a brief 2-sentence summary of their recent health trend.
    3. Generate 3 specific, actionable recommendations for tomorrow.

    Return JSON format strictly.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_FAST,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            summary: { type: SchemaType.STRING },
            recommendations: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  //
                  category: { 
                    type: SchemaType.STRING, 
                    format: "enum", 
                    enum: ['Sleep', 'Exercise', 'Diet', 'Stress', 'General'] 
                  },
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  priority: { 
                    type: SchemaType.STRING, 
                    format: "enum", 
                    enum: ['High', 'Medium', 'Low'] 
                  },
                },
                required: ['category', 'title', 'description', 'priority']
              }
            }
          },
          required: ['score', 'summary', 'recommendations']
        }
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      score: 0,
      summary: "Unable to analyze data at this moment.",
      recommendations: []
    };
  }
};

export const createChatSession = (user: UserProfile, metrics: DailyMetric[]) => {
  const genAI = getAiClient();
  if (!genAI) return null;

  const recentStats = metrics.slice(-5); //

  const systemInstruction = `
    You are "X4U Bio Assistant", a world-class AI health coach.
    
    User Context:
    Name: ${user.displayName || 'User'}
    Age: ${user.age}
    Weight: ${user.weight}kg
    Goals: ${user.goals.join(', ')}
    
    Recent Stats (Last 5 entries):
    ${JSON.stringify(recentStats)}

    Guidelines:
    - Be motivational, professional, and concise.
    - Use the user's data to personalize answers.
    - If user asks about medical diagnosis, disclaim that you are an AI and they should see a doctor.
    - Focus on sleep, nutrition, and stress management.
  `;

  return genAI.getGenerativeModel({ 
    model: MODEL_FAST, 
    systemInstruction 
  }).startChat({});
};

export const generateMotivationalQuote = async (
  user: UserProfile,
  todayMetric: DailyMetric
): Promise<string> => {
  const genAI = getAiClient();
  if (!genAI) return "Stay consistent, stay healthy!";

  const model = genAI.getGenerativeModel({ model: MODEL_FAST });

  const prompt = `
    Generate a short, powerful, and energetic motivational quote (max 15 words) for a social media share card.
    Context:
    User: ${user.displayName}
    Today's Success: Steps: ${todayMetric.steps}, Sleep: ${todayMetric.sleepHours}h, Stress: ${todayMetric.stressLevel}/10.
    
    The tone should be inspiring and celebratory. Do not use hashtags.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/"/g, '') || "Every step counts towards a better you.";
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Consistency is the key to mastery.";
  }
};
