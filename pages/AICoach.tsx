import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { getMetrics, getUserProfile } from '../services/dataService';
import { AIChatMessage } from '../types';
//
import { ChatSession } from "@google/generative-ai";

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { id: '1', role: 'model', text: "Hi! I'm your X4U Health Coach. I've analyzed your latest data. How can I help you optimize your health today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  //
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const [metrics, profile] = await Promise.all([getMetrics(), getUserProfile()]);
      
      // -------------------------------------------------------
      //
      //
      //
      // -------------------------------------------------------
      if (profile) {
        const session = createChatSession(profile, metrics);
        setChatSession(session);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSession) {
         setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "I'm currently in offline mode. Please check your API Key settings.",
                timestamp: Date.now()
             }]);
            setIsLoading(false);
         }, 1000);
         return;
      }

      //
      const result = await chatSession.sendMessage(userMsg.text);
      const responseText = result.response.text(); // استخراج النص من الاستجابة
      
      const modelMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I couldn't generate a response.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI service.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-app-text">AI Health Coach</h1>
        <p className="text-app-muted">Personalized advice based on your real data.</p>
      </div>

      <div className="flex-1 bg-app-surface border border-app-border rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-indigo-600'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600/10 text-app-text border border-primary-600/30 rounded-tr-none' 
                    : 'bg-app-bg text-app-text rounded-tl-none border border-app-border'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="flex items-center gap-2 bg-app-bg px-4 py-2 rounded-full border border-app-border">
                 <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                 <span className="text-xs text-app-muted">Thinking...</span>
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-app-bg border-t border-app-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your health, diet, or workout..."
              className="flex-1 bg-app-input text-app-text border border-app-border rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;