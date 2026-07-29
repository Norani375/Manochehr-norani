
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, UserCheck, ShieldCheck, Printer, Search, Briefcase, 
  Award, Shield, Edit3, Plus, Trash2, RotateCcw, Sun, Moon, Contrast, Check, X, User, FileText, Network, Image as ImageIcon, Download, Eye, Activity, Users, Database, Filter, Layers, EyeOff, Menu, ChevronRight, ChevronLeft, Stamp, ClipboardList
} from 'lucide-react';
import DabGuaranteeForm from '@/components/DabGuaranteeForm';
import DabBranchRenewalForm from '@/components/DabBranchRenewalForm';
import DabLicenseRenewalForm from '@/components/DabLicenseRenewalForm';
import DabLicenseRenewalLetter from '@/components/DabLicenseRenewalLetter';
import MeetingMinutes from '@/components/MeetingMinutes';
import CompanyLogoModal from '@/components/CompanyLogoModal';
import ExportPdfModal from '@/components/ExportPdfModal';
import PrintPreviewModal from '@/components/PrintPreviewModal';
import { 
  subscribePersonnel, 
  subscribeSettings, 
  saveSinglePersonnelToFirestore, 
  deletePersonnelFromFirestore, 
  savePersonnelToFirestore, 
  saveSettingsToFirestore, 
  testFirestoreConnection,
  PersonnelNode as FirebasePersonnelNode
} from '@/lib/firebase';

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
  const [activeTab, setActiveTab] = useState<'org-chart' | 'guarantee-form' | 'branch-renewal' | 'license-renewal' | 'license-renewal-letter' | 'meeting-minutes'>('org-chart');
  const [personnel, setPersonnel] = useState<PersonnelNode[]>(DEFAULT_ORG_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'contrast'>('light');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNode, setEditingNode] = useState<PersonnelNode | null>(null);

  // Logo and Header Dates state
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState('۱۴۰۴/۰۱/۰۱');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic Real-time Dashboard Stats Calculations
  const totalPersonnelCount = personnel.length;
  const boardMembersCount = personnel.filter((p) => p.category === 'board').length;
  const activeBranchesCount = personnel.filter((p) => p.category === 'branch').length;
  const executiveCount = personnel.filter((p) => p.category === 'president' || p.category === 'operations' || p.category === 'compliance').length;

  // Connection & Sync state
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Load persisted state and connect to Firebase Firestore
  useEffect(() => {
    // Verify connection to Firestore
    testFirestoreConnection().then(() => {
      setIsDbConnected(true);
    });

    const initTimer = setTimeout(() => {
      try {
        const savedPersonnel = localStorage.getItem('bg_org_chart_data');
        if (savedPersonnel) {
          setPersonnel(JSON.parse(savedPersonnel));
        }
        const savedIssueDate = localStorage.getItem('org_chart_issue_date');
        if (savedIssueDate) {
          setIssueDate(savedIssueDate);
        }
        const savedLogo = localStorage.getItem('custom_company_logo');
        if (savedLogo) {
          setCustomLogo(savedLogo);
        }
      } catch (e) {
        console.error('Failed to load local storage state', e);
      }
    }, 0);

    // Subscribe to Firestore Personnel collection
    const unsubscribePersonnel = subscribePersonnel((list) => {
      if (list && list.length > 0) {
        setPersonnel(list);
        localStorage.setItem('bg_org_chart_data', JSON.stringify(list));
      } else {
        // Seed default personnel data to Firestore if database collection is empty
        savePersonnelToFirestore(DEFAULT_ORG_DATA);
      }
    });

    // Subscribe to Firestore Settings
    const unsubscribeSettings = subscribeSettings((settings) => {
      if (settings.issueDate) {
        setIssueDate(settings.issueDate);
        localStorage.setItem('org_chart_issue_date', settings.issueDate);
      }
      if (settings.customLogo) {
        setCustomLogo(settings.customLogo);
        localStorage.setItem('custom_company_logo', settings.customLogo);
      }
    });

    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('custom_company_logo');
      const currentIssueDate = localStorage.getItem('org_chart_issue_date') || '۱۴۰۴/۰۱/۰۱';
      setCustomLogo(updatedLogo);
      saveSettingsToFirestore({ issueDate: currentIssueDate, customLogo: updatedLogo });
    };
    window.addEventListener('custom_logo_updated', handleLogoUpdate);

    return () => {
      clearTimeout(initTimer);
      unsubscribePersonnel();
      unsubscribeSettings();
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
    saveSettingsToFirestore({ issueDate, customLogo: logoDataUrl });
  };

  const handleIssueDateChange = (newDate: string) => {
    setIssueDate(newDate);
    localStorage.setItem('org_chart_issue_date', newDate);
    saveSettingsToFirestore({ issueDate: newDate, customLogo });
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
      case 'license-renewal-letter':
        return {
          targetId: 'dab-license-renewal-letter-canvas',
          title: 'مکتوب رسمی درخواست تمدید جواز فعالیت (د افغانستان بانک)',
          filename: 'مکتوب_تمدید_جواز_برکت_الله_غفوری_DAB.pdf',
        };
      case 'meeting-minutes':
        return {
          targetId: 'meeting-minutes-canvas',
          title: 'صورتجلسه مجمع عمومی عادی سالانه شرکت برکت‌الله غفوری',
          filename: 'صورتجلسه_مجمع_عمومی_برکت_الله_غفوری.pdf',
        };
      default:
        return {
          targetId: 'org-chart-export-canvas',
          title: 'چارت تشکیلاتی و ساختار سازمانی شرکت صرافی برکت‌الله غفوری',
          filename: 'چارت_سازمانی_برکت_الله_غفوری_د_افغانستان_بانک.pdf',
        };
    }
  };

  // Save to local storage and sync to Firestore
  const savePersonnel = (newData: PersonnelNode[]) => {
    setPersonnel(newData);
    try {
      localStorage.setItem('bg_org_chart_data', JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save org chart to storage', e);
    }
    savePersonnelToFirestore(newData);
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات چارت را به حالت اولیه بازگردانید؟')) {
      savePersonnel(DEFAULT_ORG_DATA);
    }
  };

  const handleUpdateNode = (updated: PersonnelNode) => {
    const nextData = personnel.map(p => p.key === updated.key ? updated : p);
    savePersonnel(nextData);
    saveSinglePersonnelToFirestore(updated);
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
    saveSinglePersonnelToFirestore(newNode);
    setEditingNode(newNode);
  };

  const handleDeleteNode = (key: string) => {
    if (confirm('آیا از حذف این رکورد اطمینان دارید؟')) {
      const nextData = personnel.filter(p => p.key !== key);
      savePersonnel(nextData);
      deletePersonnelFromFirestore(key);
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
  const filteredBranches = selectedBranchFilter === 'all' 
    ? branches 
    : branches.filter(b => b.key === selectedBranchFilter);
  const selectedBranchObj = branches.find(b => b.key === selectedBranchFilter);

  return (
    <div className={`min-h-screen ${themeStyle.bg} font-sans flex flex-col lg:flex-row transition-colors duration-200 print:bg-white print:text-black print:block dir-rtl`}>
      
      {/* Mobile Top Header Bar (hidden on desktop & print) */}
      <div className="lg:hidden bg-blue-950 text-white p-3.5 border-b border-blue-900 flex items-center justify-between print:hidden sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 bg-blue-900 hover:bg-blue-800 rounded-xl transition-all cursor-pointer border border-blue-700"
            title="باز کردن سایدبار منو"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
          <div className="flex items-center gap-2">
            {customLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={customLogo} alt="Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
            ) : (
              <Building2 className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <span className="font-extrabold text-xs sm:text-sm truncate max-w-[200px]">برکت‌الله غفوری</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="خروجی PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs transition-all cursor-pointer"
            title="چاپ"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden print:hidden"
        />
      )}

      {/* Sidebar Component (RTL right-side sidebar) */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-80 shrink-0 bg-slate-900 text-slate-100 border-l border-slate-800 shadow-xl flex flex-col justify-between z-50 transition-transform duration-300 print:hidden overflow-y-auto ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Sidebar Header / Branding */}
          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                {customLogo ? (
                  <div
                    onClick={() => setIsLogoModalOpen(true)}
                    className="relative group cursor-pointer shrink-0"
                    title="مدیریت لوگو اختصاصی"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customLogo}
                      alt="Logo"
                      className="w-11 h-11 object-contain rounded-xl border-2 border-amber-400 bg-white p-0.5 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shrink-0 font-bold shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="font-black text-sm text-white leading-tight">شرکت صرافی برکت‌الله غفوری</h1>
                  <p className="text-[11px] text-slate-400 mt-0.5">منوی خدمات د افغانستان بانک</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DB Connection Status Badge */}
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium">
              <span className="text-[11px] text-slate-300">وضعیت دیتابیس:</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isDbConnected ? 'برقرار (Firebase Live)' : 'در حال اتصال...'}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Main Pages & DAB Forms */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 mb-2 px-1">
              منوی صفحات و فرم‌های رسمی
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('org-chart'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'org-chart'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Network className={`w-4 h-4 ${activeTab === 'org-chart' ? 'text-white' : 'text-blue-400'}`} />
                  <span>چارت تشکیلاتی شرکت</span>
                </div>
                {activeTab === 'org-chart' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>

              <button
                onClick={() => { setActiveTab('guarantee-form'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'guarantee-form'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'guarantee-form' ? 'text-white' : 'text-amber-400'}`} />
                  <span>فورم تضمین سر سهمدار</span>
                </div>
                {activeTab === 'guarantee-form' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>

              <button
                onClick={() => { setActiveTab('branch-renewal'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'branch-renewal'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className={`w-4 h-4 ${activeTab === 'branch-renewal' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>فورم تمدید نمایندگی (DAB)</span>
                </div>
                {activeTab === 'branch-renewal' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>

              <button
                onClick={() => { setActiveTab('license-renewal'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'license-renewal'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'license-renewal' ? 'text-white' : 'text-purple-400'}`} />
                  <span>فورم تمدید جواز شرکت (DAB)</span>
                </div>
                {activeTab === 'license-renewal' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>

              <button
                onClick={() => { setActiveTab('license-renewal-letter'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'license-renewal-letter'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Stamp className={`w-4 h-4 ${activeTab === 'license-renewal-letter' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>مکتوب رسمی تمدید جواز</span>
                </div>
                {activeTab === 'license-renewal-letter' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>

              <button
                onClick={() => { setActiveTab('meeting-minutes'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'meeting-minutes'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className={`w-4 h-4 ${activeTab === 'meeting-minutes' ? 'text-white' : 'text-orange-400'}`} />
                  <span>صورتجلسه (Meeting Minutes)</span>
                </div>
                {activeTab === 'meeting-minutes' && <ChevronLeft className="w-4 h-4 text-blue-200" />}
              </button>
            </nav>
          </div>

          {/* Section 2: Org Chart Specific Controls */}
          {activeTab === 'org-chart' && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 px-1">
                ابزارها و فیلتر چارت
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو نام، سمت یا ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Branch Filter Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 px-1 font-semibold flex items-center gap-1">
                  <Filter className="w-3 h-3 text-blue-400" />
                  تمرکز نمای نمایندگی:
                </label>
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">نمای کامل چارت (همه نمایندگی‌ها)</option>
                  <optgroup label="تمرکز بر نمایندگی خاص">
                    {branches.map((b) => (
                      <option key={b.key} value={b.key}>
                        تمرکز بر: {b.title} ({b.name})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Edit Mode & Reset Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isEditMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditMode ? 'خروج ویرایش' : 'ویرایش چارت'}
                </button>

                <button
                  onClick={handleReset}
                  title="بازنشانی چارت به حالت اولیه"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Document Export & Print Menu */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 px-1">
              خروجی اسناد و چاپ
            </div>

            <button
              onClick={() => { setIsLogoModalOpen(true); setIsMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>{customLogo ? 'تغییر / مدیریت لوگو' : 'آپلود لوگوی شرکت'}</span>
            </button>

            <button
              onClick={() => { setIsPrintPreviewOpen(true); setIsMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-blue-900/60 hover:bg-blue-900 text-blue-100 border border-blue-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-blue-300" />
              <span>پیش‌نمایش نسخه چاپ</span>
            </button>

            <button
              onClick={() => { setIsPdfModalOpen(true); setIsMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>ذخیره PDF با کیفیت بالا</span>
            </button>

            <button
              onClick={() => { window.print(); setIsMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>چاپ مستقیم (Print)</span>
            </button>
          </div>

          {/* Section 4: Theme Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 px-1">
              تنظیمات پوسته
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>روشن</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-700 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>تاریک</span>
              </button>

              <button
                onClick={() => setTheme('contrast')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  theme === 'contrast' ? 'bg-black text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Contrast className="w-3.5 h-3.5 text-white" />
                <span>چاپ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[10px] text-slate-400">
          <div>سامانه رسمی شرکت صرافی برکت‌الله غفوری</div>
          <div className="text-slate-500 font-mono mt-0.5">DAB License: DAB/7-0965</div>
        </div>
      </aside>

      {/* Main Content View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        {/* Conditional Content Rendering */}
        {activeTab === 'guarantee-form' ? (
        <DabGuaranteeForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : activeTab === 'branch-renewal' ? (
        <DabBranchRenewalForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : activeTab === 'license-renewal' ? (
        <DabLicenseRenewalForm customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
      ) : activeTab === 'license-renewal-letter' ? (
        <DabLicenseRenewalLetter customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} />
      ) : activeTab === 'meeting-minutes' ? (
        <MeetingMinutes customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} />
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
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{isDbConnected ? 'دیتابیس متصل (Firebase Live Sync)' : 'در حال اتصال به دیتابیس...'}</span>
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
          
          {/* Printable Official Header Banner with Custom Logo & Issue Date */}
          <div className="w-full max-w-4xl mb-4 p-3.5 sm:p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-slate-900 text-right dir-rtl">
            <div className="flex items-center gap-3">
              {customLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customLogo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border border-slate-300 rounded-xl p-1 bg-white shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-blue-900 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">شرکت صرافی و خدمات پولی برکت‌الله غفوری</h2>
                <p className="text-xs text-slate-700 font-bold mt-0.5">چارت تشکیلاتی و ساختار سازمانی رسمی - د افغانستان بانک (DAF/DAB)</p>
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-600 mt-1 font-sans">
                  <span className="font-mono bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-bold">
                    شماره جواز: DAB/7-0965
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-800">تاریخ صدور / اجرا:</strong>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={issueDate}
                        onChange={(e) => handleIssueDateChange(e.target.value)}
                        className="px-2 py-0.5 border border-amber-400 rounded bg-amber-50 text-xs font-mono font-bold text-slate-900 w-28 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="1404/01/01"
                      />
                    ) : (
                      <span className="font-mono font-bold text-blue-950 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs">
                        {issueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-left dir-ltr font-mono text-xs text-slate-600 border-l pl-3.5 border-slate-200">
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">DAF / DAB Standard Page</span>
                <span className="text-slate-900 font-bold mt-0.5">
                  Date of Issue: <span className="text-blue-950 font-extrabold">{issueDate}</span>
                </span>
                <span className="text-[10px] text-slate-500">Ref: DAB/7-0965/ORG</span>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center text-center text-xs text-slate-600 border-r pr-3.5 border-slate-300">
                <span className="font-bold text-slate-900 mb-0.5 text-[11px]">محل مهر و امضاء</span>
                <div className="w-22 h-10 border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[10px] text-slate-400 bg-slate-50/50">
                  مهر رسمی شرکت
                </div>
              </div>
            </div>
          </div>

          {/* Active Branch Focus Mode Banner */}
          {selectedBranchFilter !== 'all' && selectedBranchObj && (
            <div className="w-full max-w-4xl mb-4 p-3 bg-blue-900 text-white border-2 border-blue-950 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 text-right dir-rtl print:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-800/80 rounded-xl border border-blue-700 shrink-0">
                  <Filter className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-blue-200">حالت نمای تمرکز تک‌صفحه‌ای:</span>
                    <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                      {selectedBranchObj.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100/90 mt-0.5">
                    نمایش اختصاصی <strong className="text-white">{selectedBranchObj.name}</strong> با مسیر گزارش‌دهی به مدیر عملیاتی (<strong className="text-white">{operations?.name || ''}</strong>) و رئیس اجرائیه (<strong className="text-white">{president?.name || ''}</strong>).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBranchFilter('all')}
                className="bg-white hover:bg-slate-100 text-blue-950 font-extrabold px-3 py-1 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm border border-blue-200 print:hidden flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-blue-900" />
                نمای کامل
              </button>
            </div>
          )}
          
          {/* Level 1: President */}
          {president && (
            <div className="flex flex-col items-center relative group">
              <div 
                onClick={() => isEditMode && setEditingNode(president)}
                className={`bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-4 shadow-lg border-2 border-blue-800 w-72 text-center relative transition-all ${
                  isEditMode ? 'cursor-pointer hover:ring-4 hover:ring-amber-400/50 hover:scale-102' : ''
                } ${matchesSearch(president) ? 'ring-2 ring-blue-400' : ''}`}
              >
                {isEditMode && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-sm">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="inline-flex p-1.5 bg-blue-800/50 rounded-xl mb-1 text-blue-200">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold mb-0.5">{president.title}</div>
                <div className="text-base font-bold mb-0.5">{president.name}</div>
              </div>

              {/* Vertical connector */}
              <div className={`h-6 w-0.5 ${themeStyle.connector} my-0.5`}></div>
            </div>
          )}

          {/* Level 2: Board of Supervisors Box */}
          <div className="flex flex-col items-center relative w-full max-w-4xl">
            <div className={`${themeStyle.cardBg} rounded-2xl p-4 sm:p-5 shadow-md border w-full`}>
              <div className="text-center mb-4">
                <span className={`inline-flex items-center gap-2 border px-3.5 py-1 rounded-full text-xs font-bold ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  هیئت نظار (شورای نظارت عالی)
                </span>
              </div>

              {/* Board Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {boardMembers.map((member) => (
                  <div 
                    key={member.key}
                    onClick={() => isEditMode && setEditingNode(member)}
                    className={`${themeStyle.nodeCardBg} rounded-xl p-3 shadow-sm border relative transition-all ${
                      isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                    } ${matchesSearch(member) ? themeStyle.highlight : ''}`}
                  >
                    {isEditMode && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded">
                        <Edit3 className="w-3 h-3" />
                      </div>
                    )}
                    <div className="flex items-center justify-end mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mb-0.5">{member.title}</div>
                    <div className="text-xs font-extrabold mb-0.5">{member.name}</div>
                  </div>
                ))}
              </div>

              {/* Vertical Connector Down to Sub-units */}
              <div className="relative flex justify-center">
                <div className={`w-0.5 h-5 ${themeStyle.connector}`}></div>
              </div>

              {/* Level 3: Operations Manager & Compliance Officer */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                
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
                      <div className="inline-flex p-1.5 bg-slate-800 rounded-lg mb-2 text-slate-200">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-blue-300 mb-1">{operations.title}</div>
                      <div className="text-sm font-bold mb-1">{operations.name}</div>
                    </div>
                  )}

                  {/* Vertical connector to branches */}
                  <div className={`w-0.5 h-4 ${themeStyle.connector} my-1`}></div>

                  {/* Regional Representatives - Peer Level under Operations Manager */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${themeStyle.subText} flex items-center gap-1`}>
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {selectedBranchFilter === 'all' 
                          ? 'نمایندگی‌های هم‌سطح (تحت اثر مستقیم مدیر عملیاتی)'
                          : `نمایندگی تمرکز یافته: ${selectedBranchObj?.title || ''}`
                        }
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedBranchFilter !== 'all' && (
                          <button
                            onClick={() => setSelectedBranchFilter('all')}
                            className="text-[11px] bg-blue-900 text-white hover:bg-blue-800 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Layers className="w-3 h-3" />
                            نمایش همه نمایندگی‌ها
                          </button>
                        )}
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
                    </div>

                    {/* Tree connector graphic for peer-level branches */}
                    <div className="relative w-full">
                      {/* Central vertical drop line from Operations Manager */}
                      <div className={`w-0.5 h-3 mx-auto ${themeStyle.connector}`}></div>
                      
                      {/* Horizontal tree line linking peer branches */}
                      {filteredBranches.length > 1 && (
                        <div className={`h-0.5 w-[85%] mx-auto ${themeStyle.connector}`}></div>
                      )}

                      {/* Peer Representatives Grid on same horizontal row */}
                      <div className={`grid gap-3 mt-1 ${
                        filteredBranches.length === 1 
                          ? 'grid-cols-1 max-w-sm mx-auto' 
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                      }`}>
                        {filteredBranches.map((branch) => (
                          <div key={branch.key} className="flex flex-col items-center">
                            {/* Individual drop line to node */}
                            <div className={`w-0.5 h-2.5 ${themeStyle.connector}`}></div>

                            <div 
                              onClick={() => isEditMode && setEditingNode(branch)}
                              className={`${themeStyle.nodeCardBg} rounded-xl p-3 border text-center shadow-xs relative transition-all w-full ${
                                isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                              } ${matchesSearch(branch) ? themeStyle.highlight : ''} ${
                                selectedBranchFilter === branch.key ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md' : ''
                              }`}
                            >
                              {isEditMode && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 p-1 rounded">
                                  <Edit3 className="w-2.5 h-2.5" />
                                </div>
                              )}

                              {/* Card Header with Focus Button */}
                              <div className="flex items-center justify-end gap-1 mb-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBranchFilter(selectedBranchFilter === branch.key ? 'all' : branch.key);
                                  }}
                                  title={selectedBranchFilter === branch.key ? 'خروج از حالت تمرکز' : 'تمرکز تک‌نمایندگی'}
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                                    selectedBranchFilter === branch.key
                                      ? 'bg-blue-900 text-white shadow-xs'
                                      : 'bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  <Filter className="w-2.5 h-2.5" />
                                  {selectedBranchFilter === branch.key ? 'تمرکز فعال' : 'تمرکز'}
                                </button>
                              </div>

                              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-0.5">{branch.title}</div>
                              <div className="text-xs font-extrabold mb-0.5">{branch.name}</div>
                              <div className={`text-[10px] ${themeStyle.subText}`}>پست: نماینده هم‌سطح عملیاتی</div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                      <div className="inline-flex p-1.5 bg-slate-800 rounded-lg mb-2 text-slate-200">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-blue-300 mb-1">{compliance.title}</div>
                      <div className="text-sm font-bold mb-1">{compliance.name}</div>
                    </div>
                  )}
                  <div className={`text-xs ${themeStyle.subText} mt-4 text-center max-w-xs`}>
                    {compliance?.description || 'مستقیماً زیر نظر هیئت نظار جهت انطباق با قوانین بانکی و مالی (AML/CFT)'}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Standard Official Signature Area */}
          <div className="mt-12 pt-8 border-t border-slate-300 flex items-end justify-between px-10">
            <div className="text-center">
              <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold p-3 text-center">
                <span>محل مهر رسمی</span>
                <span className="text-[9px] mt-1">DAB/7-0965</span>
              </div>
            </div>

            <div className="text-center space-y-1.5 min-w-[240px]">
              <div className="font-bold text-slate-700 text-sm">با احترام؛</div>
              <div className="font-black text-lg text-slate-950">برکت‌الله ولد عبدالغفور</div>
              <div className="text-xs font-bold text-blue-900">رئیس هیئت مدیره و مالک شرکت صرافی و خدمات پولی برکت‌الله غفوری</div>
              <div className="pt-10 font-bold text-slate-600 text-xs border-t border-slate-300 mt-2">
                امضاء و شصت
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
      </main>

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


