import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, MessageSquare, User, Settings, Activity, LogOut, Sun, Moon, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/track', label: 'Daily Track', icon: PlusCircle },
    { path: '/coach', label: 'AI Coach', icon: MessageSquare },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-app-bg text-app-text overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-app-surface border-r border-app-border transition-colors duration-300">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">X4U Bio</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                    : 'text-app-muted hover:bg-app-hover hover:text-app-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-app-muted group-hover:text-app-text'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mb-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-app-bg border border-app-border text-app-muted hover:text-app-text transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="p-4 border-t border-app-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-slate-200">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-app-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-app-bg transition-colors duration-300">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-app-surface border-b border-app-border flex items-center justify-between px-4 z-20">
           <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-xl">X4U Bio</span>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2 text-app-muted">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="flex gap-3">
               {navItems.map(item => (
                 <Link key={item.path} to={item.path} className={`${location.pathname === item.path ? 'text-primary-500' : 'text-app-muted'}`}>
                   <item.icon className="w-6 h-6" />
                 </Link>
               ))}
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;