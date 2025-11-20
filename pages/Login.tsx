import React, { useState } from 'react';
import { Activity, AlertCircle, Copy, Mail, Lock, User, Ruler, Weight, Calendar, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const { signIn, login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    age: 25,
    weight: 70,
    height: 170
  });

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegData(prev => ({
      ...prev,
      [name]: (name === 'age' || name === 'weight' || name === 'height') ? Number(value) : value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(regData);
      navigate('/');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const isDomainError = error?.startsWith("DOMAIN_ERROR");
  const currentDomain = isDomainError ? error?.split(": ")[1] : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-text p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* --- Motion Graphics Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Blob 1 */}
        <motion.div 
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen"
        />
        
        {/* Animated Blob 2 */}
        <motion.div 
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 100, -50, 0],
            scale: [1, 1.1, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen"
        />
      </div>

      {/* --- Main Card --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px]"
      >
        <div className="bg-app-surface/80 backdrop-blur-2xl border border-app-border rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Branding Header */}
          <div className="p-8 pb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/10 to-transparent" />
            
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative bg-gradient-to-tr from-primary-500 to-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30"
            >
              <Activity className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-app-text mb-1 tracking-tight"
            >
              X4U Bio
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-app-muted text-sm font-medium"
            >
              Next Gen AI Health Optimization
            </motion.p>
          </div>

          {/* Toggle Tabs */}
          <div className="px-8 mb-6">
            <div className="relative bg-app-bg p-1 rounded-xl flex border border-app-border">
              <motion.div 
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm"
                initial={false}
                animate={{ 
                  x: isLogin ? 0 : '100%',
                  width: '50%' 
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              
              <button 
                onClick={() => { setIsLogin(true); clearError(); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${isLogin ? 'text-app-text' : 'text-app-muted hover:text-app-text'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsLogin(false); clearError(); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${!isLogin ? 'text-app-text' : 'text-app-muted hover:text-app-text'}`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-8 mb-4 overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="w-full">
                      {isDomainError ? (
                        <>
                          <p className="font-bold mb-1">Authorization Required</p>
                          <div className="bg-black/10 dark:bg-black/30 p-2 rounded border border-red-500/20 flex items-center justify-between mb-2">
                            <code className="text-xs font-mono truncate pr-2">{currentDomain}</code>
                            <button 
                              onClick={() => navigator.clipboard.writeText(currentDomain || "")}
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded flex-shrink-0"
                              title="Copy Domain"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs">
                             Whitelist this domain in Firebase Console.
                          </p>
                        </>
                      ) : (
                        <p>{error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms Container */}
          <div className="px-8 pb-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                /* LOGIN FORM */
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-4"
                >
                  <div className="group">
                    <label className="block text-xs font-medium text-app-muted mb-1.5 ml-1 group-focus-within:text-primary-500 transition-colors">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted group-focus-within:text-primary-500 transition-colors" />
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-app-input border border-app-border rounded-xl py-3.5 pl-10 pr-4 text-app-text text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-medium text-app-muted mb-1.5 ml-1 group-focus-within:text-primary-500 transition-colors">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted group-focus-within:text-primary-500 transition-colors" />
                      <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-app-input border border-app-border rounded-xl py-3.5 pl-10 pr-4 text-app-text text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>

                  <div className="relative my-6">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-app-border"></div></div>
                     <div className="relative flex justify-center text-xs uppercase"><span className="bg-app-surface px-2 text-app-muted">Or continue with</span></div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={signIn}
                    className="w-full bg-app-bg border border-app-border text-app-text font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-app-hover"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </motion.button>
                </motion.form>
              ) : (
                /* REGISTRATION FORM */
                <motion.form 
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegisterSubmit} 
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label className="block text-xs font-medium text-app-muted mb-1 ml-1 group-focus-within:text-primary-500 transition-colors">Full Name</label>
                      <input 
                        name="fullName"
                        value={regData.fullName}
                        onChange={handleRegChange}
                        className="w-full bg-app-input border border-app-border rounded-xl p-2.5 text-app-text text-sm focus:border-primary-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-medium text-app-muted mb-1 ml-1 group-focus-within:text-primary-500 transition-colors">Username</label>
                      <input 
                        name="username"
                        value={regData.username}
                        onChange={handleRegChange}
                        className="w-full bg-app-input border border-app-border rounded-xl p-2.5 text-app-text text-sm focus:border-primary-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-medium text-app-muted mb-1 ml-1 group-focus-within:text-primary-500 transition-colors">Email</label>
                    <input 
                      type="email"
                      name="email"
                      value={regData.email}
                      onChange={handleRegChange}
                      className="w-full bg-app-input border border-app-border rounded-xl p-2.5 text-app-text text-sm focus:border-primary-500 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-xs font-medium text-app-muted mb-1 ml-1 group-focus-within:text-primary-500 transition-colors">Password</label>
                    <input 
                      type="password"
                      name="password"
                      value={regData.password}
                      onChange={handleRegChange}
                      className="w-full bg-app-input border border-app-border rounded-xl p-2.5 text-app-text text-sm focus:border-primary-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="group">
                       <label className="flex items-center gap-1 text-xs font-medium text-app-muted mb-1 group-focus-within:text-primary-500">
                         <Calendar className="w-3 h-3" /> Age
                       </label>
                       <input 
                         type="number"
                         name="age"
                         value={regData.age}
                         onChange={handleRegChange}
                         className="w-full bg-app-input border border-app-border rounded-xl p-2 text-app-text text-sm text-center focus:border-primary-500 outline-none transition-all"
                         required
                       />
                    </div>
                    <div className="group">
                       <label className="flex items-center gap-1 text-xs font-medium text-app-muted mb-1 group-focus-within:text-primary-500">
                         <Weight className="w-3 h-3" /> Wgt (kg)
                       </label>
                       <input 
                         type="number"
                         name="weight"
                         value={regData.weight}
                         onChange={handleRegChange}
                         className="w-full bg-app-input border border-app-border rounded-xl p-2 text-app-text text-sm text-center focus:border-primary-500 outline-none transition-all"
                         required
                       />
                    </div>
                    <div className="group">
                       <label className="flex items-center gap-1 text-xs font-medium text-app-muted mb-1 group-focus-within:text-primary-500">
                         <Ruler className="w-3 h-3" /> Hgt (cm)
                       </label>
                       <input 
                         type="number"
                         name="height"
                         value={regData.height}
                         onChange={handleRegChange}
                         className="w-full bg-app-input border border-app-border rounded-xl p-2 text-app-text text-sm text-center focus:border-primary-500 outline-none transition-all"
                         required
                       />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20"
                  >
                     {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="text-center mt-6 text-app-muted text-xs">
          <p>&copy; 2025 X4U Bio. All rights reserved.</p>
        </div>
      </motion.div>

    </div>
  );
};

export default Login;