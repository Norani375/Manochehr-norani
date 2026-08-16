'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Edit3, Save, RotateCcw, Download, Printer, ShieldCheck, Briefcase, 
  Users, UserCheck, Plus, Trash2, Check, FileSpreadsheet, Layers, Filter, CheckCircle2, Search, FileCode, Loader2
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { exportElementToWord } from '@/lib/wordExport';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  bgType?: 'dark' | 'light';
  staff?: string[];
}

export interface OrgChartData {
  headerTitle: string;
  companyName: string;
  companySubEng: string;
  president: OrgChartNode;
  boardMembers: OrgChartNode[];
  executives: OrgChartNode[];
  branches: OrgChartNode[];
  reportingRows: { unit: string; reportsTo: string }[];
  footerNote: string;
}

const DEFAULT_ORG_CHART_DATA: OrgChartData = {
  headerTitle: 'چارت تشکیلاتی',
  companyName: 'شرکت صرافی و خدمات پولی',
  companySubEng: 'Money Exchange & MSP Services Co. — DAB Official Standard',
  
  president: {
    id: 'pres-1',
    name: 'برکت‌الله',
    title: 'رئیس (۱۰۰٪ سرمایه)',
    bgType: 'dark'
  },

  boardMembers: [
    {
      id: 'bm-1',
      name: 'عظیم‌الله رحمانی',
      title: 'عضو هیئت نظار',
      bgType: 'light'
    },
    {
      id: 'bm-2',
      name: 'بسم‌الله شیرزی',
      title: 'رئیس هیئت نظار',
      bgType: 'dark'
    },
    {
      id: 'bm-3',
      name: 'برکت‌الله',
      title: 'عضو هیئت نظار',
      bgType: 'light'
    }
  ],

  executives: [
    {
      id: 'exec-1',
      name: 'محمد فهیم',
      title: 'مسئول پیروی از قوانین',
      bgType: 'dark'
    },
    {
      id: 'exec-2',
      name: 'صالح‌محمد',
      title: 'مسئول عملیاتی',
      bgType: 'dark'
    }
  ],

  branches: [
    {
      id: 'br-1',
      name: 'نمایندگی کابل',
      title: 'اجمل احمدی',
      staff: ['ریحان داخلی · صدیق‌الله'],
      bgType: 'light'
    },
    {
      id: 'br-2',
      name: 'نمایندگی تخار',
      title: 'رحمت‌الله',
      staff: ['عبیدالله'],
      bgType: 'light'
    },
    {
      id: 'br-3',
      name: 'نمایندگی کشم',
      title: 'عتیق‌الله',
      staff: ['—'],
      bgType: 'light'
    },
    {
      id: 'br-4',
      name: 'نمایندگی امام صاحب',
      title: 'محمد یوسف حیدری',
      staff: ['عبدالمجید'],
      bgType: 'light'
    }
  ],

  reportingRows: [
    { unit: 'رئیس هیئت نظار', reportsTo: 'سهمدار / مجمع عمومی' },
    { unit: 'عضو هیئت نظار', reportsTo: 'سهمدار / مجمع عمومی' },
    { unit: 'مسئول عملیاتی', reportsTo: 'عضو هیئت نظار (برکت‌الله)' },
    { unit: 'مسئول پیروی از قوانین', reportsTo: 'عضو هیئت نظار (برکت‌الله) — با استقلال انطباقی' },
    { unit: 'نماینده‌ها و نمایندگی‌های ولایتی', reportsTo: 'مدیر / مسئول بخش عملیاتی (صالح‌محمد)' },
    { unit: 'کارکنان و پرسنل نمایندگی‌ها', reportsTo: 'مسئول نماینده مربوطه (زیر نظر مدیر عملیاتی)' }
  ],

  footerNote: '▸ هیئت نظار: نظارت بر عملکرد شرکت.'
};

interface OrgChartCanvasProps {
  companyId?: string;
  customLogo?: string | null;
}

export default function OrgChartCanvas({ customLogo , companyId = "default" }: OrgChartCanvasProps) {
  const [data, setData] = useState<OrgChartData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_org_chart_v2_${companyId}`);
        if (saved) return { ...DEFAULT_ORG_CHART_DATA, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ORG_CHART_DATA;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isNodeMatch = (name: string, title: string, id: string) => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase().trim();
    return (
      name.toLowerCase().includes(term) ||
      title.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term)
    );
  };

  const getNodeHighlightClass = (name: string, title: string, id: string) => {
    if (!searchTerm.trim()) return '';
    const match = isNodeMatch(name, title, id);
    return match
      ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 transition-all duration-300 bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-2xl z-10'
      : 'opacity-30 transition-all duration-300';
  };

  const getNodeCardAnimationClass = (isDarkBg: boolean = false) => {
    return `transition-all duration-300 ease-out hover:scale-[1.04] sm:hover:scale-[1.05] hover:shadow-2xl hover:z-20 cursor-pointer ${
      isEditMode 
        ? 'hover:ring-2 hover:ring-emerald-400 hover:border-emerald-500' 
        : isDarkBg 
          ? 'hover:ring-2 hover:ring-blue-300 hover:brightness-105' 
          : 'hover:ring-2 hover:ring-blue-400 hover:border-blue-600'
    }`;
  };

  // Sync with Firestore
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_org_chart_v2_${companyId}`);
        if (saved) {
          setData({ ...DEFAULT_ORG_CHART_DATA, ...JSON.parse(saved) });
        } else {
          setData(DEFAULT_ORG_CHART_DATA);
        }
      } catch (e) {
        console.error(e);
      }
    }
    try {
      const docRef = doc(db, 'settings', `org_chart_v2_${companyId}`);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remote = snapshot.data();
          if (remote && remote.orgChartData) {
            setData((prev) => ({ ...prev, ...remote.orgChartData }));
          }
        }
      }, (err) => console.warn(err));
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [companyId]);

  const handleSave = async () => {
    try {
      localStorage.setItem(`bg_org_chart_v2_${companyId}`, JSON.stringify(data));
      try {
        const docRef = doc(db, 'settings', `org_chart_v2_${companyId}`);
        await setDoc(docRef, {
          orgChartData: data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore write fallback', e);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error('Save error', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('آیا از بازنشانی چارت تشکیلاتی به حالت مطابق سند رسمی اطمینان دارید؟')) {
      setData(DEFAULT_ORG_CHART_DATA);
      localStorage.removeItem(`bg_org_chart_v2_${companyId}`);
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'org-chart-exact-canvas',
        filename: 'چارت_سازمانی_شرکت_صرافی.pdf',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error(error);
      alert('خطا در دانلود فایل PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleWordExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToWord({
        elementId: 'org-chart-exact-canvas',
        filename: 'چارت_سازمانی_شرکت_صرافی.doc',
        title: 'چارت تشکیلاتی و ساختار سازمانی شرکت صرافی',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error(error);
      alert('خطا در دانلود فایل Word.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 dir-rtl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">چارت تشکیلاتی رسمی و هیئت نظار</h2>
            <p className="text-xs text-slate-500">طراحی شده دقیقاً مطابق نسخه استاندار د افغانستان بانک (DAB)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dedicated Search Bar */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[230px]">
            <Search className="w-4 h-4 absolute right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی پرسنل (نام، سمت، شناسه)..."
              className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isEditMode
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? 'تکمیل ویرایش' : 'ویرایش چارت'}</span>
          </button>

          {isEditMode && (
            <button
              onClick={handleSave}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'ذخیره شد' : 'ذخیره'}</span>
            </button>
          )}

          <button
            onClick={handleWordExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            title="استخراج به مایکروسافت ورد"
          >
            <FileCode className="w-4 h-4 text-blue-200" />
            <span>{isExporting ? 'در حال خروجی...' : 'دانلود Word'}</span>
          </button>

          <button
            onClick={handlePdfExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'در حال خروجی...' : 'دانلود PDF'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl"
            title="بازنشانی"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Edit Controls Form */}
      {isEditMode && (
        <div className="bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 text-xs print:hidden">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 border-b border-blue-200 pb-2">
            <Edit3 className="w-4 h-4" />
            <span>ویرایش عنوان‌ها و نام‌های چارت تشکیلاتی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">نام رئیس شرکت:</label>
              <input
                type="text"
                value={data.president.name}
                onChange={(e) => setData({ ...data, president: { ...data.president, name: e.target.value } })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">سمت رئیس:</label>
              <input
                type="text"
                value={data.president.title}
                onChange={(e) => setData({ ...data, president: { ...data.president, title: e.target.value } })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-blue-200">
            <label className="font-bold block text-slate-800 dark:text-slate-200">اعضای هیئت نظار:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.boardMembers.map((bm, idx) => (
                <div key={bm.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border space-y-1.5">
                  <input
                    type="text"
                    value={bm.name}
                    placeholder="نام"
                    onChange={(e) => {
                      const updated = [...data.boardMembers];
                      updated[idx].name = e.target.value;
                      setData({ ...data, boardMembers: updated });
                    }}
                    className="w-full p-1.5 border rounded font-bold text-xs"
                  />
                  <input
                    type="text"
                    value={bm.title}
                    placeholder="سمت"
                    onChange={(e) => {
                      const updated = [...data.boardMembers];
                      updated[idx].title = e.target.value;
                      setData({ ...data, boardMembers: updated });
                    }}
                    className="w-full p-1 border rounded text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-blue-200">
            <label className="font-bold block text-slate-800 dark:text-slate-200">کادر اجرایی اصلی:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.executives.map((exec, idx) => (
                <div key={exec.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border space-y-1.5">
                  <input
                    type="text"
                    value={exec.name}
                    placeholder="نام"
                    onChange={(e) => {
                      const updated = [...data.executives];
                      updated[idx].name = e.target.value;
                      setData({ ...data, executives: updated });
                    }}
                    className="w-full p-1.5 border rounded font-bold text-xs"
                  />
                  <input
                    type="text"
                    value={exec.title}
                    placeholder="سمت"
                    onChange={(e) => {
                      const updated = [...data.executives];
                      updated[idx].title = e.target.value;
                      setData({ ...data, executives: updated });
                    }}
                    className="w-full p-1 border rounded text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-blue-200">
            <label className="font-bold block text-slate-800 dark:text-slate-200">نمایندگی‌ها:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.branches.map((br, idx) => (
                <div key={br.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border space-y-1.5">
                  <input
                    type="text"
                    value={br.name}
                    placeholder="نام نمایندگی"
                    onChange={(e) => {
                      const updated = [...data.branches];
                      updated[idx].name = e.target.value;
                      setData({ ...data, branches: updated });
                    }}
                    className="w-full p-1.5 border rounded font-bold text-xs text-blue-900"
                  />
                  <input
                    type="text"
                    value={br.title}
                    placeholder="مسئول نمایندگی"
                    onChange={(e) => {
                      const updated = [...data.branches];
                      updated[idx].title = e.target.value;
                      setData({ ...data, branches: updated });
                    }}
                    className="w-full p-1 border rounded text-xs"
                  />
                  <input
                    type="text"
                    value={br.staff ? br.staff.join(' · ') : ''}
                    placeholder="سایر کارمندان"
                    onChange={(e) => {
                      const updated = [...data.branches];
                      updated[idx].staff = [e.target.value];
                      setData({ ...data, branches: updated });
                    }}
                    className="w-full p-1 border rounded text-xs text-slate-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Org Chart Canvas matching exact uploaded image */}
      <div 
        id="org-chart-exact-canvas"
        className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl print:shadow-none print:border-none print:p-0 print:bg-white text-slate-900 dark:text-slate-100 dir-rtl"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Header Banner - Dark Blue exact visual */}
          <div className="bg-[#1e3a8a] text-white py-8 px-6 text-center space-y-2 relative shadow-md">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              {data.headerTitle}
            </h1>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
              {data.companyName}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-blue-200/90 font-sans tracking-wide">
              {data.companySubEng}
            </p>
          </div>

          {/* Org Tree Content Container */}
          <div className="p-6 sm:p-10 space-y-10">
            
            {/* LEVEL 1: President Box (Centered Dark Blue Box) */}
            <div className="flex flex-col items-center relative">
              <div className={`bg-[#1e3a8a] text-white rounded-2xl px-8 py-5 text-center shadow-lg border border-blue-900 min-w-[240px] sm:min-w-[280px] ${getNodeCardAnimationClass(true)} ${getNodeHighlightClass(data.president.name, data.president.title, data.president.id)}`}>
                <div className="text-lg sm:text-xl font-black tracking-tight">{data.president.name}</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">{data.president.title}</div>
              </div>

              {/* Vertical connector down from President */}
              <div className="w-0.5 h-8 bg-[#1e3a8a]"></div>

              {/* Horizontal line spanning Board of Supervisors */}
              <div className="w-[82%] max-w-[620px] h-0.5 bg-[#1e3a8a]"></div>

              {/* 3 vertical drop lines to Level 2 items */}
              <div className="w-[82%] max-w-[620px] flex justify-between h-6">
                <div className="w-0.5 h-full bg-[#1e3a8a]"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a]"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a]"></div>
              </div>
            </div>

            {/* LEVEL 2: Board of Supervisors (3 Boxes) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto items-stretch">
              
              {/* Right Box (RTL Index 0 in image: برکت‌الله - عضو هیئت نظار) */}
              <div className={`bg-white dark:bg-slate-900 border-2 border-[#1e3a8a] rounded-2xl p-4 sm:p-5 text-center shadow-sm flex flex-col justify-center min-h-[90px] ${getNodeCardAnimationClass(false)} ${getNodeHighlightClass(data.boardMembers[2]?.name || '', data.boardMembers[2]?.title || '', data.boardMembers[2]?.id || '')}`}>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{data.boardMembers[2]?.name || 'برکت‌الله'}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">{data.boardMembers[2]?.title || 'عضو هیئت نظار'}</div>
              </div>

              {/* Middle Box (RTL Index 1 in image: بسم‌الله شیرزی - رئیس هیئت نظار - FILLED DARK BLUE) */}
              <div className={`bg-[#1e3a8a] text-white rounded-2xl p-4 sm:p-5 text-center shadow-lg flex flex-col justify-center min-h-[90px] transform sm:-translate-y-1 ${getNodeCardAnimationClass(true)} ${getNodeHighlightClass(data.boardMembers[1]?.name || '', data.boardMembers[1]?.title || '', data.boardMembers[1]?.id || '')}`}>
                <div className="text-base sm:text-lg font-black tracking-tight">{data.boardMembers[1]?.name || 'بسم‌الله شیرزی'}</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">{data.boardMembers[1]?.title || 'رئیس هیئت نظار'}</div>
              </div>

              {/* Left Box (RTL Index 2 in image: عظیم‌الله رحمانی - عضو هیئت نظار) */}
              <div className={`bg-white dark:bg-slate-900 border-2 border-[#1e3a8a] rounded-2xl p-4 sm:p-5 text-center shadow-sm flex flex-col justify-center min-h-[90px] ${getNodeCardAnimationClass(false)} ${getNodeHighlightClass(data.boardMembers[0]?.name || '', data.boardMembers[0]?.title || '', data.boardMembers[0]?.id || '')}`}>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{data.boardMembers[0]?.name || 'عظیم‌الله رحمانی'}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">{data.boardMembers[0]?.title || 'عضو هیئت نظار'}</div>
              </div>
            </div>

            {/* Connector down to Executives */}
            <div className="flex flex-col items-center relative my-2">
              <div className="w-0.5 h-6 bg-[#1e3a8a] dark:bg-blue-400"></div>
              <div className="w-[50%] max-w-[380px] h-0.5 bg-[#1e3a8a] dark:bg-blue-400"></div>
              <div className="w-[50%] max-w-[380px] flex justify-between h-4">
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
              </div>
            </div>

            {/* LEVEL 3: Executive Managers (2 Filled Dark Blue Boxes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              
              {/* Right Box (RTL: صالح‌محمد - مسئول عملیاتی) */}
              <div className={`bg-[#1e3a8a] text-white rounded-2xl p-4 sm:p-5 text-center shadow-lg ${getNodeCardAnimationClass(true)} ${getNodeHighlightClass(data.executives[1]?.name || '', data.executives[1]?.title || '', data.executives[1]?.id || '')}`}>
                <div className="text-base sm:text-lg font-black tracking-tight">{data.executives[1]?.name || 'صالح‌محمد'}</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">{data.executives[1]?.title || 'مسئول عملیاتی'}</div>
              </div>

              {/* Left Box (RTL: محمد فهیم - مسئول پیروی از قوانین) */}
              <div className={`bg-[#1e3a8a] text-white rounded-2xl p-4 sm:p-5 text-center shadow-lg ${getNodeCardAnimationClass(true)} ${getNodeHighlightClass(data.executives[0]?.name || '', data.executives[0]?.title || '', data.executives[0]?.id || '')}`}>
                <div className="text-base sm:text-lg font-black tracking-tight">{data.executives[0]?.name || 'محمد فهیم'}</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">{data.executives[0]?.title || 'مسئول پیروی از قوانین'}</div>
              </div>
            </div>

            {/* LEVEL 4: Provincial Branches under Operational Manager */}
            <div className="text-center my-4">
              <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-950/80 text-[#1e3a8a] dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs font-black px-4 py-1.5 rounded-full shadow-xs">
                <span>نماینده‌ها و نمایندگی‌های ولایتی</span>
                <span className="text-[10px] bg-[#1e3a8a] text-white px-2 py-0.5 rounded-full font-bold">تحت اثر مستقیم مسئول عملیاتی</span>
              </span>
            </div>

            {/* Clean connector down from Operations Manager to Provincial Branches */}
            <div className="flex flex-col items-center relative mb-2">
              {/* Line dropping from Operations Manager (RTL right column box) */}
              <div className="w-full max-w-2xl flex justify-end pr-[25%] sm:pr-[25%]">
                <div className="w-0.5 h-6 bg-[#1e3a8a] dark:bg-blue-400"></div>
              </div>
              
              <div className="w-[90%] max-w-[720px] h-0.5 bg-[#1e3a8a] dark:bg-blue-400 rounded-full"></div>
              
              <div className="w-[90%] max-w-[720px] flex justify-between h-4">
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
                <div className="w-0.5 h-full bg-[#1e3a8a] dark:bg-blue-400"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.branches.map((br) => (
                <div 
                  key={br.id}
                  className={`bg-white dark:bg-slate-900 border-2 border-[#1e3a8a] rounded-2xl p-4 text-center shadow-sm flex flex-col justify-between space-y-2 min-h-[120px] ${getNodeCardAnimationClass(false)} ${getNodeHighlightClass(br.name, br.title, br.id)}`}
                >
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5 flex flex-col items-center">
                    <span>{br.name}</span>
                    <span className="text-[10px] text-blue-800 dark:text-blue-300 font-extrabold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 mt-1">
                      گزارش‌دهی: مسئول عملیاتی
                    </span>
                  </div>
                  
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {br.title}
                  </div>

                  {br.staff && br.staff.length > 0 && (
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                      {br.staff.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SECTION: Reporting Relationships & Separation of Duties Table */}
            <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 space-y-4">
              
              {/* Section Title Header */}
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="text-lg sm:text-xl">📋</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  روابط گزارش‌دهی و اصل تفکیک وظایف
                </h3>
              </div>

              {/* Table Layout matching exact PDF/image table */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs sm:text-sm text-right">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 font-black">
                      <th className="p-3 w-1/3 border-l border-slate-300 dark:border-slate-700">واحد</th>
                      <th className="p-3">گزارش‌دهی به</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    {data.reportingRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-800/40'}
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800">
                          {row.unit}
                        </td>
                        <td className="p-3">
                          {row.reportsTo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Note */}
              <div className="pt-2 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>{data.footerNote}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
