
import React, { useRef, useState } from 'react';
import { User, IqraLevel } from '../types';
import { GoogleGenAI } from "@google/genai";
import Copyright from './Copyright';
import { 
  IQRA_1_LETTERS, IQRA_2_DATA, IQRA_3_DATA, IQRA_4_DATA, 
  IQRA_5_DATA, IQRA_6_DATA, IQRA_7_DATA, IQRA_8_DATA 
} from '../constants.tsx';

interface ProfileViewProps {
  user: User;
  unlockedLevels: number[];
  levels: IqraLevel[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, unlockedLevels, levels, onBack, onUpdateUser }) => {
  const progressPercent = Math.round((unlockedLevels.length / levels.length) * 100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Silibus IQRA PINTAR</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .title { text-align: center; color: #059669; font-size: 24pt; font-weight: bold; margin-bottom: 5px; }
          .subtitle { text-align: center; color: #666; font-size: 12pt; margin-bottom: 30px; }
          .level-header { background-color: #f3f4f6; padding: 10px; border-left: 5px solid #059669; margin-top: 30px; }
          .level-title { font-size: 16pt; font-weight: bold; color: #1B1C57; }
          .arabic-table { width: 100%; border-collapse: collapse; margin-top: 15px; direction: rtl; }
          .arabic-table td { border: 1px solid #ddd; padding: 15px; text-align: center; font-size: 20pt; font-family: 'Arial Unicode MS', 'Traditional Arabic', serif; }
          .waqaf-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .waqaf-sign { font-size: 24pt; font-weight: bold; color: #e11d48; }
        </style>
      </head>
      <body>
        <div class="title">ADVANCEKIDS IQRA PINTAR</div>
        <div class="subtitle">Silibus Lengkap Pembelajaran (Tahap 1 - 8)</div>
    `;

    let content = "";

    // IQRA 1
    content += `
      <div class="level-header"><div class="level-title">IQRA 1: Huruf Tunggal Hijaiyah</div></div>
      <table class="arabic-table">
        ${chunkArray(IQRA_1_LETTERS, 6).map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}
      </table>
    `;

    // IQRA 2 & 3
    [ {title: "IQRA 2: Kasrah & Dhommah", data: IQRA_2_DATA}, {title: "IQRA 3: Tanween", data: IQRA_3_DATA} ].forEach(iqra => {
      content += `
        <div class="level-header"><div class="level-title">${iqra.title}</div></div>
        <table class="arabic-table">
          ${iqra.data.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}
        </table>
      `;
    });

    // IQRA 4
    content += `
      <div class="level-header"><div class="level-title">IQRA 4: Huruf Bersambung</div></div>
      <table class="arabic-table">
        ${IQRA_4_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}
      </table>
    `;

    // IQRA 5 & 6
    [ {title: "IQRA 5: Mad & Sukun", data: IQRA_5_DATA}, {title: "IQRA 6: Syaddah (Sabdu)", data: IQRA_6_DATA} ].forEach(iqra => {
      content += `
        <div class="level-header"><div class="level-title">${iqra.title}</div></div>
        <table class="arabic-table">
          ${iqra.data.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}
        </table>
      `;
    });

    // IQRA 7
    content += `
      <div class="level-header"><div class="level-title">IQRA 7: Tajwid & Dengung</div></div>
      <table class="arabic-table">
        ${IQRA_7_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}
      </table>
    `;

    // IQRA 8
    content += `
      <div class="level-header"><div class="level-title">IQRA 8: Tanda Waqaf</div></div>
      ${IQRA_8_DATA.map(w => `
        <div class="waqaf-item">
          <div class="waqaf-sign">${w.sign}</div>
          <div><b>${w.name}</b>: ${w.rule}</div>
          <div style="direction: rtl; font-size: 18pt; margin-top: 5px;">${w.examples.join(' | ')}</div>
        </div>
      `).join('')}
    `;

    const footer = "</body></html>";
    const source = header + content + footer;
    const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Silibus_IQRA_PINTAR_${user.name}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSending(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Seorang pengguna aplikasi Advancekids IQRA PINTAR telah menghantar maklum balas berikut: "${feedback}". Sebagai pembangun (developer) yang ramah dan berunsurkan nilai Islam, berikan ucapan terima kasih yang sangat hangat, mendoakan mereka, dan memberitahu bahawa cadangan mereka sangat dihargai. Jawab dalam Bahasa Melayu yang sopan.`,
      });
      
      setFeedbackResponse(response.text || "Terima kasih atas maklum balas anda! Kami amat menghargainya.");
      setFeedback('');
    } catch (error) {
      console.error("Feedback error:", error);
      setFeedbackResponse("Terima kasih! Maklum balas anda telah diterima oleh pasukan kami.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300 min-h-screen flex flex-col">
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
          <h2 className="text-3xl font-black text-gray-900">Profil Pelajar</h2>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Akaun Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            
            <div className="relative mb-6 group z-10">
              <img src={user.photoURL} alt="profile" className={`w-32 h-32 rounded-3xl border-4 border-emerald-100 shadow-lg object-cover transition-transform duration-500 group-hover:scale-105`} />
              <div className={`absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md z-20`}>
                PELAJAR
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 leading-tight z-10">{user.name}</h3>
            <p className={`text-emerald-600 bg-emerald-50 font-bold text-sm px-4 py-1 rounded-full mt-2 z-10`}>
              {user.age} Tahun
            </p>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline z-10"
            >
              Tukar Foto Profil
            </button>
            
            <div className="w-full mt-8 pt-8 border-t border-gray-50 space-y-4 text-left z-10">
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Peribadi</span>
                <span className="text-sm font-bold text-gray-700 break-all">{user.email}</span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Waris</span>
                <span className="text-sm font-bold text-gray-700 break-all">{user.parentEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            
            <h4 className="text-xl font-black flex items-center space-x-2">
              <span>Maklum Balas</span>
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded-lg font-bold">DEV</span>
            </h4>
            
            {feedbackResponse ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <p className="text-sm leading-relaxed font-medium bg-white/10 p-4 rounded-2xl italic">
                  "{feedbackResponse}"
                </p>
                <button 
                  onClick={() => setFeedbackResponse(null)}
                  className="w-full py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                >
                  Hantar Lagi
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-blue-100 font-medium leading-relaxed">Ada cadangan atau masalah? Beritahu pembangun kami!</p>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tulis maklum balas anda..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-blue-200 min-h-[100px] resize-none"
                />
                <button 
                  onClick={handleSendFeedback}
                  disabled={isSending || !feedback.trim()}
                  className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Hantar Maklum Balas</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 rounded-full -mr-24 -mt-24"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h4 className="text-xl font-black text-gray-900">Kemajuan Pembelajaran</h4>
              <div className="flex flex-col items-end">
                <span className={`text-3xl font-black text-emerald-600`}>{progressPercent}%</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keseluruhan</span>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="w-full h-4 bg-emerald-50 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className={`h-full bg-emerald-500 rounded-full shadow-lg transition-all duration-1000 ease-out`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {levels.map(level => {
                  const isDone = unlockedLevels.includes(level.id);
                  return (
                    <div 
                      key={level.id} 
                      className={`p-4 rounded-3xl border-2 flex flex-col items-center space-y-2 transition-all duration-300 ${
                        isDone 
                          ? 'bg-white border-emerald-100 shadow-md scale-100' 
                          : 'bg-gray-50 border-gray-50 opacity-40 scale-95'
                      }`}
                    >
                      <span className="text-2xl transform transition-transform group-hover:scale-125">
                        {isDone ? '✅' : '🔒'}
                      </span>
                      <span className={`text-[9px] font-black text-center ${isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {level.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4 bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] flex-1 w-full">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    🔥
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Pencapaian Semasa</p>
                    <p className="text-lg font-black leading-tight">
                      Hebat! Anda sudah membuka {unlockedLevels.length} tahap IQRA.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={exportToWord}
                  className="flex items-center space-x-3 bg-white border-2 border-emerald-600 px-8 py-5 rounded-[2rem] text-emerald-600 font-black hover:bg-emerald-50 transition-all active:scale-95 shadow-lg group w-full sm:w-auto justify-center"
                >
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm uppercase tracking-widest">Eksport Silibus (Word)</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex items-center space-x-6">
            <div className="text-4xl text-emerald-300 opacity-50">"</div>
            <p className="text-emerald-800 font-medium italic text-lg leading-relaxed">
              Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.
            </p>
            <div className="text-4xl text-emerald-300 opacity-50 self-end">"</div>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default ProfileView;
