import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ChevronRight, 
  Trophy, 
  Star, 
  Target,
  ArrowLeft,
  Loader2,
  Lightbulb,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { IqraLevel } from '../types.ts';
import { getQuizQuestions } from '../services/geminiService.ts';
import { GoogleGenAI, Modality } from "@google/genai";
import Copyright from './Copyright.tsx';

interface QuizProps {
  level: IqraLevel;
  onBack: () => void;
  onFinish?: () => void;
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

const Quiz: React.FC<QuizProps> = ({ level, onBack, onFinish }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const data = await getQuizQuestions(level.id, level.title, level.subtitle, 10);
      if (data && data.questions) {
        setQuestions(data.questions);
      }
      setLoading(false);
    }
    loadQuiz();
  }, [level]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !isAnswered) return;
    
    const distance = touchStartX.current - touchEndX.current;
    if (distance < -minSwipeDistance) {
      handleNext();
    }
  };

  const playFeedback = async (isCorrect: boolean) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const text = isCorrect ? "Alhamdulillah, Bagus! Jawapan anda tepat." : "Cuba lagi ya, anda pasti boleh!";
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioCtxRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error("Feedback Audio Error:", e);
    }
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    const isCorrect = index === questions[currentStep].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    playFeedback(isCorrect);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 flex flex-col items-center justify-center space-y-6 min-h-screen">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-emerald-800 animate-pulse">Menyusun soalan mengikut tahap...</p>
          <p className="text-sm text-gray-400 italic">Menganalisis silibus {level.title} untuk anda.</p>
        </div>
        <Copyright />
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8 text-center space-y-8 flex flex-col items-center min-h-screen"
      >
        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-6xl shadow-inner animate-bounce">
          {score >= questions.length * 0.8 ? <Trophy className="w-16 h-16 text-emerald-600" /> : (score >= questions.length * 0.5 ? <Star className="w-16 h-16 text-emerald-600" /> : <Target className="w-16 h-16 text-emerald-600" />)}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            {score === questions.length ? 'Mumtaz!' : (score >= questions.length * 0.7 ? 'Jayyid Jiddan!' : 'Teruskan Usaha!')}
          </h2>
          <p className="text-lg md:text-xl text-gray-500">Anda telah menyelesaikan kuiz {level.title}.</p>
          {onFinish && score >= questions.length * 0.6 && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-600 font-bold bg-emerald-50 py-3 px-6 rounded-2xl mt-4 border border-emerald-100 inline-block animate-pulse"
            >
              🎉 Tahap Seterusnya Telah Dibuka!
            </motion.p>
          )}
        </div>
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-4 border-emerald-50 inline-block px-12 md:px-20 relative">
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Skor Akhir</p>
          <p className="text-6xl md:text-7xl font-black text-emerald-600">{score} / {questions.length}</p>
        </div>
        <div className="pt-8 flex flex-col items-center space-y-4 flex-1">
          <button 
            onClick={onFinish || onBack}
            className="px-12 md:px-16 py-4 md:py-5 bg-emerald-600 text-white rounded-2xl md:rounded-3xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Selesai & Kembali
          </button>
          <button onClick={onBack} className="text-gray-400 font-bold hover:text-rose-500 transition-colors">Tutup Kuiz</button>
        </div>
        <Copyright />
      </motion.div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors flex items-center space-x-1 group">
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-bold">Batal</span>
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Progress Kuiz</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400">
              {currentStep + 1} / {questions.length}
            </span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-emerald-500" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-2 border-emerald-50 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-2 md:w-3 h-full bg-emerald-500 group-hover:w-4 transition-all duration-300"></div>
              <div className="flex justify-center mb-4">
                 <span className="px-4 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                   {currentStep < 3 ? 'TAHAP: SENANG' : (currentStep < 7 ? 'TAHAP: SEDERHANA' : 'TAHAP: SUKAR')}
                 </span>
              </div>
              <h3 className="text-xl md:text-3xl font-black text-gray-900 text-center leading-relaxed arabic-text transition-transform duration-300 group-hover:scale-[1.02]">
                {currentQuestion?.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {currentQuestion?.options.map((option: string, index: number) => {
                let bgColor = "bg-white";
                let borderColor = "border-gray-100";
                let textColor = "text-gray-700";
                let icon = null;

                if (isAnswered) {
                  if (index === currentQuestion.correctIndex) {
                    bgColor = "bg-emerald-500";
                    borderColor = "border-emerald-600 shadow-xl shadow-emerald-100";
                    textColor = "text-white";
                    icon = <CheckCircle2 className="w-6 h-6 text-white" />;
                  } else if (selectedOption === index) {
                    bgColor = "bg-rose-500";
                    borderColor = "border-rose-600 shadow-xl shadow-rose-100";
                    textColor = "text-white";
                    icon = <XCircle className="w-6 h-6 text-white" />;
                  } else {
                    bgColor = "bg-gray-50";
                    borderColor = "border-gray-100";
                    textColor = "text-gray-300 opacity-50";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={!isAnswered ? { scale: 1.02, y: -4 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionClick(index)}
                    disabled={isAnswered}
                    className={`relative p-5 md:p-6 rounded-2xl md:rounded-3xl border-4 text-xl font-bold transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[120px] md:min-h-[140px] shadow-sm ${bgColor} ${borderColor} ${textColor} ${!isAnswered ? 'hover:border-emerald-300 hover:shadow-2xl' : ''}`}
                  >
                    <span className={`arabic-text text-3xl md:text-4xl mb-1 transition-transform duration-300 ${isAnswered && index === currentQuestion.correctIndex ? 'scale-110' : ''}`}>{option}</span>
                    {isAnswered && index === currentQuestion.correctIndex && (
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Jawapan Betul</span>
                    )}
                    {icon && (
                      <div className="absolute top-3 right-3">
                        {icon}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {isAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 shadow-xl shadow-emerald-100/50"
          >
            <div className="flex items-start space-x-4">
              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md transition-transform duration-500 ${selectedOption === currentQuestion.correctIndex ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
                {selectedOption === currentQuestion.correctIndex ? <Check className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-emerald-900 text-lg md:text-xl mb-1">
                  {selectedOption === currentQuestion.correctIndex ? 'Mumtaz! (Hebat)' : 'Belajar Sesuatu!'}
                </p>
                <p className="text-emerald-800 leading-relaxed font-medium text-sm md:text-base">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            <div className="mt-6 md:mt-8 space-y-3">
              <button
                onClick={handleNext}
                className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 active:scale-[0.98] flex items-center justify-center space-x-2 group"
              >
                <span>{currentStep === questions.length - 1 ? 'Lihat Keputusan Akhir' : 'Soalan Seterusnya'}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
              <p className="text-center text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                Tips: Swipe <b>Kanan</b> untuk Seterusnya
              </p>
            </div>
          </motion.div>
        )}
      </div>
      <Copyright />
    </motion.div>
  );
};

export default Quiz;
