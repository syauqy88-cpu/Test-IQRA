
import React, { useState, useRef } from 'react';
import Copyright from './Copyright';
import { User } from '../types';

interface ProfileSetupProps {
  onComplete: (user: User) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima&top[]=hijab&accessory[]=round&clothing=graphicShirt&clothingColor=blue01',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra&top[]=hijab&clothing=collarAndSweater&clothingColor=pink02',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha&top[]=hijab&clothing=shirtVNeck&clothingColor=emerald',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar&top[]=turban&clothing=hoodie&clothingColor=green03&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali&top[]=shortHair&clothing=graphicShirt&clothingColor=red&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal&top[]=turban&clothing=overall&clothingColor=blue03&facialHairProbability=0'
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    parentEmail: '',
    photoURL: AVATARS[0]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: formData.name,
      email: 'pelajar@advancekids.com', 
      age: parseInt(formData.age) || 0,
      parentEmail: formData.parentEmail,
      photoURL: formData.photoURL,
      isProfileComplete: true
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col p-10 border border-emerald-50">
        
        <div className="flex justify-between items-center mb-10 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-sm ${step >= i ? 'bg-emerald-600 text-white scale-110' : 'bg-emerald-50 text-emerald-300'}`}>
                {i}
              </div>
              {i < 3 && <div className={`h-1 flex-1 mx-3 rounded-full transition-colors duration-500 ${step > i ? 'bg-emerald-600' : 'bg-emerald-50'}`}></div>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Kenali Anda 🌟</h2>
              <p className="text-gray-500 font-medium">Siapakah nama pelajar hebat hari ini?</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Nama Penuh</label>
                <input 
                  type="text" 
                  autoFocus
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-8 py-5 bg-emerald-50/30 rounded-[2rem] border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none transition-all text-lg font-bold shadow-inner"
                  placeholder="Contoh: Ahmad Al-Fatih"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Umur (Tahun)</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full px-8 py-5 bg-emerald-50/30 rounded-[2rem] border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none transition-all text-lg font-bold shadow-inner"
                  placeholder="Contoh: 7"
                />
              </div>
            </div>
            <button 
              disabled={!formData.name || !formData.age}
              onClick={handleNext}
              className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-200/50 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 mt-4"
            >
              Seterusnya
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Email Waris 📧</h2>
              <p className="text-gray-500 font-medium">Ibu atau bapa akan menerima laporan kemajuan anda.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Email Ibu/Bapa</label>
              <input 
                type="email" 
                autoFocus
                value={formData.parentEmail}
                onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                className="w-full px-8 py-5 bg-emerald-50/30 rounded-[2rem] border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none transition-all text-lg font-bold shadow-inner"
                placeholder="ibu.ayah@email.com"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleBack} className="flex-1 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-bold transition-all hover:bg-gray-200">Kembali</button>
              <button 
                disabled={!formData.parentEmail.includes('@')}
                onClick={handleNext}
                className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-200/50 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
              >
                Hampir Siap!
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Pilih Karakter 🎨</h2>
              <p className="text-gray-500 font-medium">Pilih karakter yang paling mewakili anda.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((url, idx) => (
                <button 
                  key={idx}
                  onClick={() => setFormData({...formData, photoURL: url})}
                  className={`aspect-square rounded-3xl border-4 transition-all p-2 ${formData.photoURL === url ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                >
                  <img src={url} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                </button>
              ))}
            </div>

            <div className="text-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-bold text-emerald-600 hover:underline"
              >
                Atau muat naik foto sendiri 📸
              </button>
            </div>

            <div className="flex space-x-4 mt-4">
              <button onClick={handleBack} className="flex-1 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-bold transition-all hover:bg-gray-200">Kembali</button>
              <button 
                onClick={handleSubmit}
                className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-95"
              >
                Jom Mula!
              </button>
            </div>
          </div>
        )}
      </div>
      <Copyright />
    </div>
  );
};

export default ProfileSetup;
