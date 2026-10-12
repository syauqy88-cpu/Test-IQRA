
import React from 'react';
import { motion } from 'motion/react';
import { IqraLevel } from '../types';
import Copyright from './Copyright';
import { 
  ChevronLeft, 
  Rocket, 
  Book, 
  PenTool, 
  FileText, 
  Download,
  ChevronRight
} from 'lucide-react';
import { 
  IQRA_1_LETTERS, IQRA_2_DATA, IQRA_3_DATA, IQRA_4_DATA, 
  IQRA_5_DATA, IQRA_6_DATA, IQRA_7_DATA, IQRA_8_DATA 
} from '../constants.tsx';

interface SubMenuProps {
  level: IqraLevel;
  onBack: () => void;
  onSelectOption: (option: 'PRACTICE' | 'LEVEL' | 'QUIZ') => void;
}

const SubMenu: React.FC<SubMenuProps> = ({ level, onBack, onSelectOption }) => {
  const options = [
    { id: 'PRACTICE', title: 'Mula Belajar', icon: <Rocket className="w-8 h-8" />, desc: 'Mula dari huruf pertama' },
    { id: 'LEVEL', title: 'Sambung Page', icon: <Book className="w-8 h-8" />, desc: 'Sambung bacaan sebelumnya' },
    { id: 'QUIZ', title: 'Quiz', icon: <PenTool className="w-8 h-8" />, desc: 'Uji kefahaman anda' },
  ];

  const exportSingleToWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; }
          .title { text-align: center; color: #1B1C57; font-size: 20pt; font-weight: bold; margin-bottom: 20px; }
          .subtitle { text-align: center; color: #059669; font-size: 14pt; margin-bottom: 30px; }
          .arabic-table { width: 100%; border-collapse: collapse; direction: rtl; }
          .arabic-table td { border: 1px solid #ddd; padding: 15px; text-align: center; font-size: 22pt; font-family: 'Arial Unicode MS', serif; }
          .waqaf-item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding: 10px; }
        </style>
      </head>
      <body>
        <div class="title">ADVANCEKIDS IQRA PINTAR</div>
        <div class="subtitle">Nota Pembelajaran: ${level.title} (${level.subtitle})</div>
    `;

    let content = "";
    
    const chunk = (arr: any[], size: number) => {
      const res = [];
      for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
      return res;
    };

    if (level.id === 1) {
      content += `<table class="arabic-table">${chunk(IQRA_1_LETTERS, 6).map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 2) {
      content += `<table class="arabic-table">${IQRA_2_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 3) {
      content += `<table class="arabic-table">${IQRA_3_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 4) {
      content += `<table class="arabic-table">${IQRA_4_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 5) {
      content += `<table class="arabic-table">${IQRA_5_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 6) {
      content += `<table class="arabic-table">${IQRA_6_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 7) {
      content += `<table class="arabic-table">${IQRA_7_DATA.map(row => `<tr>${row.map(l => `<td>${l}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (level.id === 8) {
      content += IQRA_8_DATA.map(w => `<div class="waqaf-item"><b>${w.sign} (${w.name})</b>: ${w.rule}<br/><span style="font-size:18pt;">${w.examples.join(' | ')}</span></div>`).join('');
    } else {
      content += `<p style="text-align:center;">Silibus Juz 30 boleh dirujuk terus dalam aplikasi.</p>`;
    }

    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nota_${level.title.replace(' ', '_')}.doc`;
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto p-4 md:p-12 min-h-screen flex flex-col"
    >
      <div className="flex items-center space-x-4 mb-8">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="p-3 bg-white shadow-sm rounded-2xl hover:bg-gray-50 text-emerald-600 transition-colors border border-emerald-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{level.title}</h2>
          <p className="text-emerald-600 font-medium text-sm md:text-base">{level.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {options.map((opt, idx) => (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            key={opt.id}
            onClick={() => onSelectOption(opt.id as any)}
            className="flex items-center p-5 md:p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group text-left"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {opt.icon}
            </div>
            <div className="ml-4 md:ml-6 flex-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-emerald-700">{opt.title}</h3>
              <p className="text-xs md:text-sm text-gray-500">{opt.desc}</p>
            </div>
            <div className="text-emerald-300 group-hover:text-emerald-600 transition-colors">
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </motion.button>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={exportSingleToWord}
          className="flex items-center p-5 md:p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-blue-400 transition-all group text-left mt-4"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg">
            <Download className="w-8 h-8" />
          </div>
          <div className="ml-4 md:ml-6 flex-1">
            <h3 className="text-lg md:text-xl font-bold text-blue-900">Muat Turun Word</h3>
            <p className="text-xs md:text-sm text-blue-600/70 font-medium">Simpan nota {level.title} ke telefon/PC</p>
          </div>
          <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
            <FileText className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </motion.button>
      </div>
      <div className="mt-8">
        <Copyright />
      </div>
    </motion.div>
  );
};

export default SubMenu;
