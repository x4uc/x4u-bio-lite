import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyMetric, AIRecommendation } from "../types";

// Initialize Gemini Client
// 
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_FAST = "gemini-2.5-flash";

export const generateHealthInsights = async (
  user: UserProfile,
  metrics: DailyMetric[]
): Promise<{ score: number; summary: string; recommendations: AIRecommendation[] } | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Sort metrics by date descending to get recent context
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
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ['Sleep', 'Exercise', 'Diet', 'Stress', 'General'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                },
                required: ['category', 'title', 'description', 'priority']
              }
            }
          },
          required: ['score', 'summary', 'recommendations']
        }
      }
    });

    const text = response.text;
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
  const ai = getAiClient();
  if (!ai) return null;

  const recentStats = metrics.slice(-5); // Last 5 entries

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

  return ai.chats.create({
    model: MODEL_FAST,
    config: {
      systemInstruction,
    },
  });
};

export const generateMotivationalQuote = async (
  user: UserProfile,
  todayMetric: DailyMetric
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Stay consistent, stay healthy!";

  const prompt = `
    Generate a short, powerful, and energetic motivational quote (max 15 words) for a social media share card.
    Context:
    User: ${user.displayName}
    Today's Success: Steps: ${todayMetric.steps}, Sleep: ${todayMetric.sleepHours}h, Stress: ${todayMetric.stressLevel}/10.
    
    The tone should be inspiring and celebratory. Do not use hashtags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text?.trim().replace(/"/g, '') || "Every step counts towards a better you.";
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Consistency is the key to mastery.";
  }
};
