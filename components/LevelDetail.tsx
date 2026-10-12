import React, { useEffect, useState } from 'react';
import { IqraLevel } from '../types.ts';
import { getLevelGuidance } from '../services/geminiService.ts';
import Copyright from './Copyright.tsx';

interface LevelDetailProps {
  level: IqraLevel;
  onBack: () => void;
  onStartPractice?: () => void;
  showStartButton?: boolean;
}

const LevelDetail: React.FC<LevelDetailProps> = ({ level, onBack, onStartPractice, showStartButton }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getLevelGuidance(level.title, level.subtitle);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [level]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white shadow-sm rounded-2xl hover:bg-gray-50 text-emerald-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{level.title}</h2>
            <p className="text-emerald-600 font-medium">Nota Pembelajaran</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-4 flex-1">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Menyediakan nota pembelajaran...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 min-h-[300px] flex flex-col">
              <div className="flex items-center space-x-2 mb-6 text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-bold">Penerangan</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-xl flex-grow">
                {data?.explanation || "Kandungan tidak tersedia pada masa ini."}
              </p>

              {showStartButton && onStartPractice && (
                <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                   <button 
                     onClick={onStartPractice}
                     className="w-full sm:w-auto px-12 py-5 bg-emerald-600 rounded-2xl font-bold text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center space-x-3 mx-auto"
                   >
                     <span>Mula Belajar Sekarang</span>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                     </svg>
                   </button>
                   <p className="mt-4 text-emerald-600 text-sm font-medium">Klik untuk mulakan sebutan huruf</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-emerald-600 p-8 rounded-3xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span>Tips Pintar</span>
                <span className="ml-2">💡</span>
              </h3>
              <p className="text-emerald-50 leading-relaxed text-lg italic">
                {data?.tips || "Sentiasa fokus pada makhraj huruf yang betul!"}
              </p>
            </section>
            
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-emerald-800 text-sm font-bold mb-1">Status:</p>
              <p className="text-emerald-600 text-sm">Pembelajaran untuk "{level.subtitle}" telah dikemaskini oleh AI Guru.</p>
            </div>
          </div>
        </div>
      )}
      <Copyright />
    </div>
  );
};

export default LevelDetail;