'use client';

import React, { useState, useMemo } from 'react';
import {
  Download, FileText, Check, X, ShieldCheck, Printer, Settings, Loader2,
  FileCode, Sparkles, CheckSquare, Square, Layers, ArrowUp, ArrowDown,
  Building2, Users, Stamp, BookOpen, ClipboardCheck, ClipboardList,
  RefreshCw, GitBranch, AlertCircle, FileSpreadsheet, PackageCheck, ListOrdered
} from 'lucide-react';
import { exportBatchToPdf, BatchDocumentItem } from '@/lib/pdfExport';

export interface DocumentMeta {
  id: string;
  title: string;
  category: string;
  elementId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  badge: string;
  defaultOrientation?: 'portrait' | 'landscape';
}

export const ALL_BATCH_DOCUMENTS: DocumentMeta[] = [
  {
    id: 'license-renewal-letter',
    title: 'مکتوب رسمی درخواست تمدید جواز فعالیت (DAB)',
    category: 'تمدید جواز د افغانستان بانک',
    elementId: 'dab-license-renewal-letter-canvas',
    icon: Stamp,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    description: 'مکتوب رسمی با سربرگ، شماره صادره و امضای رئیس شرکت به آمریت مؤسسات مالی غیربانکی',
    badge: 'الزامی DAB',
    defaultOrientation: 'portrait',
  },
  {
    id: 'meeting-minutes',
    title: 'صورت‌جلسه مجمع عمومی عادی سالانه سهامداران',
    category: 'اسناد شرکتی و حاکمیت',
    elementId: 'meeting-minutes-canvas',
    icon: ClipboardList,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
    description: 'تصویب بیلان مالی، تمدید جواز، تأیید هیئت نظار و تفویض اختیارات اداری به رئیس',
    badge: 'مصوب مجمع',
    defaultOrientation: 'portrait',
  },
  {
    id: 'org-chart',
    title: 'چارت تشکیلاتی و ساختار سازمانی مصوب',
    category: 'تشکیلات و ساختار سازمانی',
    elementId: 'org-chart-exact-canvas',
    icon: Layers,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    description: 'چارت رسمی تفکیک وظایف هیئت نظار، رئیس، مسئول رعایت قوانین و مسئولین شعبات',
    badge: 'ساختار رسمی',
    defaultOrientation: 'portrait',
  },
  {
    id: 'license-renewal',
    title: 'فورم ارزیابی و تمدید جواز شرکت صرافی (فورم ۱)',
    category: 'تمدید جواز د افغانستان بانک',
    elementId: 'dab-license-renewal-canvas',
    icon: ShieldCheck,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    description: 'فورم مشخصات شرکت، آدرس، گزارش تراکنش‌ها، حجم سرمایه و سوابق فعالیت سالانه',
    badge: 'فورم شماره ۱',
    defaultOrientation: 'portrait',
  },
  {
    id: 'branch-renewal',
    title: 'فورم درخواست تمدید فعالیت نمایندگی‌ها (فورم ۲)',
    category: 'تمدید جواز د افغانستان بانک',
    elementId: 'dab-branch-renewal-canvas',
    icon: Building2,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'اطلاعات کامل شعبات ولایات کندز، تخار، کابل و امام‌صاحب همراه با مسئولین مربوطه',
    badge: 'فورم شماره ۲',
    defaultOrientation: 'portrait',
  },
  {
    id: 'guarantee-form',
    title: 'تعهدنامه و تضمین‌خط سر سهمدار اصلی',
    category: 'اسناد شرکتی و حاکمیت',
    elementId: 'dab-official-form',
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    description: 'تعهدنامه رسمی تضمین نقدینگی و پاسخگویی سهمدار اصلی در برابر بانک مرکزی',
    badge: 'تضمین بانکی',
    defaultOrientation: 'portrait',
  },
  {
    id: 'company-proposal',
    title: 'پیشنهاد و احکام تعیین اعضای هیئت نظار',
    category: 'اسناد شرکتی و حاکمیت',
    elementId: 'company-proposal-canvas',
    icon: FileText,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    description: 'معرفی رئیس و اعضای هیئت نظار مستقل همراه با سوابق تحصیلی و صلاحیت‌های فنی',
    badge: 'هیئت نظار',
    defaultOrientation: 'portrait',
  },
  {
    id: 'company-articles',
    title: 'اساسنامه معیاری شرکت صرافی و خدمات پولی',
    category: 'اسناد شرکتی و حاکمیت',
    elementId: 'company-articles-canvas',
    icon: BookOpen,
    color: 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    description: 'متن اساسنامه ۳۰ ماده‌ای شرکت تنظیم‌شده مطابق مقرره صرافان د افغانستان بانک',
    badge: 'اساسنامه',
    defaultOrientation: 'portrait',
  },
  {
    id: 'license-renewal-checklist',
    title: 'چک‌لیست اسناد و مدارک تمدید جواز مرکز',
    category: 'چک‌لیست‌ها و نظارت',
    elementId: 'dab-license-renewal-checklist-canvas',
    icon: RefreshCw,
    color: 'text-emerald-700 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'جدول تطبیقی مدارک ۲۱ گانه الزامی جهت تجدید جواز فعالیت نزد د افغانستان بانک',
    badge: 'چک‌لیست مرکز',
    defaultOrientation: 'portrait',
  },
  {
    id: 'branch-renewal-checklist',
    title: 'چک‌لیست اسناد تمدید نمایندگی‌های ولایتی',
    category: 'چک‌لیست‌ها و نظارت',
    elementId: 'dab-branch-renewal-checklist-canvas',
    icon: GitBranch,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
    description: 'مدارک و الزامات قانونی تمدید فعالیت دفاتر و نمایندگی‌های ولایات',
    badge: 'چک‌لیست شعب',
    defaultOrientation: 'portrait',
  },
  {
    id: 'license-checklist',
    title: 'چک‌لیست شرایط و اسناد صدور جواز اولیه',
    category: 'چک‌لیست‌ها و نظارت',
    elementId: 'license-checklist-canvas',
    icon: ClipboardCheck,
    color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800',
    description: 'الزامات اولیه ثبت، تأسیس و اخذ جواز شرکت صرافی و خدمات پولی',
    badge: 'جواز اولیه',
    defaultOrientation: 'portrait',
  },
  {
    id: 'employees',
    title: 'خلص سوانح و مدیریت سوابق پرسنل',
    category: 'تشکیلات و ساختار سازمانی',
    elementId: 'employee-management-cv-canvas',
    icon: Users,
    color: 'text-teal-700 dark:text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
    description: 'پایگاه داده کارمندان، سوابق تحصیلی، اسناد تذکره و خلص سوانح شغلی پرسنل',
    badge: 'سوابق کارمندان',
    defaultOrientation: 'portrait',
  },
  {
    id: 'compliance-reporting',
    title: 'سامانه رعایت قوانین و گزارش‌دهی نظارتی (STR/LCTR)',
    category: 'رعایت قوانین و AML',
    elementId: 'compliance-report-canvas',
    icon: ShieldCheck,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'گزارش‌های رسمی معاملات مشکوک، معاملات بزرگ نقدی و متحدالمال‌های DAB',
    badge: 'FinTRACA / AML',
    defaultOrientation: 'portrait',
  },
];

// Presets Definition
const PRESETS = [
  {
    id: 'license-renewal-pack',
    label: 'پکیج رسمی تمدید جواز (DAB Renewal Pack)',
    description: 'شامل مکتوب تمدید، صورت‌جلسه مجمع، چارت سازمانی، فورم‌های ۱ و ۲، تضمین‌خط و چک‌لیست تمدید',
    icon: PackageCheck,
    docIds: [
      'license-renewal-letter',
      'meeting-minutes',
      'org-chart',
      'license-renewal',
      'branch-renewal',
      'guarantee-form',
      'license-renewal-checklist'
    ],
  },
  {
    id: 'governance-hr-pack',
    label: 'پکیج حاکمیت شرکتی و پرسنل (Governance & HR)',
    description: 'شامل چارت سازمانی، پیشنهاد هیئت نظار، اساسنامه، صورت‌جلسه مجمع و خلص سوانح پرسنل',
    icon: Building2,
    docIds: [
      'org-chart',
      'company-proposal',
      'company-articles',
      'meeting-minutes',
      'employees'
    ],
  },
  {
    id: 'compliance-audit-pack',
    label: 'پکیج تفتیش و رعایت قوانین (Compliance & Audit)',
    description: 'شامل گزارش‌های نظارتی، اساسنامه شرکت، چک‌لیست‌ها و مکتوب رسمی',
    icon: ShieldCheck,
    docIds: [
      'compliance-reporting',
      'company-articles',
      'license-renewal-checklist',
      'branch-renewal-checklist',
      'license-renewal-letter'
    ],
  },
];

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  licenseNumber?: string;
  issueDate?: string;
  onSelectedDocsChange?: (selectedIds: string[], meta: { id: string; title: string; category: string }[]) => void;
}

export default function BatchExportModal({
  isOpen,
  onClose,
  companyName = 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  licenseNumber = 'DAB/7-0965',
  issueDate = '۱۴۰۴/۰۱/۰۱',
  onSelectedDocsChange,
}: BatchExportModalProps) {
  // Ordered array of selected document IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'license-renewal-letter',
    'meeting-minutes',
    'org-chart',
    'license-renewal',
    'branch-renewal',
    'guarantee-form',
    'license-renewal-checklist',
  ]);

  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [paperSize, setPaperSize] = useState<'a4' | 'a3'>('a4');
  const [qualityScale, setQualityScale] = useState<number>(2.2);
  const [customFilename, setCustomFilename] = useState<string>(
    'پکیج_جامع_اسناد_تمدید_جواز_صرافی_برکت_الله_غفوری.pdf'
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
    docTitle: string;
    percent: number;
  }>({
    current: 0,
    total: 0,
    docTitle: '',
    percent: 0,
  });
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Sync selected docs to staging component
  const selectedDocsMeta = useMemo(() => {
    return selectedIds
      .map((id) => ALL_BATCH_DOCUMENTS.find((d) => d.id === id))
      .filter((d): d is DocumentMeta => d !== undefined)
      .map((d) => ({ id: d.id, title: d.title, category: d.category }));
  }, [selectedIds]);

  React.useEffect(() => {
    if (onSelectedDocsChange) {
      onSelectedDocsChange(selectedIds, selectedDocsMeta);
    }
  }, [selectedIds, selectedDocsMeta, onSelectedDocsChange]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleDoc = (docId: string) => {
    if (selectedIds.includes(docId)) {
      setSelectedIds(selectedIds.filter((id) => id !== docId));
    } else {
      setSelectedIds([...selectedIds, docId]);
    }
  };

  // Select all
  const handleSelectAll = () => {
    setSelectedIds(ALL_BATCH_DOCUMENTS.map((d) => d.id));
  };

  // Clear all
  const handleClearAll = () => {
    setSelectedIds([]);
  };

  // Apply preset
  const handleApplyPreset = (presetDocIds: string[]) => {
    setSelectedIds(presetDocIds);
  };

  // Move document up in order
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedIds(next);
  };

  // Move document down in order
  const handleMoveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const next = [...selectedIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedIds(next);
  };

  // Perform the Batch Export
  const handleExecuteBatchExport = async () => {
    if (selectedIds.length === 0) {
      alert('لطفاً حداقل یک سند را برای دانلود انتخاب فرمایید.');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);
    setExportProgress({
      current: 0,
      total: selectedIds.length + (includeCoverPage ? 1 : 0),
      docTitle: 'در حال آماده‌سازی و بررسی اسناد انتخاب‌شده...',
      percent: 5,
    });

    // Wait frame for React rendering of staging area
    await new Promise((resolve) => setTimeout(resolve, 350));

    const docsToExport: BatchDocumentItem[] = [];
    for (const id of selectedIds) {
      const meta = ALL_BATCH_DOCUMENTS.find((d) => d.id === id);
      if (meta) {
        docsToExport.push({
          id: meta.id,
          elementId: meta.elementId,
          title: meta.title,
          category: meta.category,
          orientation: meta.defaultOrientation || 'portrait',
        });
      }
    }

    const totalSteps = docsToExport.length + (includeCoverPage ? 1 : 0);

    const success = await exportBatchToPdf({
      documents: docsToExport,
      filename: customFilename,
      paperSize,
      marginMm: 8,
      qualityScale,
      includeCoverPage,
      coverPageElementId: 'batch-cover-page-canvas',
      includePageNumbers,
      onProgress: (current, total, docTitle) => {
        const percent = Math.round((current / total) * 100);
        setExportProgress({
          current,
          total,
          docTitle,
          percent,
        });
      },
    });

    setIsExporting(false);

    if (success) {
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } else {
      alert('خطا در ایجاد فایل یکپارچه PDF. لطفاً مجدداً تلاش نمایید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-all animate-fadeIn dir-rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-800/80 text-amber-400 rounded-2xl border border-blue-700/60 shadow-inner">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg sm:text-xl tracking-tight">
                  خروجی دسته‌جمعی اسناد به یک فایل PDF (Batch Export)
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                  نسخه یکپارچه DAB
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                انتخاب، مرتب‌سازی و ادغام چندین سند رسمی در یک فایل PDF باکیفیت به همراه صفحه سربرگ و فهرست محتویات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Section 1: Quick Preset Packages */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>پکیج‌های آماده و پیشنهادی د افغانستان بانک:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer"
                >
                  انتخاب همه ({ALL_BATCH_DOCUMENTS.length})
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:underline px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                >
                  لغو انتخاب‌ها
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => {
                const isCurrentActive =
                  preset.docIds.length === selectedIds.length &&
                  preset.docIds.every((id) => selectedIds.includes(id));
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.docIds)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isCurrentActive
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-black text-xs text-slate-900 dark:text-slate-100">
                        {preset.label}
                      </span>
                      <preset.icon className={`w-4 h-4 shrink-0 ${isCurrentActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                      <span>{preset.docIds.length} سند رسمی</span>
                      <span className="underline">انتخاب این پکیج</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Selected Documents & Reordering List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  اسناد انتخابی جهت ادغام ({selectedIds.length} از {ALL_BATCH_DOCUMENTS.length} سند)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ترتیب قرارگیری صفحات بر اساس فهرست زیر خواهد بود:
              </span>
            </div>

            {/* List of All Documents with Checkboxes and Up/Down Order Controls */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {ALL_BATCH_DOCUMENTS.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                const orderIndex = selectedIds.indexOf(doc.id);

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDoc(doc.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-75'
                    }`}
                  >
                    {/* Left: Checkbox + Icon + Details */}
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 text-blue-600 dark:text-blue-400">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 fill-blue-600 text-white dark:fill-blue-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className={`p-2 rounded-xl border shrink-0 ${doc.color}`}>
                        <doc.icon className="w-4 h-4" />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black truncate ${isSelected ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {doc.title}
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                            {doc.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Order Badge & Move Buttons (if selected) */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isSelected ? (
                        <>
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black font-mono flex items-center justify-center shadow-xs">
                            {orderIndex + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(orderIndex)}
                              disabled={orderIndex === 0}
                              title="انتقال به بالا در ترتیب صفحات"
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(orderIndex)}
                              disabled={orderIndex === selectedIds.length - 1}
                              title="انتقال به پایین در ترتیب صفحات"
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          انتخاب نشده
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Advanced Options (Cover page, numbering, filename) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
            <div className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>تنظیمات بسته خروجی و شخصی‌سازی PDF:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Cover Page Toggle */}
              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCoverPage}
                  onChange={(e) => setIncludeCoverPage(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    افزودن صفحه سربرگ و فهرست رسمی (Cover Page & TOC)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    ایجاد صفحه اول با سربرگ د افغانستان بانک، لوگوی شرکت، جدول فهرست اسناد مندرج و کادر امضاهای تأیید
                  </p>
                </div>
              </label>

              {/* Option 2: Page Numbering */}
              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    شماره‌گذاری سراسری صفحات (Page X of Y)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    درج شماره صفحه مسلسل رسمی در پایین تمام صفحات جهت جلوگیری از جابجایی اسناد
                  </p>
                </div>
              </label>

              {/* Option 3: Paper Size */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  قطع و ابعاد کاغذ (Paper Size):
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as 'a4' | 'a3')}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">A4 استاندارد اداری (۲۱۰ × ۲۹۷ میلی‌متر) - پیشنهادی</option>
                  <option value="a3">A3 بزرگ (۲۹۷ × ۴۲۰ میلی‌متر)</option>
                </select>
              </div>

              {/* Option 4: Custom Filename */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  نام فایل خروجی PDF:
                </label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dossier_package.pdf"
                />
              </div>

            </div>
          </div>

          {/* Real-time Progress Bar Overlay during generation */}
          {isExporting && (
            <div className="p-4 bg-blue-950 text-white rounded-2xl space-y-3 shadow-lg animate-pulse">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{exportProgress.docTitle || 'در حال پردازش اسناد...'}</span>
                </div>
                <span className="font-mono text-amber-400">{exportProgress.percent}%</span>
              </div>
              <div className="w-full bg-blue-900/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-blue-200">
                <span>پردازش مرحله {exportProgress.current} از {exportProgress.total}</span>
                <span>لطفاً پنجره را تا تکمیل دانلود نبندید...</span>
              </div>
            </div>
          )}

          {exportSuccess && (
            <div className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-between text-xs font-black shadow-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>فایل یکپارچه PDF با موفقیت تولید و دانلود شد!</span>
              </div>
              <span className="text-[11px] opacity-90">DAB Compliant Dossier</span>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>تعداد کل اسناد انتخابی: </span>
            <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm font-black">
              {selectedIds.length} سند
            </strong>
            {includeCoverPage && <span className="text-[11px] mr-1">(+ ۱ صفحه سربرگ)</span>}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={handleExecuteBatchExport}
              disabled={isExporting || selectedIds.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تولید PDF یکپارچه...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>دانلود پکیج یکپارچه PDF ({selectedIds.length} سند)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
