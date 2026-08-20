'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Edit3, Save, RotateCcw, Download, Printer, ShieldCheck, Briefcase, 
  Users, UserCheck, Plus, Trash2, Check, FileSpreadsheet, Layers, Filter, CheckCircle2, 
  Search, FileCode, Loader2, Phone, Mail, Calendar, GraduationCap, IdCard, MapPin, 
  ChevronDown, ChevronUp, Maximize2, Minimize2, Database, Sparkles, Copy, ExternalLink
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { exportElementToWord } from '@/lib/wordExport';
import { db, EmployeeRecord, subscribeEmployees } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  bgType?: 'dark' | 'light';
  staff?: string[];
  phone?: string;
  email?: string;
  joinDate?: string;
  education?: string;
  experience?: string;
  tazkiraNo?: string;
  location?: string;
  responsibilities?: string;
  tin?: string;
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

const COMPLIANCE_OFFICER_CANONICAL: Partial<OrgChartNode> = {
  name: 'عبدالعزیز مهرزاد',
  title: 'مسئول پیروی از قوانین (Compliance Officer)',
  phone: '',
  email: '',
  joinDate: '',
  education: 'لیسانس اداره و تجارت',
  experience: 'مسئول مستقل پیروی از قوانین و مقررات و AML/CFT',
  tazkiraNo: '72198-0300-1401',
  location: 'دفتر مرکزی - واحد پیروی از قوانین و مقررات',
};

const normalizeOrgChartData = (value: OrgChartData): OrgChartData => ({
  ...value,
  executives: value.executives.map((executive) =>
    executive.title.includes('مسئول پیروی از قوانین')
      ? { ...executive, ...COMPLIANCE_OFFICER_CANONICAL }
      : executive
  ),
});

const DEFAULT_ORG_CHART_DATA: OrgChartData = {
  headerTitle: 'چارت تشکیلاتی و ساختار سازمانی مصوب',
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری (سهامی خاص)',
  companySubEng: 'ساختار تشکیلاتی و وظایف مصوب — د افغانستان بانک',
  
  president: {
    id: 'pres-1',
    name: 'برکت‌الله غفوری',
    title: 'رئیس و سهمدار اصلی (100٪ سرمایه)',
    bgType: 'dark',
    phone: '0799112030',
    email: 'b.ghafouri@exchange.af',
    joinDate: '1400/05/10',
    education: 'لیسانس کامپیوتر ساینس و مدیریت مالی',
    experience: 'بیش از 10 سال مدیریت ارشد صرافی، بانکداری و خدمات پولی',
    tazkiraNo: '1399-1104-55522',
    location: 'دفتر مرکزی - سرای شهزاده، کابل',
    responsibilities: 'تصمیم‌گیری‌های کلان استراتژیک، تأمین سرمایه و رهبری عالیه شرکت'
  },

  boardMembers: [
    {
      id: 'bm-1',
      name: 'عظیم‌الله رحمانی',
      title: 'عضو هیئت نظار',
      bgType: 'light',
      phone: '0777334050',
      email: 'azim.rahmani@exchange.af',
      joinDate: '1401/03/01',
      education: 'لیسانس حقوق و علوم سیاسی',
      experience: '6 سال سابقه امور حقوقی و نظارت شرکتی',
      tazkiraNo: '0054321-1504-12980',
      location: 'دفتر مرکزی - کابل',
      responsibilities: 'بررسی اسناد حقوقی و نظارت بر رعایت چارچوب‌های مقرراتی'
    },
    {
      id: 'bm-2',
      name: 'بسم‌الله شیرزی',
      title: 'رئیس هیئت نظار',
      bgType: 'dark',
      phone: '0788223040',
      email: 'bismillah.shirzai@exchange.af',
      joinDate: '1401/02/15',
      education: 'لیسانس اقتصاد و بانکداری',
      experience: '7 سال تجربه نظارت مالی و بانکی',
      tazkiraNo: '0087654-0201-34210',
      location: 'دفتر مرکزی - هیئت نظار',
      responsibilities: 'نظارت عالیه بر تطبیق قوانین DAB، بررسی گزارش‌های مالی و انطباق'
    },
    {
      id: 'bm-3',
      name: 'برکت‌الله',
      title: 'عضو هیئت نظار',
      bgType: 'light',
      phone: '0799112030',
      email: 'b.ghafouri@exchange.af',
      joinDate: '1400/05/10',
      education: 'لیسانس مدیریت مالی',
      experience: 'عضویت در هیئت نظار و نمایندگی سهمداران',
      tazkiraNo: '1399-1104-55522',
      location: 'دفتر مرکزی - کابل',
      responsibilities: 'هماهنگی امور نظارتی و نظارت مستقیم بر فعالیت‌های اجرایی'
    }
  ],

  executives: [
    {
      id: 'exec-1',
      name: 'عبدالعزیز مهرزاد',
      title: 'مسئول پیروی از قوانین (Compliance Officer)',
      bgType: 'dark',
      phone: '',
      email: '',
      joinDate: '',
      education: 'لیسانس اداره و تجارت',
      experience: 'مسئول مستقل پیروی از قوانین و مقررات و AML/CFT',
      tazkiraNo: '72198-0300-1401',
      location: 'دفتر مرکزی - واحد پیروی از قوانین و مقررات',
      responsibilities: 'پایش معاملات مشکوک (STR/LCTR)، احراز هویت مشتریان (KYC) و گزارش‌دهی به د افغانستان بانک'
    },
    {
      id: 'exec-2',
      name: 'صالح‌محمد',
      title: 'مسئول عملیاتی (Operations Manager)',
      bgType: 'dark',
      phone: '0790556070',
      email: 'operations@exchange.af',
      joinDate: '1401/04/10',
      education: 'لیسانس اداره و تجارت (BBA)',
      experience: '6 سال مدیریت عملیات صرافی و حواله‌جات پولی',
      tazkiraNo: '0098712-1203-65432',
      location: 'دفتر مرکزی - مدیریت عملیات',
      responsibilities: 'نظارت بر کلیه نمایندگی‌های ولایتی، کنترل نقدینگی و تسویه‌حساب‌های روزانه'
    }
  ],

  branches: [
    {
      id: 'br-1',
      name: 'نمایندگی کابل',
      title: 'اجمل احمدی',
      staff: ['ریحان داخلی (خزانه‌دار)', 'صدیق‌الله (مسئول حواله‌جات)'],
      bgType: 'light',
      phone: '0700123456',
      email: 'kabul.branch@exchange.af',
      joinDate: '1401/08/01',
      education: 'بکلوریا / دوره عالی حسابداری',
      tazkiraNo: '0065432-1101-43210',
      location: 'کابل، سرای شهزاده، طبقه دوم',
      responsibilities: 'مدیریت امور صرافی و حواله‌های پایتخت و کنترل گاوصندوق'
    },
    {
      id: 'br-2',
      name: 'نمایندگی تخار',
      title: 'رحمت‌الله',
      staff: ['عبیدالله (متصدی خدمات)'],
      bgType: 'light',
      phone: '0701654321',
      email: 'takhar.branch@exchange.af',
      joinDate: '1401/09/15',
      education: 'فوق دیپلم اقتصاد',
      tazkiraNo: '0041526-1402-87211',
      location: 'تالقان، چوک مرکزی، مارکیت صرافان',
      responsibilities: 'ارائه خدمات پولی، تبادله اسعار و حواله‌جات ولایت تخار'
    },
    {
      id: 'br-3',
      name: 'نمایندگی کشم',
      title: 'عتیق‌الله',
      staff: ['نورمحمد (همکار اداری)'],
      bgType: 'light',
      phone: '0702987654',
      email: 'keshem.branch@exchange.af',
      joinDate: '1402/02/01',
      education: 'بکلوریا',
      tazkiraNo: '0032918-1501-23145',
      location: 'بدخشان، ولسوالی کشم، بازار مرکزی',
      responsibilities: 'ارائه خدمات انتقال و دریافت حواله مشتریان محلی'
    },
    {
      id: 'br-4',
      name: 'نمایندگی امام صاحب',
      title: 'محمد یوسف حیدری',
      staff: ['عبدالمجید (خزانه‌دار)'],
      bgType: 'light',
      phone: '0703456789',
      email: 'imamsaheb.branch@exchange.af',
      joinDate: '1402/04/10',
      education: 'لیسانس اقتصاد',
      tazkiraNo: '0076543-1303-99812',
      location: 'کندز، ولسوالی امام صاحب، مارکیت تجارتی',
      responsibilities: 'مدیریت حواله‌جات مرزی و تسویه روزانه با مرکز'
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

  footerNote: '▸ هیئت نظار: نظارت بر عملکرد شرکت و تطبیق مقررات د افغانستان بانک (DAB).'
};

interface OrgChartCanvasProps {
  companyId?: string;
  customLogo?: string | null;
  isEditMode?: boolean;
  searchTerm?: string;
}

export default function OrgChartCanvas({
  customLogo,
  companyId = "default",
  isEditMode: externalIsEditMode,
  searchTerm: externalSearchTerm,
}: OrgChartCanvasProps) {
  const [data, setData] = useState<OrgChartData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_org_chart_v2_${companyId}`);
        if (saved) return normalizeOrgChartData({ ...DEFAULT_ORG_CHART_DATA, ...JSON.parse(saved) });
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ORG_CHART_DATA;
  });

  const [dbEmployees, setDbEmployees] = useState<EmployeeRecord[]>([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({});
  const [internalIsEditMode, setInternalIsEditMode] = useState(false);
  const isEditMode = externalIsEditMode !== undefined ? externalIsEditMode : internalIsEditMode;
  const setIsEditMode = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setInternalIsEditMode((prev) => val(isEditMode));
    } else {
      setInternalIsEditMode(val);
    }
  };

  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = setInternalSearchTerm;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync with Firestore Org Chart Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_org_chart_v2_${companyId}`);
        if (saved) {
          setData(normalizeOrgChartData({ ...DEFAULT_ORG_CHART_DATA, ...JSON.parse(saved) }));
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
            setData((prev) => normalizeOrgChartData({ ...prev, ...remote.orgChartData }));
          }
        }
      }, (err) => console.warn(err));
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [companyId]);

  // Subscribe to Employees from Firestore to enrich nodes live
  useEffect(() => {
    try {
      const unsubscribe = subscribeEmployees((empList) => {
        setDbEmployees(empList || []);
      }, companyId);
      return () => unsubscribe();
    } catch (e) {
      console.warn('Employees sync fallback', e);
    }
  }, [companyId]);

  // Helper to find matched employee record from database
  const getMatchedEmployee = (node: OrgChartNode): EmployeeRecord | null => {
    if (!dbEmployees.length) return null;
    const normalizedNodeName = node.name.trim().toLowerCase();
    const normalizedNodeTitle = node.title.trim().toLowerCase();

    return dbEmployees.find(emp => {
      const empName = emp.fullName.trim().toLowerCase();
      const empPos = emp.position.trim().toLowerCase();
      return (
        empName.includes(normalizedNodeName) ||
        normalizedNodeName.includes(empName) ||
        (empPos && normalizedNodeTitle.includes(empPos)) ||
        emp.id === node.id
      );
    }) || null;
  };

  // Merge node fields with Firestore employee database if available
  const getEnrichedNode = (node: OrgChartNode): OrgChartNode & { hasDbMatch: boolean } => {
    const match = getMatchedEmployee(node);
    if (!match) return { ...node, hasDbMatch: false };

    return {
      ...node,
      phone: node.phone || match.phone || undefined,
      email: node.email || match.email || undefined,
      joinDate: node.joinDate || match.formDate || undefined,
      education: node.education || match.education || undefined,
      experience: node.experience || match.experience || undefined,
      tazkiraNo: node.tazkiraNo || match.tazkiraNo || undefined,
      tin: node.tin || match.tin || undefined,
      hasDbMatch: true
    };
  };

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
      ? 'ring-4 ring-amber-400 ring-offset-2 scale-[1.02] transition-all duration-300 bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-2xl z-10'
      : 'opacity-30 transition-all duration-300';
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodeIds(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getAllNodeIds = (): string[] => {
    const ids: string[] = [data.president.id];
    data.boardMembers.forEach(bm => ids.push(bm.id));
    data.executives.forEach(ex => ids.push(ex.id));
    data.branches.forEach(br => ids.push(br.id));
    return ids;
  };

  const expandAllNodes = () => {
    const all = getAllNodeIds();
    const nextState: Record<string, boolean> = {};
    all.forEach(id => { nextState[id] = true; });
    setExpandedNodeIds(nextState);
  };

  const collapseAllNodes = () => {
    setExpandedNodeIds({});
  };

  const expandedCount = Object.values(expandedNodeIds).filter(Boolean).length;
  const totalNodesCount = getAllNodeIds().length;

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

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
      setExpandedNodeIds({});
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

  // Reusable Interactive Node Card Component with Click-to-Expand
  const renderInteractiveNodeCard = ({
    node,
    variant = 'standard',
    isDark = false,
    badgeText,
    subtitleOverride,
    customClass = ''
  }: {
    node: OrgChartNode;
    variant?: 'president' | 'board' | 'executive' | 'branch' | 'standard';
    isDark?: boolean;
    badgeText?: string;
    subtitleOverride?: string;
    customClass?: string;
  }) => {
    const isExpanded = !!expandedNodeIds[node.id];
    const enriched = getEnrichedNode(node);
    const highlightClass = getNodeHighlightClass(node.name, node.title, node.id);

    const hasExtraDetails = !!(
      enriched.phone || 
      enriched.email || 
      enriched.joinDate || 
      enriched.education || 
      enriched.experience || 
      enriched.tazkiraNo || 
      enriched.location || 
      enriched.responsibilities ||
      (node.staff && node.staff.length > 0)
    );

    return (
      <div 
        id={`org-node-${node.id}`}
        onClick={() => toggleNodeExpand(node.id)}
        className={`
          group relative transition-all duration-300 ease-out cursor-pointer rounded-2xl select-none
          ${isDark 
            ? 'bg-[#1e3a8a] text-white border-2 border-blue-900/80 shadow-md hover:shadow-xl hover:border-blue-400' 
            : 'bg-white dark:bg-slate-900 border-2 border-[#1e3a8a] text-slate-900 dark:text-white shadow-sm hover:shadow-lg hover:border-blue-600'
          }
          ${isExpanded 
            ? 'ring-3 ring-blue-500 shadow-xl z-20 ' + (isDark ? 'bg-[#1a347c]' : 'bg-blue-50/20 dark:bg-slate-850') 
            : 'hover:scale-[1.02]'
          }
          ${highlightClass}
          ${customClass}
        `}
      >
        {/* Top Floating Badge for Database Sync or Role */}
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 z-10">
          {enriched.hasDbMatch && (
            <span 
              className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs"
              title="متصل به دیتابیس زنده سوانح پرسنل (Firestore Database)"
            >
              <Database className="w-2.5 h-2.5" />
              <span>دیتابیس</span>
            </span>
          )}
          {badgeText && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs ${
              isDark 
                ? 'bg-blue-950/90 text-blue-200 border border-blue-700' 
                : 'bg-blue-100 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 border border-blue-300 dark:border-blue-800'
            }`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Card Header Content */}
        <div className="p-4 sm:p-5 text-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="w-6" /> {/* spacer */}
            <div className={`font-black tracking-tight ${variant === 'president' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
              {node.name}
            </div>
            {/* Click-to-Expand Indicator Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpand(node.id);
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isDark 
                  ? 'bg-blue-900/80 hover:bg-blue-800 text-blue-200' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300'
              }`}
              title={isExpanded ? 'بستن مشخصات' : 'کلیک برای مشاهده مشخصات، تماس و تاریخ استخدام'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
            {subtitleOverride || node.title}
          </div>

          {/* Quick Collapse/Expand CTA chip */}
          <div className="mt-2.5 flex items-center justify-center">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
              isExpanded 
                ? isDark 
                  ? 'bg-blue-950/80 text-blue-200 border border-blue-700' 
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : isDark 
                  ? 'text-blue-300/80 group-hover:text-white' 
                  : 'text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
            }`}>
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>بستن مشخصات</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>اطلاعات تماس و سوابق</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* EXPANDED CONTENT TRAY (Unfolds when clicked) */}
        {isExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`border-t px-4 py-4 space-y-3 text-right text-xs rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDark 
                ? 'border-blue-800/80 bg-blue-950/70 text-slate-100' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850 text-slate-800 dark:text-slate-200'
            }`}
          >
            {/* Database Connection Notice */}
            <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
              enriched.hasDbMatch 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{enriched.hasDbMatch ? 'همگام‌سازی شده با سوانح پرسنل دیتابیس' : 'مشخصات تشکیلاتی و انطباق DAB'}</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{node.id}</span>
            </div>

            {/* Grid of Key Extended Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Phone Field */}
              {enriched.phone && (
                <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] opacity-70 block font-semibold">شماره تماس:</span>
                      <a 
                        href={`tel:${enriched.phone}`} 
                        className="font-bold font-mono text-xs hover:underline ltr inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {enriched.phone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText(enriched.phone!, 'phone')}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700"
                    title="کپی شماره تماس"
                  >
                    {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {/* Email Field */}
              {enriched.email && (
                <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] opacity-70 block font-semibold">ایمیل سازمانی:</span>
                      <a 
                        href={`mailto:${enriched.email}`} 
                        className="font-semibold font-mono text-[11px] hover:underline ltr inline-block truncate max-w-[130px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {enriched.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText(enriched.email!, 'email')}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700"
                    title="کپی ایمیل"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {/* Joining Date Field */}
              {enriched.joinDate && (
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block font-semibold">تاریخ استخدام / شروع فعالیت:</span>
                    <span className="font-bold text-xs font-mono">{enriched.joinDate}</span>
                  </div>
                </div>
              )}

              {/* Tazkira / ID Number */}
              {enriched.tazkiraNo && (
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <IdCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block font-semibold">نمبر تذکره / هویت:</span>
                    <span className="font-semibold text-xs font-mono">{enriched.tazkiraNo}</span>
                  </div>
                </div>
              )}

              {/* Education */}
              {enriched.education && (
                <div className={`p-2 rounded-xl border flex items-center gap-2 col-span-1 sm:col-span-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block font-semibold">تحصیلات و تخصص:</span>
                    <span className="font-semibold text-xs">{enriched.education}</span>
                  </div>
                </div>
              )}

              {/* Location */}
              {enriched.location && (
                <div className={`p-2 rounded-xl border flex items-center gap-2 col-span-1 sm:col-span-2 ${
                  isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block font-semibold">موقعیت و محل خدمت:</span>
                    <span className="font-semibold text-xs">{enriched.location}</span>
                  </div>
                </div>
              )}

              {/* Responsibilities & AML/CFT Compliance Role */}
              {enriched.responsibilities && (
                <div className={`p-2.5 rounded-xl border col-span-1 sm:col-span-2 space-y-1 ${
                  isDark ? 'bg-blue-950 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>حیطه اختیارات و مسئولیت‌های سازمانی (DAB):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{enriched.responsibilities}</p>
                </div>
              )}

              {/* Staff / Personnel under node */}
              {node.staff && node.staff.length > 0 && (
                <div className={`p-2.5 rounded-xl border col-span-1 sm:col-span-2 space-y-1 ${
                  isDark ? 'bg-blue-950 border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>کارکنان و کادر اجرایی همکار:</span>
                  </div>
                  <div className="text-[11px] font-semibold flex flex-wrap gap-1.5 pt-0.5">
                    {node.staff.map((s, sIdx) => (
                      <span key={sIdx} className="bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Collapse Trigger */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1"
              >
                <ChevronUp className="w-3 h-3" />
                <span>بستن این بخش</span>
              </button>
            </div>

          </div>
        )}
      </div>
    );
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
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>چارت تشکیلاتی رسمی و هیئت نظار</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full font-normal">
                قابلیت کلیک برای گسترش جزئیات
              </span>
            </h2>
            <p className="text-xs text-slate-500">برای مشاهده شماره تماس، ایمیل، تاریخ استخدام و سوابق، روی هر کارت کلیک کنید.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dedicated Search Bar */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
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

          {/* Expand / Collapse All Toggle */}
          <button
            onClick={expandedCount > 0 ? collapseAllNodes : expandAllNodes}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={expandedCount > 0 ? 'بستن همه کارت‌ها' : 'باز کردن جزئیات تمام کارت‌ها'}
          >
            {expandedCount > 0 ? <Minimize2 className="w-4 h-4 text-blue-600" /> : <Maximize2 className="w-4 h-4 text-blue-600" />}
            <span>{expandedCount > 0 ? `بستن همه (${expandedCount})` : 'نمایش تمام جزئیات'}</span>
          </button>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
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
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'ذخیره شد' : 'ذخیره در دیتابیس'}</span>
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
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer"
            title="بازنشانی به حالت پیش‌فرض"
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
            <span>ویرایش عنوان‌ها، سربرگ و مشخصات چارت تشکیلاتی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
            <div>
              <label className="font-bold block mb-1 text-xs">عنوان سربرگ چارت:</label>
              <input
                type="text"
                value={data.headerTitle}
                onChange={(e) => setData({ ...data, headerTitle: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs">نام شرکت:</label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs">عنوان فرعی سربرگ:</label>
              <input
                type="text"
                value={data.companySubEng}
                onChange={(e) => setData({ ...data, companySubEng: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <label className="font-bold block mb-1">شماره تماس رئیس:</label>
              <input
                type="text"
                value={data.president.phone || ''}
                onChange={(e) => setData({ ...data, president: { ...data.president, phone: e.target.value } })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                placeholder="۰۷۹۹xxxxxx"
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
                  <input
                    type="text"
                    value={bm.phone || ''}
                    placeholder="شماره تماس"
                    onChange={(e) => {
                      const updated = [...data.boardMembers];
                      updated[idx].phone = e.target.value;
                      setData({ ...data, boardMembers: updated });
                    }}
                    className="w-full p-1 border rounded text-xs font-mono text-slate-600"
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
                  <input
                    type="text"
                    value={exec.phone || ''}
                    placeholder="شماره تماس"
                    onChange={(e) => {
                      const updated = [...data.executives];
                      updated[idx].phone = e.target.value;
                      setData({ ...data, executives: updated });
                    }}
                    className="w-full p-1 border rounded text-xs font-mono text-slate-600"
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
                    value={br.phone || ''}
                    placeholder="شماره تماس نمایندگی"
                    onChange={(e) => {
                      const updated = [...data.branches];
                      updated[idx].phone = e.target.value;
                      setData({ ...data, branches: updated });
                    }}
                    className="w-full p-1 border rounded text-xs font-mono"
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
              <div className="w-full max-w-[340px] sm:max-w-[380px]">
                {renderInteractiveNodeCard({
                  node: data.president,
                  variant: 'president',
                  isDark: true,
                  badgeText: '۱۰۰٪ سهمدار',
                  customClass: 'text-center'
                })}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto items-start">
              
              {/* Right Box (RTL Index 0: برکت‌الله - عضو هیئت نظار) */}
              <div>
                {renderInteractiveNodeCard({
                  node: data.boardMembers[2] || { id: 'bm-3', name: 'برکت‌الله', title: 'عضو هیئت نظار' },
                  variant: 'board',
                  isDark: false,
                  badgeText: 'هیئت نظار'
                })}
              </div>

              {/* Middle Box (RTL Index 1: بسم‌الله شیرزی - رئیس هیئت نظار - FILLED DARK BLUE) */}
              <div>
                {renderInteractiveNodeCard({
                  node: data.boardMembers[1] || { id: 'bm-2', name: 'بسم‌الله شیرزی', title: 'رئیس هیئت نظار' },
                  variant: 'board',
                  isDark: true,
                  badgeText: 'رئیس نظار',
                  customClass: 'transform sm:-translate-y-1'
                })}
              </div>

              {/* Left Box (RTL Index 2: عظیم‌الله رحمانی - عضو هیئت نظار) */}
              <div>
                {renderInteractiveNodeCard({
                  node: data.boardMembers[0] || { id: 'bm-1', name: 'عظیم‌الله رحمانی', title: 'عضو هیئت نظار' },
                  variant: 'board',
                  isDark: false,
                  badgeText: 'هیئت نظار'
                })}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-start">
              
              {/* Right Box (RTL: صالح‌محمد - مسئول عملیاتی) */}
              <div>
                {renderInteractiveNodeCard({
                  node: data.executives[1] || { id: 'exec-2', name: 'صالح‌محمد', title: 'مسئول عملیاتی' },
                  variant: 'executive',
                  isDark: true,
                  badgeText: 'مدیریت شعب و حواله‌ها'
                })}
              </div>

              {/* Left Box (RTL: عبدالعزیز مهرزاد - مسئول پیروی از قوانین) */}
              <div>
                {renderInteractiveNodeCard({
                  node: data.executives[0] || { id: 'exec-1', name: 'عبدالعزیز مهرزاد', title: 'مسئول پیروی از قوانین' },
                  variant: 'executive',
                  isDark: true,
                  badgeText: 'AML/CFT Compliance'
                })}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {data.branches.map((br) => (
                <div key={br.id}>
                  {renderInteractiveNodeCard({
                    node: br,
                    variant: 'branch',
                    isDark: false,
                    badgeText: 'نمایندگی رسمی',
                    subtitleOverride: br.title
                  })}
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

