'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, RotateCcw, Save, Edit3, Plus, Trash2, 
  Check, Download, Building2, Stamp, Calendar, Hash, Paperclip, Mail, ShieldCheck
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface LicenseRenewalLetterData {
  letterNo: string;
  letterDate: string;
  attachment: string;
  recipientTitle: string;
  recipientDepartment: string;
  subject: string;
  companyName: string;
  licenseNo: string;
  issueDate: string;
  mainBodyParagraph1: string;
  mainBodyParagraph2: string;
  attachmentsList: string[];
  closingText: string;
  signatoryName: string;
  signatoryTitle: string;
  signatoryFatherName: string;
  companyPhone: string;
  companyAddress: string;
}

const DEFAULT_LETTER_DATA: LicenseRenewalLetterData = {
  letterNo: '۱۴۰۴/BG-۱۰۲',
  letterDate: '۱۴۰۴/۰۱/۱۵',
  attachment: '۶ قلم اسناد (ضمیمه)',
  recipientTitle: 'مقام محترم آمریت عمومی نظارت بر نهادهای مالی غیربانکی',
  recipientDepartment: 'د افغانستان بانک (بانک مرکزی افغانستان)',
  subject: 'درخواست رسمی تمدید جواز فعالیت صرافی و خدمات پولی (نمبر جواز: DAB/7-0965)',
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری (سهامی خاص)',
  licenseNo: 'DAB/7-0965',
  issueDate: '۱۳۹۹/۰۳/۱۳',
  mainBodyParagraph1: 'السلام علیکم ورحمة الله وبركاته؛\nاحتراماً به استحضار مقام محترم رسانیده می‌شود که شرکت صرافی و خدمات پولی برکت‌الله غفوری دارنده جواز فعالیت شماره (DAB/7-0965) صادره د افغانستان بانک، مدت اعتبار قانونی جواز خویش را تکمیل نموده و بر اساس مقرره تنظیم فعالیت صرافی‌ها و فراهم‌کنندگان خدمات پولی، خواهان تمدید جواز فعالیت برای یک دوره جدید قانونی می‌باشد.',
  mainBodyParagraph2: 'بدین‌وسیله تمامی اسناد، فورمه‌ها و مدارک الزامی مطابق به لایحه و مقررات د افغانستان بانک جهت بررسی، ارزیابی و طی مراحل قانونی به شرح ذیل ضمیمه این مکتوب تقدیم می‌گردد:',
  attachmentsList: [
    'اصل جواز قبلی فعالیت صرافی و خدمات پولی (DAB/7-0965)',
    'مکتوب و استعلام عدم مسئولیت مالیاتی و تصفیه حساب از وزارت محترم مالیه',
    'فورم مکمل ارزیابی و درخواست تمدید جواز شرکت (تکمیل و امضا شده)',
    'فورمه‌های تضمین سر سهمدار و صورت‌حساب‌های بانکی تأیید شده نزد بانک‌های تجارتی',
    'جدول مشخصات و سهم‌داران شرکت، هیئت مدیره، هیئت نظار و نمایندگی‌های فعال',
    'کاپی تذکره، قطعات عکس و عدم سابقه جرمی سهم‌داران و مسئولین شرکت'
  ],
  closingText: 'بناً از مقام محترم آمریت عمومی نظارت بر نهادهای مالی غیربانکی تقاضامندیم تا پس از ملاحظه و بررسی مدارک فوق، در زمینه تمدید جواز فعالیت این شرکت هدایت لازم جهت اجراءات بعدی صادر فرمایند.',
  signatoryName: 'برکت‌الله ولد عبدالغفور',
  signatoryTitle: 'رئیس شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  signatoryFatherName: 'عبدالغفور',
  companyPhone: '0799681111 / 0749340000',
  companyAddress: 'ولایت کندز، مرکز، ناحیه ۳، مومند مارکیت، منزل دوم، دکان ۳۰۱'
};

interface DabLicenseRenewalLetterProps {
  customLogo?: string | null;
}

export default function DabLicenseRenewalLetter({ customLogo }: DabLicenseRenewalLetterProps) {
  const [data, setData] = useState<LicenseRenewalLetterData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bg_dab_license_renewal_letter');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_LETTER_DATA, ...parsed };
        }
      } catch (e) {
        console.error('Failed to load letter data from localStorage:', e);
      }
    }
    return DEFAULT_LETTER_DATA;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Firestore Sync
  useEffect(() => {
    // Subscribe to Firestore settings/license_renewal_letter
    try {
      const docRef = doc(db, 'settings', 'license_renewal_letter');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData && remoteData.letterData) {
            setData((prev) => ({ ...prev, ...remoteData.letterData }));
          }
        }
      }, (err) => {
        console.warn('Firestore subscription info:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore offline fallback:', e);
    }
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('bg_dab_license_renewal_letter', JSON.stringify(data));
      
      // Sync to Firestore
      try {
        const docRef = doc(db, 'settings', 'license_renewal_letter');
        await setDoc(docRef, {
          letterData: data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save letter:', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('آیا از بازنشانی مکتوب تمدید جواز به متن اولیه اطمینان دارید؟')) {
      setData(DEFAULT_LETTER_DATA);
      localStorage.removeItem('bg_dab_license_renewal_letter');
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'dab-license-renewal-letter-canvas',
        filename: 'مکتوب_تمدید_جواز_برکت_الله_غفوری_DAB.pdf',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error('Error exporting letter PDF:', error);
      alert('خطا در دانلود فایل PDF مکتوب. لطفا مجددا تلاش کنید.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAttachmentChange = (index: number, value: string) => {
    const updated = [...data.attachmentsList];
    updated[index] = value;
    setData({ ...data, attachmentsList: updated });
  };

  const addAttachmentItem = () => {
    setData({
      ...data,
      attachmentsList: [...data.attachmentsList, 'سند جدید ضمیمه']
    });
  };

  const removeAttachmentItem = (index: number) => {
    if (data.attachmentsList.length <= 1) return;
    const updated = data.attachmentsList.filter((_, i) => i !== index);
    setData({ ...data, attachmentsList: updated });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Control Action Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Stamp className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>مکتوب رسمی درخواست تمدید جواز (د افغانستان بانک)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مکتوب رسمی استاندارد جهت ارسال به آمریت عمومی نظارت بر نهادهای مالی غیربانکی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isEditing
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'حالت پیش‌نمایش' : 'ویرایش متن مکتوب'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'ذخیره شد' : 'ذخیره مکتوب'}</span>
          </button>

          <button
            type="button"
            onClick={handlePdfExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'در حال خروجی PDF...' : 'دانلود PDF رسمی'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="چاپ مستقیم"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">چاپ</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
            title="بازنشانی متن مکتوب"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editing Form Section (Visible when isEditing === true) */}
      {isEditing && (
        <div className="bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200 print:hidden shadow-xs">
          <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2 border-b border-amber-200 dark:border-slate-700 pb-3">
            <Edit3 className="w-4 h-4" />
            <span>تنظیمات و ویرایش محتوای مکتوب تمدید جواز</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold block mb-1">شماره مکتوب:</label>
              <input
                type="text"
                value={data.letterNo}
                onChange={(e) => setData({ ...data, letterNo: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">تاریخ مکتوب:</label>
              <input
                type="text"
                value={data.letterDate}
                onChange={(e) => setData({ ...data, letterDate: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">ضمیمه:</label>
              <input
                type="text"
                value={data.attachment}
                onChange={(e) => setData({ ...data, attachment: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">عنوان مرجع دریافت‌کننده:</label>
              <input
                type="text"
                value={data.recipientTitle}
                onChange={(e) => setData({ ...data, recipientTitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">نام اداره / بانک:</label>
              <input
                type="text"
                value={data.recipientDepartment}
                onChange={(e) => setData({ ...data, recipientDepartment: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">موضوع مکتوب:</label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => setData({ ...data, subject: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">بند اول متن اصلی مکتوب:</label>
            <textarea
              rows={3}
              value={data.mainBodyParagraph1}
              onChange={(e) => setData({ ...data, mainBodyParagraph1: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">بند دوم متن اصلی (توضیح ضمائم):</label>
            <textarea
              rows={2}
              value={data.mainBodyParagraph2}
              onChange={(e) => setData({ ...data, mainBodyParagraph2: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs leading-relaxed"
            />
          </div>

          {/* Edit Enclosures / Attachments List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold block">فهرست مدارک و اسناد ضمیمه شده:</label>
              <button
                type="button"
                onClick={addAttachmentItem}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن سند</span>
              </button>
            </div>
            {data.attachmentsList.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold w-6 text-center text-slate-500">{idx + 1}.</span>
                <input
                  type="text"
                  value={att}
                  onChange={(e) => handleAttachmentChange(idx, e.target.value)}
                  className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeAttachmentItem(idx)}
                  className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="font-bold block mb-1">متن اختتامیه / تقاضا:</label>
            <textarea
              rows={2}
              value={data.closingText}
              onChange={(e) => setData({ ...data, closingText: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">نام و تذکره امضاکننده (رئیس شرکت):</label>
              <input
                type="text"
                value={data.signatoryName}
                onChange={(e) => setData({ ...data, signatoryName: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">عنوان و سمت امضاکننده:</label>
              <input
                type="text"
                value={data.signatoryTitle}
                onChange={(e) => setData({ ...data, signatoryTitle: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Printable / Viewable Official Letter Canvas */}
      <div 
        id="dab-license-renewal-letter-canvas"
        className="bg-white text-slate-950 p-8 sm:p-12 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0 max-w-4xl mx-auto space-y-7 relative font-sans leading-relaxed dir-rtl"
      >
        {/* Decorative Top Border Line for Afghan Official Documents */}
        <div className="h-1.5 bg-gradient-to-l from-emerald-700 via-amber-500 to-blue-900 rounded-full mb-6 print:mb-4"></div>

        {/* Letter Official Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-800">
          
          {/* Right Header Details: Letter Ref & Date */}
          <div className="text-right text-xs space-y-1.5 font-bold shrink-0 min-w-[170px] bg-slate-50 p-3 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Hash className="w-3.5 h-3.5 text-blue-700 shrink-0 print:hidden" />
              <span>شماره مکتوب:</span>
              <span className="font-black font-mono text-sm text-blue-900">{data.letterNo}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0 print:hidden" />
              <span>تاریخ صادر:</span>
              <span className="font-black text-slate-900">{data.letterDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Paperclip className="w-3.5 h-3.5 text-blue-700 shrink-0 print:hidden" />
              <span>ضمیمه:</span>
              <span className="font-semibold text-slate-700">{data.attachment}</span>
            </div>
          </div>

          {/* Center Header: Official Title & Logo */}
          <div className="text-center space-y-2 flex-1">
            <div className="flex items-center justify-center gap-3">
              {customLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={customLogo} alt="Logo" className="w-14 h-14 object-contain rounded-xl p-0.5 border border-slate-300 bg-white" />
              ) : (
                <div className="w-12 h-12 bg-blue-950 text-amber-400 rounded-xl flex items-center justify-center shadow-xs">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-black text-lg sm:text-xl text-slate-950 tracking-tight leading-snug">
                {data.companyName}
              </h1>
              <p className="text-xs font-bold text-slate-700">
                دارنده جواز فعالیت صرافی و خدمات پولی شماره ({data.licenseNo}) د افغانستان بانک
              </p>
              <div className="inline-block bg-slate-100 text-slate-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-slate-200 mt-1 print:bg-transparent print:border-none print:p-0">
                مکتوب رسمی درخواست تمدید جواز فعالیت
              </div>
            </div>
          </div>

          {/* Left Header: Status Badge & Verification */}
          <div className="text-left text-xs space-y-1.5 shrink-0 min-w-[170px] hidden sm:block">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-center font-bold space-y-1 print:bg-transparent print:border-none">
              <div className="flex items-center justify-center gap-1 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px]">مکتوب رسمی صادره</span>
              </div>
              <div className="text-[10px] text-slate-600">ثبت شده در سیستم د افغانستان بانک</div>
            </div>
          </div>
        </div>

        {/* Recipient Block (عنوان و مرجع دریافت‌کننده) */}
        <div className="space-y-2 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
          <div className="flex items-start gap-2 text-slate-900 font-extrabold text-sm sm:text-base leading-relaxed">
            <span className="text-blue-900 shrink-0">به:</span>
            <div>
              <div>{data.recipientTitle}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{data.recipientDepartment}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 print:border-slate-400">
            <span className="text-slate-900 font-extrabold text-xs sm:text-sm shrink-0">موضوع:</span>
            <span className="font-black text-xs sm:text-sm text-blue-950 underline underline-offset-4 decoration-amber-500">
              {data.subject}
            </span>
          </div>
        </div>

        {/* Letter Main Body Text (متن اصلی مکتوب) */}
        <div className="space-y-4 text-slate-900 text-xs sm:text-sm leading-relaxed text-justify font-medium">
          <p className="whitespace-pre-line leading-loose">
            {data.mainBodyParagraph1}
          </p>

          <p className="leading-loose">
            {data.mainBodyParagraph2}
          </p>

          {/* Numbered Enclosures / Attachments Table */}
          <div className="my-5 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between font-bold text-xs text-slate-800">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-800" />
                <span>فهرست اسناد و مدارک ضمیمه شده (Enclosures):</span>
              </span>
              <span className="text-[11px] text-slate-600 font-mono">تعداد: {data.attachmentsList.length} قلم</span>
            </div>

            <ul className="divide-y divide-slate-200 text-xs text-slate-800">
              {data.attachmentsList.map((item, idx) => (
                <li key={idx} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-950 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 flex-1">{item}</span>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          <p className="whitespace-pre-line leading-loose font-medium pt-2">
            {data.closingText}
          </p>
        </div>

        {/* Official Signatures & Stamp Block (امضا و مهر رسمی) */}
        <div className="pt-10 mt-8 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-8">
          
          {/* Official Seal Placeholder */}
          <div className="w-36 h-36 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-center p-2 text-slate-400 text-[10px] shrink-0 print:border-slate-500">
            <Stamp className="w-8 h-8 mb-1 text-slate-400" />
            <span className="font-bold">محل مهر رسمی شرکت</span>
            <span className="text-[9px] font-mono mt-0.5">DAB/7-0965</span>
          </div>

          {/* President Signature Block */}
          <div className="text-center sm:text-left space-y-2 min-w-[220px]">
            <div className="text-xs font-bold text-slate-600">با احترام و امتنان؛</div>
            <div className="font-black text-sm text-slate-950">{data.signatoryName}</div>
            <div className="text-xs font-bold text-blue-900">{data.signatoryTitle}</div>
            
            {/* Signature Line Space */}
            <div className="pt-8">
              <div className="w-44 border-b-2 border-slate-800 mx-auto sm:mx-0"></div>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">امضاء و شصت رئیس شرکت</span>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 print:border-slate-300">
          <span>آدرس: {data.companyAddress}</span>
          <span>شماره تماس: {data.companyPhone}</span>
          <span>صفحه ۱ از ۱</span>
        </div>
      </div>
    </div>
  );
}
