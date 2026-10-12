import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './components/SplashScreen.tsx';
import LoginPage from './components/LoginPage.tsx';
import ProfileSetup from './components/ProfileSetup.tsx';
import ProfileView from './components/ProfileView.tsx';
import LevelDetail from './components/LevelDetail.tsx';
import SubMenu from './components/SubMenu.tsx';
import PracticeSession from './components/PracticeSession.tsx';
import Quiz from './components/Quiz.tsx';
import { User, AppState, IqraLevel } from './types.ts';
import { IQRA_LEVELS } from './constants.tsx';
import './index.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<IqraLevel | null>(null);
  
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  useEffect(() => {
    const savedUser = localStorage.getItem('advancekids_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('advancekids_user', JSON.stringify(user));
  }, [user]);

  const handleLevelSelect = (level: IqraLevel) => {
    setSelectedLevel(level);
    setAppState(AppState.SUBMENU);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.SPLASH: return <SplashScreen onFinish={() => user ? setAppState(AppState.MENU) : setAppState(AppState.LOGIN)} />;
      case AppState.LOGIN: return <LoginPage onLogin={() => setAppState(AppState.PROFILE_SETUP)} />;
      case AppState.PROFILE_SETUP: return <ProfileSetup onComplete={(u) => { setUser(u); setAppState(AppState.MENU); }} />;
      case AppState.MENU: return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 md:space-y-12 pb-24 flex flex-col min-h-screen"
        >
          <header className="flex justify-between items-center py-4">
            <h1 className="text-xl md:text-2xl font-black text-[#1B1C57] tracking-tight">IQRA PINTAR</h1>
            <button 
              onClick={() => setAppState(AppState.PROFILE_VIEW)} 
              className="flex items-center space-x-2 md:space-x-3 bg-white p-1.5 md:p-2 rounded-full shadow-lg border border-emerald-50 transition-transform active:scale-95"
            >
              <img src={user?.photoURL} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-emerald-400 object-cover" />
              <span className="text-xs md:text-sm font-bold pr-3 md:pr-4 truncate max-w-[100px]">{user?.name}</span>
            </button>
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {IQRA_LEVELS.map(level => (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={level.id} 
                onClick={() => handleLevelSelect(level)} 
                className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-left transition-all bg-white shadow-xl hover:shadow-emerald-900/5 group relative overflow-hidden border border-transparent hover:border-emerald-100"
              >
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${level.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                  {level.icon}
                </div>
                <h3 className="text-lg md:text-xl font-black text-[#1B1C57]">{level.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium line-clamp-2">{level.subtitle}</p>
                <div className="mt-4 flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Mula Belajar</span>
                  <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      );
      case AppState.SUBMENU: return selectedLevel && <SubMenu level={selectedLevel} onBack={() => setAppState(AppState.MENU)} onSelectOption={(opt) => setAppState(opt as any)} />;
      case AppState.PRACTICE: return selectedLevel && <PracticeSession level={selectedLevel} onBack={() => setAppState(AppState.SUBMENU)} onFinish={() => setAppState(AppState.QUIZ)} />;
      case AppState.QUIZ: return selectedLevel && <Quiz level={selectedLevel} onBack={() => setAppState(AppState.SUBMENU)} onFinish={() => setAppState(AppState.MENU)} />;
      case AppState.PROFILE_VIEW: return user && <ProfileView user={user} unlockedLevels={unlockedLevels} levels={IQRA_LEVELS} onBack={() => setAppState(AppState.MENU)} onUpdateUser={setUser} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
