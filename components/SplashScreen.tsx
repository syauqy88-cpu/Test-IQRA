
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-between overflow-hidden select-none z-[100]">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill="#059669" />
          </pattern>
          <rect width="100" height="100" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      {/* Top Spacer */}
      <div className="h-24"></div>

      {/* Main Content: Arabic Verse & Translation */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-10 w-full max-w-4xl text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <h1 className="quranic-typography text-5xl md:text-7xl lg:text-8xl text-emerald-950 font-bold leading-tight drop-shadow-sm">
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent mx-auto rounded-full"
            ></motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <p className="text-xl md:text-3xl text-[#1B1C57] font-black tracking-tight leading-tight italic">
              "Bacalah dengan nama tuhanmu yang menciptakan"
            </p>
            <div className="flex items-center justify-center space-x-3 text-emerald-600/30">
              <span className="w-10 h-px bg-emerald-100"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Surah Al-'Alaq</span>
              <span className="w-10 h-px bg-emerald-100"></span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer: Advancekids Logo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="relative z-10 w-full flex flex-col items-center space-y-4 pb-16"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
             <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-20 rounded-full scale-150 animate-pulse"></div>
             <Logo size="md" className="relative z-10" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-[#1B1C57] text-2xl font-black tracking-tighter uppercase leading-none">Advancekids</h2>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.6em] mt-3 opacity-50">Media Pendidikan Pintar</p>
          </div>
        </div>
      </motion.div>

      {/* Discreet Loading Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.5, ease: "linear" }}
          className="h-full bg-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        ></motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
