
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = false, size = 'md' }) => {
  const sizeClasses = {
    sm: { icon: 'w-10 h-10', text: 'text-lg' },
    md: { icon: 'w-16 h-16', text: 'text-2xl' },
    lg: { icon: 'w-32 h-32', text: 'text-4xl' },
    xl: { icon: 'w-48 h-48', text: 'text-6xl' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className} group`}>
      {/* Dolphin Icon SVG - With subtle floating animation */}
      <div className={`${currentSize.icon} relative mb-1 transition-transform duration-500 group-hover:scale-110`}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}
        </style>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-float">
          <path 
            d="M82 68C85 62 80 54 70 52C70 42 64 28 45 18C25 8 10 22 10 42C10 52 15 62 25 72C35 82 50 82 60 72C65 67 70 72 75 77C80 82 85 77 82 68Z" 
            fill="#1B1C57" 
          />
          <path 
            d="M80 67C83 61 78 53 68 51C68 41 62 27 43 17C23 7 8 21 8 41C8 51 13 61 23 71C33 81 48 81 58 71C63 66 68 71 73 76C78 81 83 76 80 67Z" 
            fill="#7EB5E6" 
          />
          <path 
            d="M22 41C22 51 27 61 37 66C47 71 57 66 62 61C57 56 52 41 37 36C22 31 22 36 22 41Z" 
            fill="#D9EAF9"
          />
          <circle cx="48" cy="32" r="4.5" fill="#1B1C57" />
          <circle cx="49.5" cy="30.5" r="1.5" fill="white" />
          <path 
            d="M55 42C58 45 62 44 64 43" 
            stroke="#1B1C57" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
          <path 
            d="M36 52C31 52 26 62 31 67" 
            stroke="#1B1C57" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          <path 
            d="M50 55C55 55 60 62 55 67" 
            stroke="#1B1C57" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className={`font-black tracking-tighter ${currentSize.text} flex items-baseline select-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <span className="text-[#ED1C24]" style={{ fontFamily: 'sans-serif' }}>EDISI</span>
          <span className="text-[#2E3192] ml-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>IQRA PINTAR</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
