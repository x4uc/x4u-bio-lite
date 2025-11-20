import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, RefreshCw, ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import { getMetrics } from '../services/dataService';
import { generateMotivationalQuote } from '../services/geminiService';
import { DailyMetric } from '../types';

const SharePreview: React.FC = () => {
  const { user } = useAuth();
  const [metric, setMetric] = useState<DailyMetric | null>(null);
  const [quote, setQuote] = useState<string>("Loading motivation...");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const m = await getMetrics(user.uid);
      // Get most recent
      const latest = m[m.length - 1];
      setMetric(latest);

      if (latest) {
        const q = await generateMotivationalQuote(user, latest);
        setQuote(q);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRegenerateQuote = async () => {
    if (!user || !metric) return;
    setQuote("Thinking of something inspiring...");
    const q = await generateMotivationalQuote(user, metric);
    setQuote(q);
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `x4u-bio-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Could not generate image', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (cardRef.current === null) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "x4u-progress.png", { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          title: 'My X4U Bio Progress',
          text: `${quote} #X4UBio #HealthJourney`,
          files: [file],
        });
      } else {
        alert("Web Share API not supported on this browser. Downloading instead.");
        handleDownload();
      }
    } catch (err) {
      console.error('Error sharing', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-app-muted">Preparing your showcase...</div>;
  if (!metric) return <div className="text-center p-10 text-app-muted">No data to share yet! Go track your day first.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/community" className="p-2 rounded-lg hover:bg-app-surface text-app-muted">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-app-text">Share Your Success</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* --- The Share Card (Rendered off-screen or on-screen) --- */}
        <div className="w-full max-w-[400px] mx-auto lg:mx-0 shadow-2xl rounded-[2rem] overflow-hidden ring-4 ring-white/10">
          <div 
            ref={cardRef}
            className="w-[400px] h-[711px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative flex flex-col p-8 justify-between"
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                 <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                   <Activity className="w-6 h-6 text-emerald-400" />
                 </div>
                 <span className="text-xl font-bold tracking-wider">X4U Bio</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-indigo-200 text-sm uppercase tracking-widest">Daily Progress</p>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                   {new Date(metric.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long'})}
                </h2>
              </div>
            </div>

            {/* Stats Circle */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-8">
               <div className="w-48 h-48 rounded-full border-4 border-white/10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner relative">
                 <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full rotate-45"></div>
                 <span className="text-5xl font-bold text-white">{metric.steps}</span>
                 <span className="text-indigo-300 uppercase text-xs tracking-widest mt-1">Steps Taken</span>
               </div>

               <div className="grid grid-cols-3 gap-4 w-full mt-12">
                 <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                   <div className="text-2xl font-bold text-blue-400">{metric.waterIntake}ml</div>
                   <div className="text-[10px] uppercase text-indigo-300 mt-1">Water</div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                   <div className="text-2xl font-bold text-purple-400">{metric.sleepHours}h</div>
                   <div className="text-[10px] uppercase text-indigo-300 mt-1">Sleep</div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                   <div className="text-2xl font-bold text-rose-400">{metric.stressLevel}</div>
                   <div className="text-[10px] uppercase text-indigo-300 mt-1">Stress</div>
                 </div>
               </div>
            </div>

            {/* AI Quote Footer */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-4">
               <div className="absolute -top-3 left-6 bg-indigo-600 text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                 AI MOTIVATION
               </div>
               <p className="text-lg font-medium text-center italic leading-relaxed">
                 "{quote}"
               </p>
               <div className="mt-4 flex items-center justify-center gap-2 opacity-60">
                 <span className="h-px w-8 bg-white"></span>
                 <span className="text-xs uppercase tracking-widest">{user?.displayName || 'BioHacker'}</span>
                 <span className="h-px w-8 bg-white"></span>
               </div>
            </div>

          </div>
        </div>

        {/* --- Controls --- */}
        <div className="flex-1 bg-app-surface p-8 rounded-2xl border border-app-border h-fit">
           <h3 className="text-xl font-bold text-app-text mb-4">Export Options</h3>
           <p className="text-app-muted text-sm mb-6">
             Share your card to Instagram Stories, WhatsApp Status, or Twitter to inspire others.
           </p>
           
           <div className="space-y-4">
             <button 
               onClick={handleShare}
               disabled={generating}
               className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-900/20"
             >
               <Share2 className="w-5 h-5" /> {generating ? 'Generating...' : 'Share Now'}
             </button>
             
             <button 
               onClick={handleDownload}
               disabled={generating}
               className="w-full flex items-center justify-center gap-2 bg-app-bg border border-app-border hover:bg-app-hover text-app-text font-semibold py-3 rounded-xl transition-colors"
             >
               <Download className="w-5 h-5" /> Download Image
             </button>

             <div className="h-px bg-app-border my-4"></div>

             <button 
                onClick={handleRegenerateQuote}
                className="w-full flex items-center justify-center gap-2 text-sm text-app-muted hover:text-primary-500 transition-colors"
             >
               <RefreshCw className="w-4 h-4" /> Regenerate AI Quote
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SharePreview;
