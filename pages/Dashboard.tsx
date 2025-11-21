import React, { useEffect, useState } from 'react';

import {

  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell

} from 'recharts';

import { Droplets, Moon, Footprints, Brain, ArrowUpRight, AlertTriangle, Sparkles, Activity } from 'lucide-react';

import { getMetrics, getUserProfile } from '../services/dataService';

import { generateHealthInsights } from '../services/geminiService';

import { DailyMetric, UserProfile, HealthAnalysis } from '../types';

import { useTheme } from '../context/ThemeContext';



const Dashboard: React.FC = () => {

  const [metrics, setMetrics] = useState<DailyMetric[]>([]);

  const [user, setUser] = useState<UserProfile | null>(null);

  const [insights, setInsights] = useState<HealthAnalysis | null>(null);

  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();



  useEffect(() => {

    const loadData = async () => {

      const [m, u] = await Promise.all([getMetrics(), getUserProfile()]);

      setMetrics(m);

      setUser(u);



      if (u && m.length > 0) {

        const analysis = await generateHealthInsights(u, m);

        setInsights(analysis);

      }

      setLoading(false);

    };

    loadData();

  }, []);



  const chartData = metrics.slice(-7).map(m => ({

    name: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),

    sleep: m.sleepHours,

    stress: m.stressLevel,

    steps: m.steps

  }));



  const StatCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (

    <div className="bg-app-surface border border-app-border rounded-2xl p-5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-sm">

      <div className="flex justify-between items-start mb-4">

        <div className={`p-2 rounded-lg bg-opacity-20 ${color.bg}`}>

          <Icon className={`w-5 h-5 ${color.text}`} />

        </div>

        {trend && <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1">

          <ArrowUpRight className="w-3 h-3" /> {trend}

        </span>}

      </div>

      <div>

        <h3 className="text-app-muted text-sm font-medium mb-1">{title}</h3>

        <div className="flex items-baseline gap-1">

          <span className="text-2xl font-bold text-app-text">{value}</span>

          <span className="text-app-muted text-sm">{unit}</span>

        </div>

      </div>

    </div>

  );



  if (loading) return <div className="p-8 text-center text-app-muted">Loading your health profile...</div>;



  const today = metrics[metrics.length - 1] || { steps: 0, sleepHours: 0, waterIntake: 0, stressLevel: 0 };

  const isDark = theme === 'dark';



  return (

    <div className="space-y-6 max-w-7xl mx-auto">

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">

        <div>

          <h1 className="text-3xl font-bold text-app-text mb-2">Hello, {user?.displayName?.split(' ')[0]} 👋</h1>

          <p className="text-app-muted">Here's your daily health overview</p>

        </div>

        <div className="flex gap-2">

          <span className="bg-primary-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-primary-600/20">

            Daily Score: {insights?.score ?? 85}

          </span>

        </div>

      </div>



      {/* AI Insights Section */}

      {insights && (

        <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">

           <div className="absolute top-0 right-0 p-4 opacity-10">

              <Sparkles className="w-24 h-24 text-white" />

           </div>

           <div className="relative z-10">

             <h3 className="text-indigo-200 font-bold mb-2 flex items-center gap-2">

               <Brain className="w-5 h-5" /> AI Analysis

             </h3>

             <p className="text-white text-lg mb-4 font-light leading-relaxed">

               "{insights.summary}"

             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                {insights.recommendations.map((rec, i) => (

                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">

                    <div className="flex justify-between mb-2">

                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{rec.category}</span>

                      {rec.priority === 'High' && <AlertTriangle className="w-3 h-3 text-amber-400" />}

                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1">{rec.title}</h4>

                    <p className="text-xs text-indigo-100/80">{rec.description}</p>

                  </div>

                ))}

             </div>

           </div>

        </div>

      )}



      {/* Stats Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard

          title="Steps"

          value={today.steps}

          unit="steps"

          icon={Footprints}

          color={{ bg: 'bg-orange-500', text: 'text-orange-500' }}

        />

        <StatCard

          title="Sleep"

          value={today.sleepHours}

          unit="hrs"

          icon={Moon}

          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }}

        />

        <StatCard

          title="Hydration"

          value={today.waterIntake}

          unit="ml"

          icon={Droplets}

          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}

        />

        <StatCard

          title="Stress Level"

          value={today.stressLevel}

          unit="/ 10"

          icon={Activity}

          color={{ bg: 'bg-rose-500', text: 'text-rose-500' }}

        />

      </div>



      {/* Charts Row */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-app-surface border border-app-border rounded-2xl p-6 shadow-sm">

          <h3 className="text-lg font-semibold text-app-text mb-6">Activity & Sleep Trends</h3>

          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />

                <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />

                <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />

                <Tooltip

                  contentStyle={{

                    backgroundColor: isDark ? '#1e293b' : '#ffffff',

                    borderColor: isDark ? '#334155' : '#e2e8f0',

                    color: isDark ? '#fff' : '#0f172a',

                    borderRadius: '8px',

                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'

                  }}

                  itemStyle={{ color: isDark ? '#fff' : '#0f172a' }}

                />

                <Line type="monotone" dataKey="steps" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} />

                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>



        <div className="bg-app-surface border border-app-border rounded-2xl p-6 shadow-sm">

           <h3 className="text-lg font-semibold text-app-text mb-6">Stress Levels</h3>

           <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />

                <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />

                <Tooltip

                  cursor={{fill: 'transparent'}}

                  contentStyle={{

                    backgroundColor: isDark ? '#1e293b' : '#ffffff',

                    borderColor: isDark ? '#334155' : '#e2e8f0',

                    color: isDark ? '#fff' : '#0f172a',

                    borderRadius: '8px'

                  }}

                />

                <Bar dataKey="stress" radius={[4, 4, 0, 0]}>

                  {chartData.map((entry, index) => (

                    <Cell key={`cell-${index}`} fill={entry.stress > 7 ? '#ef4444' : '#22c55e'} />

                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

           </div>

        </div>

      </div>

    </div>

  );

};



export default Dashboard;