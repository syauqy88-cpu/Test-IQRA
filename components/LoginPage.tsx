import React, { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import Copyright from './Copyright';
import { ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-10 flex flex-col items-center border border-white relative"
      >
        
        <div className="text-center space-y-4 mb-8 md:mb-10">
          <Logo size="md" className="scale-110" />
        </div>

        <div className="w-full space-y-6 md:space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#1B1C57] tracking-tight">Jom Belajar!</h2>
            <p className="text-gray-500 font-medium text-sm px-2 md:px-4">Terokai dunia IQRA dengan cara yang menyeronokkan dan pintar.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-4 px-6 py-5 md:px-8 md:py-6 bg-emerald-600 text-white rounded-[1.5rem] md:rounded-[2rem] hover:bg-emerald-700 transition-all duration-300 group shadow-xl shadow-emerald-100 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="font-black text-lg md:text-xl tracking-tight">MULA BELAJAR</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </motion.button>

          <div className="flex flex-col items-center space-y-4 pt-4">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <img key={i} src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${i+100}`} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm" alt="user" />
              ))}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] font-black text-emerald-600 shadow-sm">+2k</div>
            </div>
            <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] text-center">Semua Modul Kini Dibuka Untuk Anda!</p>
          </div>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Copyright />
      </motion.div>
    </div>
  );
};

export default LoginPage;
