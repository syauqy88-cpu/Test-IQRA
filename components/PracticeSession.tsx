import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  RotateCcw,
  Volume2,
  Loader2,
  BookOpen,
  Star
} from 'lucide-react';
import { IQRA_1_LETTERS, IQRA_2_DATA, IQRA_3_DATA, IQRA_4_DATA, IQRA_5_DATA, IQRA_6_DATA, IQRA_7_DATA, IQRA_8_DATA, JUZ_30_DATA, BISMILLAH, Surah } from '../constants.tsx';
import { IqraLevel } from '../types.ts';
import { GoogleGenAI, Modality } from "@google/genai";
import Copyright from './Copyright.tsx';

interface PracticeSessionProps {
  level: IqraLevel;
  onBack: () => void;
  onFinish: () => void;
}

// Audio Utils
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ level, onBack, onFinish }) => {
  const isIqra1 = level.id === 1;
  const isIqra7 = level.id === 7;
  const isIqra8 = level.id === 8;
  const isJuz30 = level.id === 9;
  const hasReview = level.id >= 1 && level.id <= 4; 

  const data = useMemo(() => {
    switch(level.id) {
      case 2: return IQRA_2_DATA;
      case 3: return IQRA_3_DATA;
      case 4: return IQRA_4_DATA;
      case 5: return IQRA_5_DATA;
      case 6: return IQRA_6_DATA;
      case 7: return IQRA_7_DATA;
      case 8: return IQRA_8_DATA;
      case 9: return JUZ_30_DATA;
      default: return IQRA_1_LETTERS;
    }
  }, [level.id]);
  
  const [mode, setMode] = useState<'SEQUENTIAL' | 'REVIEW'>('SEQUENTIAL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewPage, setReviewPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState<number | string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const [selectedSurahIndex, setSelectedSurahIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const reviewGrids = useMemo(() => {
    if (!hasReview) return [];
    const grids = [];
    let flatPool: string[] = [];
    if (level.id === 1) flatPool = IQRA_1_LETTERS;
    else if (level.id === 2) flatPool = IQRA_2_DATA.flat();
    else if (level.id === 3) flatPool = IQRA_3_DATA.flat();
    else if (level.id === 4) flatPool = [...IQRA_4_DATA.flatMap(g => g.slice(3)), ...IQRA_3_DATA.flat()];
      
    for (let i = 0; i < 6; i++) {
      grids.push([...flatPool].sort(() => Math.random() - 0.5).slice(0, 16)); 
    }
    return grids;
  }, [level.id, hasReview]);

  const nextItem = () => {
    if (currentIndex < data.length - 1) setCurrentIndex(currentIndex + 1);
    else hasReview ? (setMode('REVIEW'), setReviewPage(0)) : onFinish();
  };

  const prevItem = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

  const nextReviewPage = () => reviewPage < 5 ? setReviewPage(reviewPage + 1) : onFinish();
  const prevReviewPage = () => reviewPage > 0 ? setReviewPage(reviewPage - 1) : (setMode('SEQUENTIAL'), setCurrentIndex(data.length - 1));

  const handleSurahNext = () => {
    if (selectedSurahIndex !== null && selectedSurahIndex < JUZ_30_DATA.length - 1) {
      setSelectedSurahIndex(selectedSurahIndex + 1);
    }
  };

  const handleSurahBack = () => {
    if (selectedSurahIndex !== null && selectedSurahIndex > 0) {
      setSelectedSurahIndex(selectedSurahIndex - 1);
    } else {
      setSelectedSurahIndex(null);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSignificant = Math.abs(distance) > minSwipeDistance;

    if (isSignificant) {
      if (isJuz30 && selectedSurahIndex !== null) {
        if (distance < 0) handleSurahNext();
        else handleSurahBack();
      } else {
        if (distance < 0) {
          mode === 'SEQUENTIAL' ? nextItem() : nextReviewPage();
        } else {
          mode === 'SEQUENTIAL' ? prevItem() : prevReviewPage();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const playTTS = async (letter: string) => {
    if (isLoadingAudio) return;
    setIsLoadingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Sebutkan ayat atau huruf ini dengan makhraj yang tepat: ${letter}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioCtxRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error(e); } finally { setIsLoadingAudio(false); }
  };

  const handleBoxClick = (letter: string, id: number | string) => {
    setIsAnimating(id);
    playTTS(letter);
    setTimeout(() => setIsAnimating(null), 400);
  };

  const contentInfo = useMemo(() => {
    if (isIqra7) {
      if (currentIndex <= 5) return { tajuk: 'Izhar Halqi', cara: 'Jelas & Nyata (Tanpa Dengung)', huruf: 'ء هـ ع ح غ خ' };
      if (currentIndex <= 7) return { tajuk: 'Idgham Ma\'al Ghunnah', cara: 'Masuk serta Dengung (2 Harakat)', huruf: 'ي ن م و' };
      if (currentIndex === 8) return { tajuk: 'Idgham Bila Ghunnah', cara: 'Masuk tanpa Dengung', huruf: 'ل ر' };
      if (currentIndex === 9) return { tajuk: 'Iqlab', cara: 'Tukar suara Nun/Tanwin kepada Mim (Dengung)', huruf: 'ب' };
      if (currentIndex <= 11) return { tajuk: 'Ikhfa\' Haqiqi', cara: 'Samar-samar (Sembunyi) serta Dengung', huruf: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك' };
      if (currentIndex <= 21) return { tajuk: 'Latihan Campuran', cara: 'Kenalpasti Hukum Nun Mati', huruf: 'Hukum-hukum Nun Mati' };
      if (currentIndex === 22) return { tajuk: 'Ikhfa\' Syafawi', cara: 'Sembunyi suara Mim bertemu Ba (Dengung)', huruf: 'Mim Mati + ب' };
      if (currentIndex === 23) return { tajuk: 'Idgham Mimi', cara: 'Masuk suara Mim bertemu Mim (Dengung)', huruf: 'Mim Mati + م' };
      if (currentIndex <= 25) return { tajuk: 'Izhar Syafawi', cara: 'Jelas suara Mim (Tanpa Dengung)', huruf: 'Mim Mati + Selain م/ب' };
      return { tajuk: 'Latihan Ayat Panjang', cara: 'Latihan Fasahah & Tajwid', huruf: 'Makhraj & Tajwid' };
    }
    return null;
  }, [isIqra7, currentIndex]);

  const colorTheme = useMemo(() => {
    switch(level.id) {
      case 9: return 'amber';
      case 8: return 'rose';
      case 7: return 'fuchsia';
      case 6: return 'violet';
      case 5: return 'indigo';
      default: return 'emerald';
    }
  }, [level.id]);

  const currentStep = mode === 'SEQUENTIAL' ? currentIndex + 1 : data.length + reviewPage + 1;
  const totalSteps = hasReview ? data.length + 6 : data.length;
  const progress = (currentStep / totalSteps) * 100;

  if (isJuz30) {
    if (selectedSurahIndex === null) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center bg-white min-h-screen" 
          onTouchStart={onTouchStart} 
          onTouchMove={onTouchMove} 
          onTouchEnd={onTouchEnd}
        >
          <div className="w-full flex justify-between items-center mb-10">
             <button 
               onClick={onBack} 
               className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl hover:bg-gray-50 text-amber-600 transition-all flex items-center space-x-2 active:scale-90"
             >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Utama</span>
             </button>
             <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Juz Amma</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full pb-20">
            {JUZ_30_DATA.map((surah, idx) => (
              <motion.button 
                key={surah.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedSurahIndex(idx)}
                className="p-5 md:p-6 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-amber-200 transition-all text-left flex items-center space-x-5 group active:scale-95"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform">
                  {surah.id}
                </div>
                <div className="flex-1">
                   <h3 className="text-lg font-black text-[#1B1C57]">Surah {surah.name}</h3>
                   <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">{surah.verses.length} Ayat</p>
                </div>
              </motion.button>
            ))}
          </div>
          <Copyright />
        </motion.div>
      );
    }

    const surah = JUZ_30_DATA[selectedSurahIndex];
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col items-center bg-slate-50 min-h-screen" 
        onTouchStart={onTouchStart} 
        onTouchMove={onTouchMove} 
        onTouchEnd={onTouchEnd}
      >
         <div className="w-full flex justify-between items-center mb-3 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-30 py-2 px-2">
            <button 
              onClick={() => setSelectedSurahIndex(null)} 
              className="p-2 bg-white border border-gray-100 shadow-sm rounded-xl hover:bg-amber-50 text-amber-600 transition-all flex items-center space-x-2 active:scale-90"
            >
               <ArrowLeft className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Senarai</span>
            </button>
            <div className="text-center">
               <h2 className="text-lg md:text-xl font-black text-gray-950 leading-none">Surah {surah.name}</h2>
               <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mt-0.5">BACAAN JUZ AMMA</span>
            </div>
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Swipe: Navigasi</p>
            </div>
         </div>

         <div className="w-full max-w-4xl flex-1 overflow-y-auto px-1 pb-16 custom-scrollbar">
            <div className="w-full bg-white p-4 sm:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center min-h-[70vh]">
               <div className="mb-6 text-center py-4 border-b border-gray-50 w-full">
                  <span className="quranic-typography text-2xl sm:text-3xl text-emerald-950/70 block mb-2">
                     {BISMILLAH}
                  </span>
                  <div className="w-12 h-1 bg-amber-200 mx-auto rounded-full"></div>
               </div>

               <div className="w-full flex flex-col space-y-2" dir="rtl">
                  {surah.verses.map((v, i) => (
                     <motion.button 
                       key={i}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       onClick={() => handleBoxClick(v, i)}
                       className={`w-full flex items-center text-right space-x-3 space-x-reverse transition-all duration-200 py-4 px-4 rounded-2xl group border-2 active:scale-[0.98] ${isAnimating === i ? 'bg-amber-50 border-amber-300 scale-[1.01]' : 'bg-white border-transparent hover:bg-slate-50'}`}
                     >
                        <div className="w-10 h-10 flex-shrink-0 rounded-xl border border-amber-100 flex items-center justify-center text-[10px] font-black text-amber-500 shadow-xs transition-all group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500">
                           {i + 1}
                        </div>
                        
                        <div className="flex-1">
                           <span className="quranic-typography text-3xl sm:text-4xl lg:text-5xl text-black block leading-tight drop-shadow-sm tracking-normal">
                              {v}
                           </span>
                        </div>
                        {isLoadingAudio && isAnimating === i && (
                          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        )}
                     </motion.button>
                  ))}
               </div>

               <div className="mt-12 pt-8 border-t border-gray-50 w-full text-center space-y-2">
                  <div className="inline-block p-2 bg-emerald-50 rounded-full text-2xl">✨</div>
                  <h4 className="text-lg font-black text-gray-900">Mumtaz!</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Satu huruf sepuluh kebaikan.</p>
               </div>
            </div>
         </div>

         <div className="w-full max-w-lg grid grid-cols-2 gap-3 pt-3 pb-5 bg-slate-50/95 backdrop-blur-sm sticky bottom-0 z-30 px-3">
            <button 
              onClick={handleSurahBack} 
              className="py-4 bg-white border border-gray-200 rounded-xl font-black text-gray-500 hover:text-amber-600 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
               <ChevronLeft className="w-4 h-4" />
               <span>KEMBALI</span>
            </button>
            <button 
              onClick={handleSurahNext} 
              disabled={selectedSurahIndex === JUZ_30_DATA.length - 1} 
              className="py-4 bg-amber-600 rounded-xl font-black text-white shadow-lg hover:brightness-110 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 disabled:opacity-30 active:scale-95"
            >
               <span>SETERUSNYA</span>
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>
         <Copyright />
      </motion.div>
    );
  }

  const currentItems = Array.isArray(data[currentIndex]) ? data[currentIndex] : [data[currentIndex]];
  const isLargeFocus = isIqra1;
  const isAdvanced = level.id >= 5;

  if (isIqra8) {
    const waqaf = IQRA_8_DATA[currentIndex];
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center bg-white min-h-screen" 
        onTouchStart={onTouchStart} 
        onTouchMove={onTouchMove} 
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full flex justify-between items-center mb-10">
          <button 
            onClick={onBack} 
            className="p-2 text-gray-400 hover:text-rose-600 transition-colors flex items-center space-x-2 group active:scale-90"
          >
             <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-rose-50 transition-all">
                <ArrowLeft className="w-5 h-5" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest">Batal</span>
          </button>
          <div className="flex-1 mx-4 md:mx-8 h-1.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
             <motion.div 
               className="h-full bg-rose-500" 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5 }}
             ></motion.div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{waqaf.name}</span>
            <span className="text-sm font-bold text-gray-900">{currentStep}/{totalSteps}</span>
          </div>
        </div>

        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-rose-900/10 border border-rose-50 flex flex-col items-center text-center space-y-6 mb-12 md:mb-16"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-600 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center text-white text-4xl md:text-5xl quranic-typography shadow-xl shadow-rose-200 rotate-3 transition-transform hover:rotate-0 duration-500">
            {waqaf.sign}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{waqaf.name}</h2>
            <p className="px-6 md:px-8 py-3 bg-rose-50 text-rose-700 font-bold rounded-full border border-rose-100 text-xs md:text-sm italic leading-relaxed">
              "{waqaf.rule}"
            </p>
          </div>
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16" dir="rtl">
          {waqaf.examples.map((ex, idx) => (
            <motion.button 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleBoxClick(ex, idx)}
              className={`bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-gray-100 shadow-sm p-8 md:p-10 flex items-center justify-center text-center transition-all duration-500 hover:shadow-2xl hover:border-rose-200 hover:-translate-y-2 group active:scale-95 relative ${isAnimating === idx ? 'scale-95 border-rose-500 bg-rose-50/20' : ''}`}
            >
              <span className="quranic-typography text-xl sm:text-2xl md:text-3xl text-gray-950 leading-[2.2] select-none block">
                {ex}
              </span>
              {isLoadingAudio && isAnimating === idx && (
                <div className="absolute top-4 left-4">
                  <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="w-full max-w-xl grid grid-cols-2 gap-4 md:gap-6 pb-12">
          <button 
            onClick={prevItem} 
            disabled={currentIndex === 0} 
            className="py-5 md:py-6 bg-white border-2 border-gray-100 rounded-2xl md:rounded-3xl font-black text-gray-400 hover:text-rose-600 disabled:opacity-20 transition-all uppercase tracking-widest text-[10px] active:scale-95"
          >
            KEMBALI
          </button>
          <button 
            onClick={nextItem} 
            className="py-5 md:py-6 bg-rose-600 rounded-2xl md:rounded-3xl font-black text-white shadow-xl hover:brightness-110 transition-all uppercase tracking-widest text-[10px] active:scale-95"
          >
            SETERUSNYA
          </button>
        </div>
        <Copyright />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center bg-white min-h-screen" 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
    >
      <div className="w-full flex justify-between items-center mb-10">
        <button 
          onClick={onBack} 
          className={`p-2 text-gray-400 hover:text-${colorTheme}-600 transition-colors flex items-center space-x-2 active:scale-90`}
        >
           <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-emerald-50">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest">Batal</span>
        </button>
        <div className="flex-1 mx-4 md:mx-8 h-1.5 bg-gray-50 rounded-full overflow-hidden shadow-inner">
           <motion.div 
             className={`h-full bg-${colorTheme}-500`} 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.5 }}
           ></motion.div>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-black text-${colorTheme}-600 uppercase tracking-widest`}>{mode === 'SEQUENTIAL' ? (contentInfo?.tajuk || level.title) : 'REVIEW'}</span>
          <p className="text-sm font-bold text-gray-900">{currentStep}/{totalSteps}</p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center space-y-6 md:space-y-10 flex-1 justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode === 'SEQUENTIAL' ? currentIndex : `review-${reviewPage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center space-y-6 md:space-y-10"
          >
            {mode === 'SEQUENTIAL' && contentInfo && (
              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">{contentInfo.tajuk}</h2>
                  {isIqra7 && (
                    <div className="flex flex-col items-center space-y-1 mt-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cara Bacaan</span>
                      <p className={`text-xs md:text-sm font-black text-${colorTheme}-600 uppercase tracking-widest italic bg-${colorTheme}-50 px-6 py-2 rounded-full border border-${colorTheme}-100 shadow-sm`}>
                        {contentInfo.cara}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center pt-2">
                  <span className={`text-[10px] font-black text-${colorTheme}-500 uppercase tracking-widest`}>HURUF TERLIBAT</span>
                  <span className={`text-3xl md:text-4xl font-bold text-${colorTheme}-600 quranic-typography mt-1 drop-shadow-sm`}>{contentInfo.huruf}</span>
                </div>
              </div>
            )}
            
            {mode === 'SEQUENTIAL' && !contentInfo && (
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">{level.title}</h2>
                <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">{level.subtitle}</p>
              </div>
            )}

            <div className={`w-full grid gap-4 md:gap-8 ${isLargeFocus ? 'grid-cols-1 max-w-[280px] md:max-w-xs' : (level.id >= 4 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-2 sm:grid-cols-3 max-w-4xl')}`} dir="rtl">
              {mode === 'SEQUENTIAL' ? (currentItems as string[]).map((word: string, idx: number) => (
                <motion.button 
                  key={idx} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBoxClick(word, idx)}
                  className={`w-full bg-white shadow-xl border-4 border-gray-50 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center p-6 md:p-10 transition-all duration-500 relative group ${isAnimating === idx ? 'border-emerald-400 bg-emerald-50/30 shadow-inner' : 'hover:shadow-2xl hover:border-emerald-100'}`}
                >
                  <span className={`arabic-text font-black text-center transition-transform duration-500 select-none ${isLargeFocus ? 'text-[8rem] sm:text-[12rem] md:text-[14rem] leading-none' : (isAdvanced ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-6xl md:text-7xl')}`}>
                    {word}
                  </span>
                  {isLoadingAudio && isAnimating === idx && (
                    <div className="absolute top-6 left-6 md:top-10 md:left-10">
                      <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 animate-spin" />
                    </div>
                  )}
                </motion.button>
              )) : (
                <div className="col-span-full grid grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl p-4 md:p-8 bg-emerald-50 rounded-[2rem] md:rounded-[3rem] border-2 border-emerald-100">
                  {(reviewGrids[reviewPage] as string[]).map((letter: string, idx: number) => (
                    <motion.button 
                      key={idx} 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBoxClick(letter, idx)}
                      className={`aspect-square bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-4xl font-black transition-all border-2 border-transparent shadow-sm hover:border-emerald-300 ${isAnimating === idx ? 'border-emerald-500 shadow-xl' : ''}`}
                    >
                      <span className="arabic-text">{letter}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-xl grid grid-cols-2 gap-4 md:gap-5 mt-12 md:mt-16 pb-12">
        <button 
          onClick={mode === 'SEQUENTIAL' ? prevItem : prevReviewPage} 
          disabled={mode === 'SEQUENTIAL' && currentIndex === 0} 
          className="py-4 md:py-5 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl font-black text-gray-400 hover:text-emerald-600 transition-all uppercase tracking-widest text-[10px] shadow-sm active:scale-95"
        >
          KEMBALI
        </button>
        <button 
          onClick={mode === 'SEQUENTIAL' ? nextItem : nextReviewPage} 
          className={`py-4 md:py-5 bg-${colorTheme}-600 rounded-xl md:rounded-2xl font-black text-white shadow-xl hover:brightness-110 transition-all uppercase tracking-widest text-[10px] active:scale-95`}
        >
          {mode === 'SEQUENTIAL' ? (currentIndex === data.length - 1 ? (hasReview ? 'ULANGKAJI' : 'SELESAI') : 'SETERUSNYA') : (reviewPage === 5 ? 'SELESAI' : 'SETERUSNYA')}
        </button>
      </div>
      <Copyright />
    </motion.div>
  );
};

export default PracticeSession;