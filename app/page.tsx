
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, UserCheck, ShieldCheck, Printer, Search, Briefcase, 
  Award, Shield, Edit3, Plus, Trash2, RotateCcw, Sun, Moon, Contrast, Check, X, User, FileText, Network, Image as ImageIcon, Download, Eye, Activity, Users, Database, Filter, Layers, EyeOff, Menu, ChevronRight, ChevronLeft, Stamp, ClipboardList, ClipboardCheck, BookOpen
} from 'lucide-react';
import DabGuaranteeForm from '@/components/DabGuaranteeForm';
import DabBranchRenewalForm from '@/components/DabBranchRenewalForm';
import DabLicenseRenewalForm from '@/components/DabLicenseRenewalForm';
import DabLicenseRenewalLetter from '@/components/DabLicenseRenewalLetter';
import MeetingMinutes from '@/components/MeetingMinutes';
import DabLicenseChecklist from '@/components/DabLicenseChecklist';
import EmployeeManagement from '@/components/EmployeeManagement';
import CompanyArticles from '@/components/CompanyArticles';
import CompanyProposal from '@/components/CompanyProposal';
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
  PersonnelNode as FirebasePersonnelNode,
  subscribeEmployees,
  DEFAULT_EMPLOYEES,
  seedEmployees
} from '@/lib/firebase';

interface PersonnelNode {
  key: string;
  title: string;
  name: string;
  id: string;
  category: 'president' | 'board' | 'operations' | 'compliance' | 'branch' | 'executive';
  description?: string;
}

const DEFAULT_ORG_DATA: PersonnelNode[] = [
  {
    key: 'president',
    title: 'رئیس شرکت',
    name: 'برکت‌الله ولد عبدالغفور',
    id: '55522',
    category: 'executive'
  },
  {
    key: 'supervisory_chairman',
    title: 'رئیس هیئت نظار',
    name: 'بسم‌الله شیرزی ولد دوستمحمد',
    id: '45188',
    category: 'board'
  },
  {
    key: 'board_member_1',
    title: 'عضو هیئت نظار',
    name: 'برکت‌الله غفوری ولد عبدالغفور',
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
    category: 'executive'
  },
  {
    key: 'compliance_officer',
    title: 'مسئول پیروی از قوانین',
    name: 'محمد فهیم ولد محمد امان',
    id: '97484',
    category: 'executive'
  },
  {
    key: 'branch_takhar',
    title: 'نماینده ولایت تخار',
    name: 'رحمت‌الله ولد فیض‌الله',
    id: '29384',
    category: 'branch'
  },
  {
    key: 'branch_takhar_treasurer',
    title: 'خزانه‌دار نمایندگی تخار',
    name: 'عبیدالله ولد نصرالله',
    id: '48392',
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
    key: 'branch_kabul_member',
    title: 'عضو نمایندگی کابل',
    name: 'ریحان ولد شیرآغا',
    id: '12345',
    category: 'branch'
  },
  {
    key: 'branch_kabul_sec',
    title: 'منشی و خزانه‌دار کابل',
    name: 'صدیق‌الله ولد حبیب‌الله',
    id: '67890',
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
    key: 'branch_imam_sahib_treasurer',
    title: 'خزانه‌دار امام‌صاحب',
    name: 'عبدالمجید ولد محمدیوسف',
    id: '54321',
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
  const [activeTab, setActiveTab] = useState<'org-chart' | 'guarantee-form' | 'branch-renewal' | 'license-renewal' | 'license-renewal-letter' | 'meeting-minutes' | 'license-checklist' | 'employees' | 'company-articles' | 'company-proposal'>('org-chart');
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

    // Subscribe to employees and seed missing ones if necessary
    let isSeeding = false;
    const unsubscribeEmployees = subscribeEmployees(async (list) => {
      if (isSeeding) return;
      
      const existingIds = new Set(list.map(e => e.id));
      const missingAny = DEFAULT_EMPLOYEES.some(de => !existingIds.has(de.id));
      
      if (missingAny) {
        isSeeding = true;
        console.log('Seeding missing employees...');
        await seedEmployees(DEFAULT_EMPLOYEES);
        isSeeding = false;
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
      unsubscribeEmployees();
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
      case 'license-checklist':
        return {
          targetId: 'license-checklist-canvas',
          title: 'چک‌لست اسناد و شرایط صدور جواز فعالیت',
          filename: 'چک_لست_اسناد_جواز_برکت_الله_غفوری.pdf',
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

  const getNode = (key: string) => {
    let node = personnel.find(p => p.key === key);
    if (!node) {
      if (key === 'president') {
        node = personnel.find(p => p.key === 'chairman' || p.title.includes('رئیس شرکت'));
      } else if (key === 'operations_manager') {
        node = personnel.find(p => p.key === 'operations_head' || p.title.includes('عملیاتی'));
      } else if (key === 'compliance_officer') {
        node = personnel.find(p => p.key === 'compliance' || p.title.includes('قوانین') || p.title.includes('رعایت قوانین'));
      }
    }
    return node;
  };
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
    <div className={`min-h-screen ${themeStyle.bg} font-sans flex flex-col lg:flex-row items-start transition-colors duration-200 print:bg-white print:text-black print:block dir-rtl overflow-x-hidden`}>
      
      {/* Mobile Top Header Bar (hidden on desktop & print) */}
      <div className="lg:hidden bg-blue-950 text-white p-3.5 border-b border-blue-900 flex items-center justify-between print:hidden sticky top-0 z-40 shadow-md w-full">
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
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none flex flex-col justify-between z-50 transition-transform duration-300 print:hidden overflow-y-auto ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Sidebar Header / Branding */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                {customLogo ? (
                  <div
                    onClick={() => setIsLogoModalOpen(true)}
                    className="relative group cursor-pointer shrink-0 transition-transform hover:scale-105"
                    title="مدیریت لوگو اختصاصی"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customLogo}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 font-bold shadow-lg shadow-blue-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">برکت‌الله غفوری</h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">خدمات صرافی و پولی</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DB Connection Status Badge */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl text-[11px] font-semibold">
              <span className="text-slate-500 dark:text-slate-400">وضعیت اتصال:</span>
              <div className={`flex items-center gap-1.5 font-bold ${isDbConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></span>
                <span>{isDbConnected ? 'متصل (Live)' : 'در حال اتصال...'}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Main Pages & DAB Forms */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">
              منوی عملیاتی و فرم‌ها
            </div>
            <nav className="space-y-1">
              {[
                { id: 'org-chart', icon: Network, label: 'چارت تشکیلاتی', color: 'text-blue-500' },
                { id: 'guarantee-form', icon: FileText, label: 'تعهدنامه سهمدار', color: 'text-amber-500' },
                { id: 'branch-renewal', icon: Building2, label: 'تمدید نمایندگی', color: 'text-emerald-500' },
                { id: 'license-renewal', icon: ShieldCheck, label: 'تمدید جواز شرکت', color: 'text-purple-500' },
                { id: 'license-renewal-letter', icon: Stamp, label: 'مکتوب رسمی', color: 'text-indigo-500' },
                { id: 'company-proposal', icon: FileText, label: 'پیشنهاد به هیئت نظار', color: 'text-rose-500' },
                { id: 'meeting-minutes', icon: ClipboardList, label: 'صورتجلسات', color: 'text-orange-500' },
                { id: 'license-checklist', icon: ClipboardCheck, label: 'چک‌لست اسناد', color: 'text-pink-500' },
                { id: 'employees', icon: Users, label: 'مدیریت کارمندان', color: 'text-teal-500' },
                { id: 'company-articles', icon: BookOpen, label: 'اساسنامه شرکت', color: 'text-amber-600' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 transition-colors ${activeTab === item.id ? 'text-white' : item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronLeft className="w-4 h-4 text-blue-200" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Edit Mode Toggle */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditMode ? 'خروج از حالت ویرایش' : 'فعالسازی ویرایش'}
            </button>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setIsPrintPreviewOpen(true); setIsMobileSidebarOpen(false); }}
              className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all group"
            >
              <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold">پیش‌نمایش</span>
            </button>
            <button
              onClick={() => { setIsPdfModalOpen(true); setIsMobileSidebarOpen(false); }}
              className="flex flex-col items-center justify-center gap-1 p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800 transition-all group"
            >
              <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold">خروجی PDF</span>
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'light', icon: Sun, label: 'روشن' },
              { id: 'dark', icon: Moon, label: 'تاریک' },
              { id: 'contrast', icon: Contrast, label: 'چاپ' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  theme === t.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="pt-2 text-center">
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">سامانه مدیریت صرافی برکت‌الله غفوری</p>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tight">V 2.5.0 • DAB/7-0965</p>
          </div>
        </div>
      </aside>

      {/* Main Content View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        {/* Conditional Content Rendering */}
        {activeTab === 'guarantee-form' ? (
          <DabGuaranteeForm isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'branch-renewal' ? (
          <DabBranchRenewalForm isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'license-renewal' ? (
          <DabLicenseRenewalForm isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'license-renewal-letter' ? (
          <DabLicenseRenewalLetter isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'company-proposal' ? (
          <CompanyProposal customLogo={customLogo} />
        ) : activeTab === 'meeting-minutes' ? (
          <MeetingMinutes isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'license-checklist' ? (
          <DabLicenseChecklist isEditMode={isEditMode} customLogo={customLogo} onOpenLogoModal={() => setIsLogoModalOpen(true)} onExportPdf={() => setIsPdfModalOpen(true)} />
        ) : activeTab === 'employees' ? (
          <EmployeeManagement customLogo={customLogo} isEditMode={isEditMode} />
        ) : activeTab === 'company-articles' ? (
          <CompanyArticles customLogo={customLogo} />
        ) : (
        <>
          {/* Real-time Live Dashboard Stats Widget */}
          <div className="max-w-7xl mx-auto mb-8 px-4 print:hidden dir-rtl">
            <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-slate-200/60 text-slate-900'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                      داشبورد مدیریت و آمار ساختاری
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      تجزیه و تحلیل زنده منابع انسانی و شبکه‌ی شعب شرکت برکت‌الله غفوری
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 transition-colors">
                  <Database className={`w-3.5 h-3.5 ${isDbConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className={`text-[11px] font-bold ${isDbConnected ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}`}>
                    {isDbConnected ? 'اتصال هوشمند فعال' : 'در حال هماهنگی...'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'کل پرسنل فعال', count: totalPersonnelCount, sub: 'نفر کادر اداری', icon: Users, color: 'blue', search: '' },
                  { label: 'نمایندگی‌های رسمی', count: activeBranchesCount, sub: 'شعبه در ولایات', icon: Building2, color: 'emerald', search: 'نماینده' },
                  { label: 'اعضای هیئت نظار', count: boardMembersCount, sub: 'شورای نظارت عالی', icon: ShieldCheck, color: 'amber', search: 'نظار' },
                  { label: 'مدیران کلیدی', count: executiveCount, sub: 'کادر اجرایی ارشد', icon: Briefcase, color: 'purple', search: 'مدیر' },
                ].map((stat, i) => (
                  <div 
                    key={i}
                    onClick={() => setSearchTerm(stat.search)}
                    className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                      theme === 'dark'
                        ? `bg-slate-800/40 border-slate-700 hover:border-${stat.color}-500/50`
                        : `bg-slate-50/50 border-slate-100 hover:border-${stat.color}-200`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        theme === 'dark' ? `text-${stat.color}-400` : `text-${stat.color}-700`
                      }`}>{stat.label}</span>
                      <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                        theme === 'dark' ? `bg-${stat.color}-900/40 text-${stat.color}-400` : `bg-${stat.color}-100 text-${stat.color}-700`
                      }`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono tracking-tighter">{stat.count}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Org Chart Layout Canvas */}
      <div className="max-w-7xl mx-auto overflow-x-auto pb-12 print:overflow-visible">
        <div id="org-chart-export-canvas" className="min-w-[950px] flex flex-col items-center py-6 px-4 bg-white dark:bg-slate-900 rounded-2xl">
          
          {/* Printable Official Header Banner with Custom Logo & Issue Date */}
          <div className="w-full max-w-4xl mb-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm flex flex-wrap items-center justify-between gap-6 text-slate-900 text-right dir-rtl">
            <div className="flex items-center gap-5">
              {customLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customLogo}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain border border-slate-100 dark:border-slate-800 rounded-2xl p-2 bg-white shadow-sm shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-lg shadow-blue-500/20">
                  <Building2 className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">شرکت صرافی و خدمات پولی برکت‌الله غفوری</h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold mt-1">ساختار سازمانی و چارت تشکیلاتی رسمی (DAB Standard)</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] mt-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 font-bold">
                    DAB License: DAB/7-0965
                  </span>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                    <strong className="text-blue-900 dark:text-blue-300">تاریخ اجرا:</strong>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={issueDate}
                        onChange={(e) => handleIssueDateChange(e.target.value)}
                        className="bg-transparent border-none p-0 text-xs font-mono font-black text-blue-950 dark:text-blue-100 w-24 focus:outline-none"
                        placeholder="1404/01/01"
                      />
                    ) : (
                      <span className="font-mono font-black text-blue-900 dark:text-blue-100">
                        {issueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col text-left dir-ltr font-mono text-[10px] text-slate-400 border-l pl-4 border-slate-100 dark:border-slate-800">
                <span className="font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">OFFICIAL DOCUMENT</span>
                <span className="text-slate-500 font-bold mt-1">Ref: DAB/7-0965/ORG</span>
                <span className="text-blue-600/60 font-bold">ID: {activeBranchesCount}.{boardMembersCount}.{totalPersonnelCount}</span>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center text-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[100px]">
                <span className="font-bold text-slate-400 dark:text-slate-500 mb-1 text-[9px] uppercase tracking-tighter">Seal & Stamp</span>
                <div className="w-full h-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-[9px] text-slate-300 dark:text-slate-600 italic">
                  مهر رسمی
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
                className={`bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] p-6 shadow-2xl border border-slate-800 dark:border-slate-700 w-80 text-center relative transition-all duration-300 ${
                  isEditMode ? 'cursor-pointer hover:ring-4 hover:ring-amber-400/30 hover:scale-105' : ''
                } ${matchesSearch(president) ? 'ring-4 ring-blue-500' : ''}`}
              >
                {isEditMode && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 p-2 rounded-2xl shadow-xl border-4 border-white dark:border-slate-800">
                    <Edit3 className="w-4 h-4" />
                  </div>
                )}
                <div className="inline-flex p-3 bg-blue-500/20 rounded-2xl mb-3 text-blue-400">
                  <Award className="w-7 h-7" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-black mb-1">{president.title}</div>
                <div className="text-xl font-black tracking-tight">{president.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-bold tracking-widest uppercase">Chairman & Founder</div>
              </div>

              {/* Vertical connector */}
              <div className={`h-8 w-px ${themeStyle.connector} opacity-50`}></div>
            </div>
          )}

          {/* Level 2: Board of Supervisors Box */}
          <div className="flex flex-col items-center relative w-full max-w-5xl">
            <div className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-slate-50/50'} rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm w-full transition-colors`}>
              <div className="text-center mb-8">
                <span className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-black tracking-wide shadow-sm ${
                  theme === 'dark' ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-white text-blue-900 border border-slate-200'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  هیئت نظار • شورای نظارت عالی شرکت
                </span>
              </div>

              {/* Board Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {boardMembers.map((member) => (
                  <div 
                    key={member.key}
                    onClick={() => isEditMode && setEditingNode(member)}
                    className={`bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-sm border transition-all duration-300 relative ${
                      isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 hover:scale-102' : ''
                    } ${matchesSearch(member) ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800'}`}
                  >
                    {isEditMode && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 p-1.5 rounded-xl">
                        <Edit3 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board</span>
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{member.title}</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{member.name}</div>
                  </div>
                ))}
              </div>

              {/* Vertical Connector Down to Sub-units */}
              <div className="relative flex justify-center">
                <div className={`w-px h-6 ${themeStyle.connector} opacity-50`}></div>
              </div>

              {/* Level 3: Operations Manager & Compliance Officer */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                
                {/* Left Side: Operations Manager & Regional Reps */}
                <div className="flex flex-col items-center">
                  {operations && (
                    <div 
                      onClick={() => isEditMode && setEditingNode(operations)}
                      className={`bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-5 shadow-xl w-full max-w-xs text-center relative transition-all duration-300 ${
                        isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                      } ${matchesSearch(operations) ? 'ring-4 ring-blue-500/30' : ''}`}
                    >
                      {isEditMode && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 p-1.5 rounded-xl">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="inline-flex p-2 bg-slate-800 dark:bg-slate-700 rounded-xl mb-3 text-slate-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">{operations.title}</div>
                      <div className="text-base font-black">{operations.name}</div>
                    </div>
                  )}

                  {/* Vertical connector to branches */}
                  <div className={`w-px h-6 ${themeStyle.connector} opacity-50 my-1`}></div>

                  {/* Regional Representatives - Peer Level under Operations Manager */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">شبکه نمایندگی‌های سراسری</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedBranchFilter !== 'all' && (
                          <button
                            onClick={() => setSelectedBranchFilter('all')}
                            className="text-[10px] bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-full font-black transition-all cursor-pointer shadow-md"
                          >
                            نمایش همه
                          </button>
                        )}
                        {isEditMode && (
                          <button
                            onClick={handleAddRepresentative}
                            className="flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full font-black transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            افزودن
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tree connector graphic for peer-level branches */}
                    <div className="relative w-full">
                      {/* Central vertical drop line from Operations Manager */}
                      <div className={`w-px h-4 mx-auto ${themeStyle.connector} opacity-50`}></div>
                      
                      {/* Horizontal tree line linking peer branches */}
                      {filteredBranches.length > 1 && (
                        <div className={`h-px w-[90%] mx-auto ${themeStyle.connector} opacity-50`}></div>
                      )}

                      {/* Peer Representatives Grid on same horizontal row */}
                      <div className={`grid gap-4 mt-2 ${
                        filteredBranches.length === 1 
                          ? 'grid-cols-1 max-w-sm mx-auto' 
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {filteredBranches.map((branch) => (
                          <div key={branch.key} className="flex flex-col items-center">
                            {/* Individual drop line to node */}
                            <div className={`w-px h-3 ${themeStyle.connector} opacity-50`}></div>

                            <div 
                              onClick={() => isEditMode && setEditingNode(branch)}
                              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border text-center shadow-sm relative transition-all duration-300 w-full ${
                                isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                              } ${matchesSearch(branch) ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800'} ${
                                selectedBranchFilter === branch.key ? 'border-blue-600 ring-4 ring-blue-600/10' : ''
                              }`}
                            >
                              {isEditMode && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-lg">
                                  <Edit3 className="w-3 h-3" />
                                </div>
                              )}

                              <div className="flex items-center justify-end mb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBranchFilter(selectedBranchFilter === branch.key ? 'all' : branch.key);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    selectedBranchFilter === branch.key
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Filter className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[11px] font-black text-blue-600 dark:text-blue-400 mb-1">{branch.title}</div>
                              <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">{branch.name}</div>
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
                      className={`bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-5 shadow-xl w-full max-w-xs text-center relative transition-all duration-300 ${
                        isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                      } ${matchesSearch(compliance) ? 'ring-4 ring-blue-500/30' : ''}`}
                    >
                      {isEditMode && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 p-1.5 rounded-xl">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="inline-flex p-2 bg-slate-800 dark:bg-slate-700 rounded-xl mb-3 text-slate-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">{compliance.title}</div>
                      <div className="text-base font-black">{compliance.name}</div>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-[11px] font-medium text-amber-800 dark:text-amber-400 text-center max-w-xs leading-relaxed">
                    {compliance?.description || 'مسئول مستقیم رعایت مقررات و قوانین بانکی (AML/CFT) با مسیر گزارش‌دهی مستقیم به هیئت نظار.'}
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


