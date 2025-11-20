import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMetric } from '../services/dataService';
import { DailyMetric } from '../types';
import { Save, Moon, Droplets, Footprints, Activity } from 'lucide-react';

const DailyTrack: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<DailyMetric>>({
    date: new Date().toISOString().split('T')[0],
    sleepHours: 7,
    waterIntake: 2000,
    steps: 5000,
    stressLevel: 5,
    mood: 7,
    nutritionScore: 8,
    exerciseMinutes: 30
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMetric(formData as DailyMetric);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-app-text mb-2">Track Today's Health</h1>
        <p className="text-app-muted">Consistent tracking is key to AI accuracy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-app-surface border border-app-border p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-app-muted mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-medium text-app-muted">
               <Moon className="w-4 h-4 text-indigo-400" /> Sleep Hours
             </label>
             <input
               type="number"
               name="sleepHours"
               step="0.5"
               value={formData.sleepHours}
               onChange={handleChange}
               className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none"
             />
          </div>

          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-medium text-app-muted">
               <Droplets className="w-4 h-4 text-blue-400" /> Water (ml)
             </label>
             <input
               type="number"
               name="waterIntake"
               step="50"
               value={formData.waterIntake}
               onChange={handleChange}
               className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none"
             />
          </div>

          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-medium text-app-muted">
               <Footprints className="w-4 h-4 text-orange-400" /> Steps
             </label>
             <input
               type="number"
               name="steps"
               value={formData.steps}
               onChange={handleChange}
               className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none"
             />
          </div>

           <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-medium text-app-muted">
               <Activity className="w-4 h-4 text-green-400" /> Exercise (min)
             </label>
             <input
               type="number"
               name="exerciseMinutes"
               value={formData.exerciseMinutes}
               onChange={handleChange}
               className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none"
             />
          </div>
        </div>

        <div className="pt-4 border-t border-app-border">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-app-muted">Stress (1-10)</label>
                <input
                  type="range"
                  name="stressLevel"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-xl font-bold text-rose-500 dark:text-rose-400">{formData.stressLevel}</div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-app-muted">Mood (1-10)</label>
                <input
                  type="range"
                  name="mood"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-xl font-bold text-yellow-500 dark:text-yellow-400">{formData.mood}</div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-app-muted">Nutrition (1-10)</label>
                <input
                  type="range"
                  name="nutritionScore"
                  min="1"
                  max="10"
                  value={formData.nutritionScore}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                 <div className="text-center text-xl font-bold text-emerald-500 dark:text-emerald-400">{formData.nutritionScore}</div>
              </div>
           </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" /> Save Daily Log
        </button>
      </form>
    </div>
  );
};

export default DailyTrack;