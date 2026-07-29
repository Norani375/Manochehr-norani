
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, UserCheck, ShieldCheck, Printer, Search, Briefcase, 
  Award, Shield, Edit3, Plus, Trash2, RotateCcw, Sun, Moon, Contrast, Check, X, User, FileText, Network, Image as ImageIcon, Download, Eye, Activity, Users
} from 'lucide-react';
import DabGuaranteeForm from '@/components/DabGuaranteeForm';
import DabBranchRenewalForm from '@/components/DabBranchRenewalForm';
import DabLicenseRenewalForm from '@/components/DabLicenseRenewalForm';
import CompanyLogoModal from '@/components/CompanyLogoModal';
import ExportPdfModal from '@/components/ExportPdfModal';
import PrintPreviewModal from '@/components/PrintPreviewModal';

interface PersonnelNode {
  key: string;
  title: string;
  name: string;
  id: string;
  category: 'president' | 'board' | 'operations' | 'compliance' | 'branch';
  description?: string;
}

const DEFAULT_ORG_DATA: PersonnelNode[] = [
  {
    key: 'president',
    title: 'رئیس شرکت',
    name: 'برکت‌الله ولد عبدالغفور',
    id: '55522',
    category: 'president'
  },
  {
    key: 'board_head',
    title: 'رئیس هیئت نظار',
    name: 'بسم‌الله شیرزی ولد دوستمحمد',
    id: '45188',
    category: 'board'
  },
  {
    key: 'board_member_1',
    title: 'عضو هیئت نظار',
    name: 'برکت‌الله ولد عبدالغفور',
    id: '55522',
    category: 'board'
  },
  {
    key: 'board_member_2',
    title: 'عضو هیئت نظار',
    name: 'عظیم‌الله رحمانی ولد محمد آجان',
    id: '35806',
    category: 'board'
  },
  {
    key: 'operations_manager',
    title: 'مدیر بخش عملیاتی',
    name: 'صالح‌محمد ولد عبدالرحیم',
    id: '48424',
    category: 'operations'
  },
  {
    key: 'compliance_officer',
    title: 'مسئول پیروی از قوانین (Compliance)',
    name: 'محمد فهیم ولد محمد امان',
    id: '97484',
    category: 'compliance',
    description: 'مستقیماً زیر نظر هیئت نظار جهت انطباق با قوانین بانکی و مالی (AML/CFT)'
  },
  {
    key: 'branch_takhar',
    title: 'نماینده ولایت تخار',
    name: 'رحمت‌الله ولد محمدمراد',
    id: '16532',
    category: 'branch'
  },
  {
    key: 'branch_kabul',
    title: 'نماینده کابل',
    name: 'اجمل ولد نورآغا',
    id: '46338',
    category: 'branch'
  },
  {
    key: 'branch_imam_sahib',
    title: 'نماینده ولسوالی امام‌صاحب',
    name: 'محمدیوسف ولد عبدالمجید',
    id: '98680',
    category: 'branch'
  },
  {
    key: 'branch_kishm',
    title: 'نماینده کشم، ولایت بدخشان',
    name: 'عتیق‌الله ولد شمس‌الدین',
    id: '7252',
    category: 'branch'
  }
];

export default function OrgChartPage() {
  const [activeTab, setActiveTab] = useState<'org-chart' | 'guarantee-form' | 'branch-renewal' | 'license-renewal'>('org-chart');
  const [personnel, setPersonnel] = useState<PersonnelNode[]>(DEFAULT_ORG_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'contrast'>('light');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNode, setEditingNode] = useState<PersonnelNode | null>(null);

  // Logo state
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Dynamic Real-time Dashboard Stats Calculations
  const totalPersonnelCount = personnel.length;
  const boardMembersCount = personnel.filter((p) => p.category === 'board').length;
  const activeBranchesCount = personnel.filter((p) => p.category === 'branch').length;
  const executiveCount = personnel.filter((p) => p.category === 'president' || p.category === 'operations' || p.category === 'compliance').length;

  // Load persisted state after hydration mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedPersonnel = localStorage.getItem('bg_org_chart_data');
        if (savedPersonnel) {
          setPersonnel(JSON.parse(savedPersonnel));
        }
      } catch (e) {
        console.error('Failed to load org chart from storage', e);
      }

      const savedLogo = localStorage.getItem('custom_company_logo');
      if (savedLogo) {
        setCustomLogo(savedLogo);
      }
    }, 0);

    const handleLogoUpdate = () => {
      setCustomLogo(localStorage.getItem('custom_company_logo'));
    };
    window.addEventListener('custom_logo_updated', handleLogoUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('custom_logo_updated', handleLogoUpdate);
    };
  }, []);

  const handleSaveLogo = (logoDataUrl: string | null) => {
    setCustomLogo(logoDataUrl);
    if (logoDataUrl) {
      localStorage.setItem('custom_company_logo', logoDataUrl);
    } else {
      localStorage.removeItem('custom_company_logo');
    }
    window.dispatchEvent(new Event('custom_logo_updated'));
  };

  const getPdfExportConfig = () => {
    switch (activeTab) {
      case 'guarantee-form':
        return {
          targetId: 'dab-official-form',
          title: 'فورم تعهدنامه و تضمین سر سهمدار (د افغانستان بانک)',
          filename: 'فورم_تضمین_سر_سهمدار_برکت_الله_غفوری_DAB.pdf',
        };
      case 'branch-renewal':
        return {
          targetId: 'dab-branch-renewal-canvas',
          title: 'فورم درخواست تمدید نمایندگی (د افغانستان بانک)',
          filename: 'فورم_تمدید_نمایندگی_برکت_الله_غفوری_DAB.pdf',
        };
      case 'license-renewal':
        return {
          targetId: 'dab-license-renewal-canvas',
          title: 'فورم ارزیابی و تمدید جواز شرکت صرافی (د افغانستان بانک)',
          filename: 'فورم_تمدید_جواز_شرکت_برکت_الله_غفوری_DAB.pdf',
        };
      default:
        return {
          targetId: 'org-chart-export-canvas',
          title: 'چارت تشکیلاتی و ساختار سازمانی شرکت صرافی برکت‌الله غفوری',
          filename: 'چارت_سازمانی_برکت_الله_غفوری_د_افغانستان_بانک.pdf',
        };
    }
  };

  // Save to local storage
  const savePersonnel = (newData: PersonnelNode[]) => {
    setPersonnel(newData);
    try {
      localStorage.setItem('bg_org_chart_data', JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save org chart to storage', e);
    }
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات چارت را به حالت اولیه بازگردانید؟')) {
      savePersonnel(DEFAULT_ORG_DATA);
    }
  };

  const handleUpdateNode = (updated: PersonnelNode) => {
    const nextData = personnel.map(p => p.key === updated.key ? updated : p);
    savePersonnel(nextData);
    setEditingNode(null);
  };

  const handleAddRepresentative = () => {
    const newKey = `branch_${Date.now()}`;
    const newNode: PersonnelNode = {
      key: newKey,
      title: 'نمایندگی جدید',
      name: 'نام و ولد جدید',
      id: '00000',
      category: 'branch'
    };
    savePersonnel([...personnel, newNode]);
    setEditingNode(newNode);
  };

  const handleDeleteNode = (key: string) => {
    if (confirm('آیا از حذف این رکورد اطمینان دارید؟')) {
      savePersonnel(personnel.filter(p => p.key !== key));
      if (editingNode?.key === key) setEditingNode(null);
    }
  };

  const getNode = (key: string) => personnel.find(p => p.key === key);
  const getNodesByCategory = (category: 'board' | 'branch') => personnel.filter(p => p.category === category);

  const matchesSearch = (node?: PersonnelNode) => {
    if (!node || !searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      node.name.toLowerCase().includes(term) ||
      node.title.toLowerCase().includes(term) ||
      node.id.includes(term)
    );
  };

  // Theme styling helpers
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-slate-950 text-slate-100',
          cardBg: 'bg-slate-900 border-slate-800 text-slate-100',
          headerBg: 'bg-slate-900 border-slate-800',
          nodeCardBg: 'bg-slate-900 border-slate-700 text-slate-100',
          highlight: 'border-blue-500 ring-2 ring-blue-500/30',
          connector: 'bg-slate-700',
          subText: 'text-slate-400',
        };
      case 'contrast':
        return {
          bg: 'bg-white text-black',
          cardBg: 'bg-white border-2 border-black text-black',
          headerBg: 'bg-white border-2 border-black',
          nodeCardBg: 'bg-white border-2 border-black text-black',
          highlight: 'border-black ring-4 ring-black/20',
          connector: 'bg-black',
          subText: 'text-black font-semibold',
        };
      case 'light':
      default:
        return {
          bg: 'bg-slate-50 text-slate-900',
          cardBg: 'bg-white border-slate-200 text-slate-900',
          headerBg: 'bg-white border-slate-200',
          nodeCardBg: 'bg-white border-slate-200 text-slate-900',
          highlight: 'border-blue-500 ring-2 ring-blue-500/20',
          connector: 'bg-slate-300',
          subText: 'text-slate-500',
        };
    }
  };

  const themeStyle = getThemeClasses();
  const president = getNode('president');
  const boardMembers = getNodesByCategory('board');
  const operations = getNode('operations_manager');
  const compliance = getNode('compliance_officer');
  const branches = getNodesByCategory('branch');

  return (
    <div className={`min-h-screen ${themeStyle.bg} font-sans p-4 sm:p-8 transition-colors duration-200 print:bg-white print:text-black print:p-0`}>
      {/* Header / Toolbar */}
      <div className="max-w-7xl mx-auto mb-8 print:hidden">
        <div className={`${themeStyle.headerBg} rounded-2xl shadow-sm border p-6 flex flex-col lg:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            {customLogo ? (
              <div 
                onClick={() => setIsLogoModalOpen(true)}
                className="relative group cursor-pointer shrink-0"
                title="کلیک کنید جهت تغییر یا مدیریت لوگوی اختصاصی شرکت"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={customLogo} 
                  alt="Company Logo" 
                  className="w-14 h-14 object-contain rounded-2xl border-2 border-blue-900 bg-white p-1 shadow-sm transition-all group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-blue-950/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-bold">
                  تغییر
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="p-3 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl shadow-sm cursor-pointer transition-all shrink-0"
                title="آپلود لوگوی اختصاصی شرکت"
              >
                <Building2 className="w-6 h-6" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">شرکت صرافی و خدمات پولی برکت‌الله غفوری</h1>
                {customLogo && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 hidden sm:inline-block">
                    لوگوی اختصاصی
                  </span>
                )}
              </div>
              <p className={`text-sm ${themeStyle.subText}`}>چارت تشکیلاتی رسمی و ساختار سازمانی (قابل ویرایش و آماده چاپ برای د افغانستان بانک)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Custom Logo Uploader Button */}
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                customLogo 
                  ? 'bg-blue-900 text-white border-blue-950 shadow-sm hover:bg-blue-800' 
                  : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-blue-400" />
              {customLogo ? 'مدیریت لوگو' : 'آپلود لوگوی شرکت'}
            </button>
            {/* Search (only for org chart) */}
            {activeTab === 'org-chart' && (
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو نام، سمت یا ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pr-9 pl-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            )}

            {/* Mode Edit Toggle (only for org chart) */}
            {activeTab === 'org-chart' && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                  isEditMode 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                    : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditMode ? 'خروج از حالت ویرایش' : 'ویرایش چارت'}
              </button>
            )}

            {/* Reset Button (only for org chart) */}
            {activeTab === 'org-chart' && (
              <button
                onClick={handleReset}
                title="بازنشانی اطلاعات"
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Theme Switcher */}
            <div className={`flex items-center border rounded-xl p-1 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-500'}`}
                title="تم روشن"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-500'}`}
                title="تم تاریک"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('contrast')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'contrast' ? 'bg-black text-white font-bold' : 'text-slate-500'}`}
                title="کنتراست بالا (مخصوص چاپ)"
              >
                <Contrast className="w-4 h-4" />
              </button>
            </div>

            {/* Print Preview Button */}
            <button
              onClick={() => setIsPrintPreviewOpen(true)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="پیش‌نمایش نسخه چاپ و شبیه‌سازی حاشیه‌ها و چیدمان سند"
            >
              <Eye className="w-4 h-4 text-blue-200" />
              پیش‌نمایش نسخه چاپ
            </button>

            {/* Export High Quality PDF Button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="ذخیره چارت به عنوان فایل PDF استاندارد با کیفیت بالا برای د افغانستان بانک"
            >
              <Download className="w-4 h-4" />
              ذخیره PDF با کیفیت
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer whitespace-nowrap border ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              چاپ مستقیم
            </button>
          </div>
        </div>

        {/* View Switcher Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
          <button
            onClick={() => setActiveTab('org-chart')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              activeTab === 'org-chart'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md scale-102'
                : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Network className="w-4 h-4" />
            چارت تشکیلاتی شرکت
          </button>

          <button
            onClick={() => setActiveTab('guarantee-form')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              activeTab === 'guarantee-form'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md scale-102'
                : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            فورم تضمین سر سهمدار
          </button>

          <button
            onClick={() => setActiveTab('branch-renewal')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              activeTab === 'branch-renewal'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md scale-102'
                : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            فورم تمدید نمایندگی (د افغانستان بانک)
          </button>

          <button
            onClick={() => setActiveTab('license-renewal')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              activeTab === 'license-renewal'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md scale-102'
                : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            فورم تمدید جواز شرکت (د افغانستان بانک)
          </button>
        </div>
      </div>

      {/* Conditional Content Rendering */}
      {activeTab === 'guarantee-form' ? (
        <DabGuaranteeForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : activeTab === 'branch-renewal' ? (
        <DabBranchRenewalForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : activeTab === 'license-renewal' ? (
        <DabLicenseRenewalForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : (
        <>
          {/* Real-time Live Dashboard Stats Widget */}
          <div className="max-w-7xl mx-auto mb-6 px-4 print:hidden dir-rtl">
            <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-slate-200/80 text-slate-900'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3 border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-900 text-white rounded-xl shadow-xs">
                    <Activity className="w-5 h-5 text-blue-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      داشبورد آمار لحظه‌ای چارت و ساختار سازمانی
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      محاسبه خودکار و زنده بر اساس اطلاعات پرسنل و نمایندگی‌های ثبت شده شرکت برکت‌الله غفوری
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>بروزرسانی زنده (Live Sync)</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Total Personnel */}
                <div 
                  onClick={() => setSearchTerm('')}
                  title="نمایش تمامی پرسنل"
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/50'
                      : 'bg-blue-50/60 border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300">تعداد کل پرسنل</span>
                    <div className="p-2 bg-blue-900/10 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-blue-950 dark:text-white font-mono">{totalPersonnelCount}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">نفر کادر رسمی</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">شامل مدیریت، نظارت و نمایندگان</p>
                </div>

                {/* Stat 2: Active Branches */}
                <div 
                  onClick={() => setSearchTerm('نماینده')}
                  title="جستجو و فیلتر نمایندگی‌ها"
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 hover:border-emerald-500/50'
                      : 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">تعداد نمایندگی‌های فعال</span>
                    <div className="p-2 bg-emerald-900/10 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 rounded-xl">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-950 dark:text-white font-mono">{activeBranchesCount}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">نمایندگی فعال</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">کابل، تخار، بدخشان و کندز</p>
                </div>

                {/* Stat 3: Board Members */}
                <div 
                  onClick={() => setSearchTerm('نظار')}
                  title="جستجو و فیلتر هیئت نظار"
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 hover:border-amber-500/50'
                      : 'bg-amber-50/60 border-amber-100 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300">تعداد اعضای هیئت نظار</span>
                    <div className="p-2 bg-amber-900/10 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 rounded-xl">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-950 dark:text-white font-mono">{boardMembersCount}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">عضو نظارتی</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">رئیس و اعضای رسمی نظار</p>
                </div>

                {/* Stat 4: Executive Officers */}
                <div 
                  onClick={() => setSearchTerm('مدیر')}
                  title="جستجو و فیلتر مدیران"
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 hover:border-purple-500/50'
                      : 'bg-purple-50/60 border-purple-100 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300">کادر مدیریت و اجرایی</span>
                    <div className="p-2 bg-purple-900/10 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 rounded-xl">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-purple-950 dark:text-white font-mono">{executiveCount}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">پست کلیدی</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">ریاست، مدیریت عملیاتی و انطباق</p>
                </div>
              </div>
            </div>
          </div>

          {/* Org Chart Layout Canvas */}
      <div className="max-w-7xl mx-auto overflow-x-auto pb-12 print:overflow-visible">
        <div id="org-chart-export-canvas" className="min-w-[950px] flex flex-col items-center py-6 px-4 bg-white dark:bg-slate-900 rounded-2xl">
          
          {/* Printable Official Header Banner with Custom Logo */}
          <div className="w-full max-w-4xl mb-6 p-4 sm:p-6 bg-white border-2 border-slate-900 rounded-2xl shadow-sm flex items-center justify-between gap-4 text-slate-900 text-right dir-rtl">
            <div className="flex items-center gap-4">
              {customLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customLogo}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain border border-slate-300 rounded-xl p-1 bg-white shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-900 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold text-blue-950">شرکت صرافی و خدمات پولی برکت‌الله غفوری</h2>
                <p className="text-xs text-slate-700 font-bold mt-1">چارت تشکیلاتی و ساختار سازمانی رسمی - د افغانستان بانک</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">شماره جواز: 884/DAB | مرکز صرافی شهزاده کابل</p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center text-center text-xs text-slate-600 border-r pr-5 border-slate-300">
              <span className="font-bold text-slate-900 mb-1">محل مهر و امضاء</span>
              <div className="w-24 h-12 border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                مهر رسمی شرکت
              </div>
            </div>
          </div>
          
          {/* Level 1: President */}
          {president && (
            <div className="flex flex-col items-center relative group">
              <div 
                onClick={() => isEditMode && setEditingNode(president)}
                className={`bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-5 shadow-lg border-2 border-blue-800 w-80 text-center relative transition-all ${
                  isEditMode ? 'cursor-pointer hover:ring-4 hover:ring-amber-400/50 hover:scale-102' : ''
                } ${matchesSearch(president) ? 'ring-2 ring-blue-400' : ''}`}
              >
                {isEditMode && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-sm">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-blue-800/80 text-blue-200 text-xs px-2.5 py-1 rounded-full font-mono">
                  ID: {president.id}
                </div>
                <div className="inline-flex p-2 bg-blue-800/50 rounded-xl mb-2 text-blue-200">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-1">{president.title}</div>
                <div className="text-lg font-bold mb-1">{president.name}</div>
                <div className="text-xs text-blue-200/80">شماره پرسنلی: {president.id}</div>
              </div>

              {/* Vertical connector */}
              <div className={`h-10 w-0.5 ${themeStyle.connector} my-1`}></div>
            </div>
          )}

          {/* Level 2: Board of Supervisors Box */}
          <div className="flex flex-col items-center relative w-full max-w-4xl">
            <div className={`${themeStyle.cardBg} rounded-2xl p-6 shadow-md border w-full`}>
              <div className="text-center mb-6">
                <span className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm font-bold ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  هیئت نظار (شورای نظارت عالی)
                </span>
              </div>

              {/* Board Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {boardMembers.map((member) => (
                  <div 
                    key={member.key}
                    onClick={() => isEditMode && setEditingNode(member)}
                    className={`${themeStyle.nodeCardBg} rounded-xl p-4 shadow-sm border relative transition-all ${
                      isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                    } ${matchesSearch(member) ? themeStyle.highlight : ''}`}
                  >
                    {isEditMode && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded">
                        <Edit3 className="w-3 h-3" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        ID: {member.id}
                      </span>
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mb-1">{member.title}</div>
                    <div className="text-sm font-bold mb-1">{member.name}</div>
                    <div className={`text-[11px] ${themeStyle.subText}`}>شماره پرسنلی: {member.id}</div>
                  </div>
                ))}
              </div>

              {/* Vertical Connector Down to Sub-units */}
              <div className="relative flex justify-center">
                <div className={`w-0.5 h-8 ${themeStyle.connector}`}></div>
              </div>

              {/* Level 3: Operations Manager & Compliance Officer */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                
                {/* Left Side: Operations Manager & Regional Reps */}
                <div className="flex flex-col items-center">
                  {operations && (
                    <div 
                      onClick={() => isEditMode && setEditingNode(operations)}
                      className={`bg-slate-900 text-white rounded-xl p-4 shadow-md w-full max-w-xs text-center relative transition-all ${
                        isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                      } ${matchesSearch(operations) ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {isEditMode && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded">
                          <Edit3 className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                        ID: {operations.id}
                      </div>
                      <div className="inline-flex p-1.5 bg-slate-800 rounded-lg mb-2 text-slate-200">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-blue-300 mb-1">{operations.title}</div>
                      <div className="text-sm font-bold mb-1">{operations.name}</div>
                      <div className="text-[11px] text-slate-400">شماره پرسنلی: {operations.id}</div>
                    </div>
                  )}

                  {/* Vertical connector to branches */}
                  <div className={`w-0.5 h-8 ${themeStyle.connector} my-1`}></div>

                  {/* 4+ Regional Representatives */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${themeStyle.subText}`}>نمایندگی‌های ولایتی و محلی</span>
                      {isEditMode && (
                        <button
                          onClick={handleAddRepresentative}
                          className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          افزودن نمایندگی
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {branches.map((branch) => (
                        <div 
                          key={branch.key}
                          onClick={() => isEditMode && setEditingNode(branch)}
                          className={`${themeStyle.nodeCardBg} rounded-xl p-3 border text-center shadow-xs relative transition-all ${
                            isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                          } ${matchesSearch(branch) ? themeStyle.highlight : ''}`}
                        >
                          {isEditMode && (
                            <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 p-1 rounded">
                              <Edit3 className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className={`text-[10px] px-1.5 py-0.5 rounded font-mono inline-block mb-1 ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {branch.id}
                          </div>
                          <div className="text-xs font-semibold text-blue-600 mb-0.5">{branch.title}</div>
                          <div className="text-xs font-bold mb-0.5">{branch.name}</div>
                          <div className={`text-[10px] ${themeStyle.subText}`}>پرسنلی: {branch.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Compliance Officer */}
                <div className="flex flex-col items-center justify-start">
                  {compliance && (
                    <div 
                      onClick={() => isEditMode && setEditingNode(compliance)}
                      className={`bg-slate-900 text-white rounded-xl p-4 shadow-md w-full max-w-xs text-center relative transition-all ${
                        isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                      } ${matchesSearch(compliance) ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {isEditMode && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded">
                          <Edit3 className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                        ID: {compliance.id}
                      </div>
                      <div className="inline-flex p-1.5 bg-slate-800 rounded-lg mb-2 text-slate-200">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-blue-300 mb-1">{compliance.title}</div>
                      <div className="text-sm font-bold mb-1">{compliance.name}</div>
                      <div className="text-[11px] text-slate-400">شماره پرسنلی: {compliance.id}</div>
                    </div>
                  )}
                  <div className={`text-xs ${themeStyle.subText} mt-4 text-center max-w-xs`}>
                    {compliance?.description || 'مستقیماً زیر نظر هیئت نظار جهت انطباق با قوانین بانکی و مالی (AML/CFT)'}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Modal Dialog */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-lg">ویرایش اطلاعات بخش سازمانی</h3>
              </div>
              <button 
                onClick={() => setEditingNode(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateNode(editingNode);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان / سمت سازمانی</label>
                <input
                  type="text"
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام کامل و نام پدر (ولد)</label>
                <input
                  type="text"
                  value={editingNode.name}
                  onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره پرسنلی / کد شناسه</label>
                <input
                  type="text"
                  value={editingNode.id}
                  onChange={(e) => setEditingNode({ ...editingNode, id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
                {editingNode.category === 'branch' ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteNode(editingNode.key)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-bold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف نمایندگی
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNode(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    ذخیره تغییرات
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Footer Info / Summary stats */}
      <div className={`max-w-7xl mx-auto mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs ${themeStyle.subText} print:hidden ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>مجموع پرسنل ثبت‌شده در چارت: {personnel.length} نفر | نسخه رسمی استاندارد برای د افغانستان بانک (DAB)</div>
        <div className="mt-2 sm:mt-0">شرکت صرافی و خدمات پولی برکت‌الله غفوری © تمامی حقوق محفوظ است.</div>
      </div>

      {/* Company Logo Upload Modal */}
      <CompanyLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logoUrl={customLogo}
        onSaveLogo={handleSaveLogo}
      />

      {/* High Quality PDF Export Modal */}
      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        targetElementId={getPdfExportConfig().targetId}
        defaultTitle={getPdfExportConfig().title}
        defaultFilename={getPdfExportConfig().filename}
      />

      {/* Full-Screen Print Preview Simulation Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        targetElementId={getPdfExportConfig().targetId}
        documentTitle={getPdfExportConfig().title}
        onOpenPdfExport={() => {
          setIsPrintPreviewOpen(false);
          setIsPdfModalOpen(true);
        }}
      />
    </div>
  );
}


