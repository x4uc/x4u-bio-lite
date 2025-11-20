import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Moon, Brain, Zap, Crown, Lock, Share2, Award, ChevronRight } from 'lucide-react';
import { getMetrics, getAchievements, checkAndUnlockAchievements } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { Achievement, DailyMetric } from '../types';
import { motion } from 'framer-motion';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Definitions for all possible achievements to show locked states
  const allAchievements = [
    { id: 'hydration_hero', title: 'Hydration Hero', desc: 'Drink 2L+ water for 3 days', icon: Droplets },
    { id: 'sleep_master', title: 'Sleep Master', desc: 'Sleep 8h+ for 5 days', icon: Moon },
    { id: 'stress_slayer', title: 'Stress Slayer', desc: 'Low stress for 4 days', icon: Brain },
    { id: 'activity_champion', title: 'Activity Champion', desc: 'Active 5 days a week', icon: Zap },
    { id: 'consistency_king', title: 'Consistency King', desc: 'Log data for 10 days', icon: Crown },
  ];

  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      
      const m = await getMetrics(user.uid);
      setMetrics(m);

      // Check for new unlocks based on current data
      const newUnlocks = await checkAndUnlockAchievements(user.uid, m);
      setNewlyUnlocked(newUnlocks);

      // Fetch current list
      const currentAch = await getAchievements(user.uid);
      setAchievements(currentAch);
      setLoading(false);
    };

    initData();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app-text">Community Hub</h1>
          <p className="text-app-muted">Gamify your health and share your journey.</p>
        </div>
        <Link 
          to="/share" 
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          <Share2 className="w-5 h-5" /> Share Progress
        </Link>
      </div>

      {/* New Achievement Alert */}
      {newlyUnlocked.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-4"
        >
          <div className="bg-yellow-500 p-2 rounded-full text-white">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-app-text">New Achievements Unlocked!</h3>
            <p className="text-sm text-app-muted">You've earned {newlyUnlocked.length} new badges. Great job!</p>
          </div>
        </motion.div>
      )}

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xl font-semibold text-app-text mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" /> Your Trophy Case
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map((template) => {
            const unlocked = achievements.find(a => a.id === template.id);
            const Icon = template.icon;

            return (
              <div 
                key={template.id}
                className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
                  unlocked 
                    ? 'bg-app-surface border-app-border shadow-sm' 
                    : 'bg-app-bg border-app-border opacity-70 grayscale'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${unlocked ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {unlocked ? (
                    <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                      UNLOCKED
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-app-text mb-1">{template.title}</h3>
                <p className="text-sm text-app-muted mb-3">{template.desc}</p>
                
                {unlocked && (
                  <p className="text-xs text-app-muted pt-3 border-t border-app-border">
                    Earned on {new Date(unlocked.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Progress Snapshot */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-6">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-app-text">Recent Activity Log</h3>
           <Link to="/track" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
             Log Today <ChevronRight className="w-4 h-4" />
           </Link>
         </div>
         
         <div className="space-y-3">
           {metrics.slice(-5).reverse().map((m) => (
             <div key={m.date} className="flex items-center justify-between p-3 hover:bg-app-bg rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-lg font-bold text-xs w-12 text-center">
                    {new Date(m.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-app-text">Daily Check-in</div>
                    <div className="text-xs text-app-muted flex gap-2">
                      <span>💧 {m.waterIntake}ml</span>
                      <span>👣 {m.steps} steps</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-app-text">
                   Score: {(m.sleepHours * 5 + m.steps / 500 + (10 - m.stressLevel) * 5).toFixed(0)}
                </div>
             </div>
           ))}
           {metrics.length === 0 && (
             <div className="text-center py-8 text-app-muted">No data logged yet. Start tracking to earn badges!</div>
           )}
         </div>
      </div>
    </div>
  );
};

export default Community;
