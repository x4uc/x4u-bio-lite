import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/dataService';
import { UserProfile, ActivityLevel, Gender } from '../types';
import { Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
       const data = await getUserProfile();
       if (data) setProfile(data);
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({
        ...profile,
        [name]: (name === 'age' || name === 'weight' || name === 'height') ? Number(value) : value
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    await updateUserProfile(profile);
    setIsSaving(false);
  };

  if (!profile) return <div className="text-app-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-app-text">Profile Settings</h1>
          <p className="text-app-muted">Manage your physical attributes for better AI accuracy.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-app-surface border border-app-border rounded-2xl p-8 space-y-8 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-app-muted mb-2">Display Name</label>
            <input 
              type="text"
              name="displayName"
              value={profile.displayName || ''}
              onChange={handleChange}
              className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app-muted mb-2">Email</label>
            <input 
              type="email"
              value={profile.email || ''}
              disabled
              className="w-full bg-app-input/50 border border-app-border rounded-xl p-3 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="h-px bg-app-border"></div>

        <h3 className="text-lg font-semibold text-app-text">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Age</label>
                <input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all" />
            </div>
             <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Weight (kg)</label>
                <input type="number" name="weight" value={profile.weight} onChange={handleChange} className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all" />
            </div>
             <div>
                <label className="block text-sm font-medium text-app-muted mb-2">Height (cm)</label>
                <input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-sm font-medium text-app-muted mb-2">Gender</label>
              <select name="gender" value={profile.gender} onChange={handleChange} className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all">
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-app-muted mb-2">Activity Level</label>
              <select name="activityLevel" value={profile.activityLevel} onChange={handleChange} className="w-full bg-app-input border border-app-border rounded-xl p-3 text-app-text focus:border-primary-500 outline-none transition-all">
                  {Object.values(ActivityLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;