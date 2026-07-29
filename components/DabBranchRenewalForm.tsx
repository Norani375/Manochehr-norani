'use client';

import React, { useState, useEffect } from 'react';
import { Building, FileText, CheckCircle2, Printer, RotateCcw, Save, ShieldAlert, CheckSquare, Square, Image as ImageIcon, Download } from 'lucide-react';

export interface BranchRenewalData {
  // Section 1: Company details
  companyName: string;
  licenseNo: string;
  centralProvince: string;
  centralDistrict: string;
  centralMarket: string;
  centralShopNo: string;
  companyPhone: string;
  companyEmail: string;

  // Section 1: Branch and Representative details
  branchProvince: string;
  branchNo: string;
  branchMarketName: string;
  branchShopNo: string;
  branchLocation: string;

  repResProv: string;
  repResDistrict: string;
  repResVillage: string;

  repName: string;
  repFatherName: string;
  repTazkiraNo: string;
  repPhone: string;

  // Section 2: Education
  educationLevel: 'baccalaureate' | 'higher' | 'other';
  educationOtherText: string;

  // Verification & Signatures
  boardHeadName: string;
  boardHeadFather: string;
  shareholder1Name: string;
  shareholder2Name: string;

  formDate: string;

  // Section 3: Official Assessment
  assessorName: string;
  assessorDate: string;
  supervisorName: string;
  supervisorDate: string;
}

export interface BranchPreset {
  id: string;
  title: string;
  branchNo: string;
  branchProvince: string;
  branchMarketName: string;
  branchShopNo: string;
  branchLocation: string;
  repName: string;
  repFatherName: string;
  repTazkiraNo: string;
  repPhone: string;
  repResProv: string;
  repResDistrict: string;
  repResVillage: string;
  educationLevel: 'baccalaureate' | 'higher' | 'other';
  educationOtherText?: string;
}

export const REAL_BRANCHES_PRESETS: BranchPreset[] = [
  {
    id: 'kabul',
    title: 'نمایندگی اول: ولایت کابل (DAB/7-0965-A1)',
    branchNo: 'اول',
    branchProvince: 'کابل',
    branchMarketName: 'مارکیت سرای شهزاده',
    branchShopNo: 'منزل اول دکان ۱۸۸',
    branchLocation: 'کابل، سرای شهزاده',
    repName: 'اجمل',
    repFatherName: 'نورآغا',
    repTazkiraNo: '1400-107-46338',
    repPhone: '0799336520',
    repResProv: 'کابل',
    repResDistrict: 'ناحیه اول',
    repResVillage: 'مرکز',
    educationLevel: 'higher',
  },
  {
    id: 'takhar',
    title: 'نمایندگی دوم: ولایت تخار (DAB/7-0965-A2)',
    branchNo: 'دوم',
    branchProvince: 'تخار',
    branchMarketName: 'صرافی صرافان تخار',
    branchShopNo: 'دکان ۱۲',
    branchLocation: 'مرکز تالقان، مارکیت صرافان',
    repName: 'رحمت‌الله',
    repFatherName: 'فیض‌الله',
    repTazkiraNo: '1400-1305-16532',
    repPhone: '0788165320',
    repResProv: 'تخار',
    repResDistrict: 'تالقان',
    repResVillage: 'مرکز',
    educationLevel: 'baccalaureate',
  },
  {
    id: 'kunduz_imam',
    title: 'نمایندگی سوم: ولسوالی امام‌صاحب (DAB/7-0965-A3)',
    branchNo: 'سوم',
    branchProvince: 'کندز',
    branchMarketName: 'مارکیت مرکزی صرافان',
    branchShopNo: 'دکان ۴۵',
    branchLocation: 'بازار مرکزی امام صاحب',
    repName: 'محمد یوسف',
    repFatherName: 'عبدالمجید',
    repTazkiraNo: '1399-1205-98680',
    repPhone: '0779986800',
    repResProv: 'کندز',
    repResDistrict: 'امام‌صاحب',
    repResVillage: 'مرکز بازار',
    educationLevel: 'baccalaureate',
  },
  {
    id: 'badakhshan_kishm',
    title: 'نمایندگی چهارم: ولسوالی کشم (DAB/7-0965-A4)',
    branchNo: 'چهارم',
    branchProvince: 'بدخشان',
    branchMarketName: 'مارکیت صرافان کشم',
    branchShopNo: 'دکان ۵',
    branchLocation: 'بازار کشم',
    repName: 'عتیق‌الله',
    repFatherName: 'شمس‌الدین',
    repTazkiraNo: '7252',
    repPhone: '0799681111',
    repResProv: 'بدخشان',
    repResDistrict: 'کشم',
    repResVillage: 'مرکز کشم',
    educationLevel: 'baccalaureate',
  },
];

const DEFAULT_BRANCH_RENEWAL_DATA: BranchRenewalData = {
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  licenseNo: 'DAB/7-0965',
  centralProvince: 'کندز',
  centralDistrict: 'مرکز',
  centralMarket: 'مومند مارکیت',
  centralShopNo: 'منزل دوم دکان ۳۰۱',
  companyPhone: '0799681111 / 0749340000',
  companyEmail: 'info@barakatullah-exchange.af',

  branchProvince: 'تخار',
  branchNo: 'دوم',
  branchMarketName: 'صرافی صرافان',
  branchShopNo: 'دکان 12',
  branchLocation: 'مرکز تالقان، مارکیت صرافان',

  repResProv: 'تخار',
  repResDistrict: 'تالقان',
  repResVillage: 'مرکز',

  repName: 'رحمت‌الله رحیمی',
  repFatherName: 'محمد مراد',
  repTazkiraNo: '1400-1305-16532',
  repPhone: '0788165320',

  educationLevel: 'baccalaureate',
  educationOtherText: '',

  boardHeadName: 'برکت‌الله غفوری',
  boardHeadFather: 'عبدالغفور',
  shareholder1Name: 'برکت‌الله غفوری (مالک ۱۰۰٪)',
  shareholder2Name: '',

  formDate: new Date().toISOString().split('T')[0],

  assessorName: '',
  assessorDate: '',
  supervisorName: '',
  supervisorDate: '',
};

export default function DabBranchRenewalForm({ customLogo: propLogo, onOpenLogoModal, onExportPdf }: { customLogo?: string | null; onOpenLogoModal?: () => void; onExportPdf?: () => void } = {}) {
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [data, setData] = useState<BranchRenewalData>(DEFAULT_BRANCH_RENEWAL_DATA);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLogo(localStorage.getItem('custom_company_logo'));
      try {
        const saved = localStorage.getItem('dab_branch_renewal_data');
        if (saved) setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load DAB branch renewal form', e);
      }
    }, 0);

    const handleLogoUpdate = () => {
      setLocalLogo(localStorage.getItem('custom_company_logo'));
    };
    window.addEventListener('custom_logo_updated', handleLogoUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('custom_logo_updated', handleLogoUpdate);
    };
  }, []);

  const customLogo = propLogo !== undefined ? propLogo : localLogo;

  const handleSave = () => {
    try {
      localStorage.setItem('dab_branch_renewal_data', JSON.stringify(data));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام مقادیر این فورم به اطلاعات پیش‌فرض بازگردد؟')) {
      setData(DEFAULT_BRANCH_RENEWAL_DATA);
      localStorage.removeItem('dab_branch_renewal_data');
    }
  };

  const handleSelectPreset = (preset: BranchPreset) => {
    setData((prev) => ({
      ...prev,
      branchNo: preset.branchNo,
      branchProvince: preset.branchProvince,
      branchMarketName: preset.branchMarketName,
      branchShopNo: preset.branchShopNo,
      branchLocation: preset.branchLocation,
      repName: preset.repName,
      repFatherName: preset.repFatherName,
      repTazkiraNo: preset.repTazkiraNo,
      repPhone: preset.repPhone,
      repResProv: preset.repResProv,
      repResDistrict: preset.repResDistrict,
      repResVillage: preset.repResVillage,
      educationLevel: preset.educationLevel,
      educationOtherText: preset.educationOtherText || '',
    }));
  };

  const updateField = (field: keyof BranchRenewalData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-6 dir-rtl text-slate-900 font-sans">
      {/* Top Controls Toolbar (Hidden in Print) */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900 text-white rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">فورم تمدید نمایندگی (د افغانستان بانک)</h2>
            <p className="text-xs text-slate-500">
              این فورم با امضاء مسئول عملیاتی شرکت به مدیریت جوازدهی آمریت عمومی نظارت از مؤسسات مالی غیر بانکی ارائه می‌گردد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenLogoModal && (
            <button
              type="button"
              onClick={onOpenLogoModal}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300"
            >
              <ImageIcon className="w-4 h-4 text-blue-900" />
              {customLogo ? 'تغییر لوگوی شرکت' : 'آپلود لوگوی شرکت'}
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'ذخیره شد!' : 'ذخیره اطلاعات'}
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="پاکسازی / بازنشانی"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-xs"
              title="ذخیره این فرم به عنوان فایل PDF استاندارد"
            >
              <Download className="w-4 h-4" />
              دانلود PDF با کیفیت
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            چاپ فرم
          </button>
        </div>
      </div>

      {/* Quick Branch Selection Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-4 mb-6 shadow-md print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">انتخاب سریع نمایندگی‌های واقعی شرکت برکت‌الله غفوری (جواز DAB/7-0965):</span>
          </div>
          <span className="text-xs text-blue-200 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800 font-mono">
            ۵ نمایندگی رسمی فعال
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {REAL_BRANCHES_PRESETS.map((preset) => {
            const isSelected = data.branchProvince === preset.branchProvince && data.repName === preset.repName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected 
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.02]' 
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] opacity-80">({preset.repName})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Form Canvas */}
      <div id="dab-branch-renewal-canvas" className="bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Header */}
        <div className="relative text-center mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Dedicated Form Logo Container */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 p-2 rounded-xl text-right">
              {customLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customLogo}
                  alt="لوگوی اختصاصی شرکت"
                  className="w-16 h-16 object-contain border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-900 text-amber-400 rounded-lg flex flex-col items-center justify-center font-bold p-1">
                  <Building className="w-7 h-7" />
                  <span className="text-[9px] mt-0.5 font-sans">لوگوی اختصاصی</span>
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-xs font-black text-blue-950 block">برکت‌الله غفوری</span>
                <span className="text-[10px] text-slate-600 font-bold block">لوگوی اختصاصی نمایندگی</span>
                {onOpenLogoModal && (
                  <button
                    type="button"
                    onClick={onOpenLogoModal}
                    className="text-[10px] text-blue-700 hover:underline font-bold print:hidden cursor-pointer"
                  >
                    تغییر لوگو
                  </button>
                )}
              </div>
            </div>

            <div className="text-center flex-1">
              <h1 className="text-lg font-extrabold text-slate-900 mb-1">د افغانستان بانک</h1>
              <h2 className="text-base font-bold text-slate-800 mb-1">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</h2>
              <h3 className="text-sm font-semibold text-slate-700">مدیریت جواز دهی</h3>
            </div>

            {/* Official DAB Emblem Badge */}
            <div className="hidden sm:flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-300 rounded-xl text-center w-24">
              <div className="w-10 h-10 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center font-black text-xs border-2 border-amber-400/50">
                DAB
              </div>
              <span className="text-[9px] font-bold text-slate-700 mt-1">بانک مرکزی</span>
            </div>
          </div>

          <div className="inline-block bg-slate-100 border border-slate-400 font-extrabold text-slate-900 px-6 py-2 rounded-lg text-base mt-1">
            فورم تمدید نماینده گی شرکت صرافی و خدمات پولی
          </div>
          <p className="text-xs text-slate-600 mt-3 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg inline-block text-amber-900">
            رهنمود عمومی: این فورم با امضاء مسئول عملیاتی شرکت صرافی و خدمات پولی به مدیریت جواز دهی آمریت عمومی نظارت از مؤسسات مالی غیر بانکی و یا زون مربوطه د افغانستان بانک، ارائه می گردد.
          </p>
        </div>

        {/* Section 1: Company & Branch Details */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-t-lg text-sm mb-3">
            بخش اول:
          </div>

          {/* Table 1: Company Info */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-800 mb-2">
              ۱. لطفا در جدول ذیل مشخصات شرکت صرافی و یا خدمات پولی را درج نمایید.
            </p>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr>
                  <td className="border border-slate-400 bg-slate-100 p-2 font-bold w-1/4">نام شرکت:</td>
                  <td className="border border-slate-400 p-1.5 font-bold text-blue-950" colSpan={3}>
                    <input
                      type="text"
                      value={data.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-bold text-blue-900"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-100 p-2 font-bold w-1/6">شماره جواز:</td>
                  <td className="border border-slate-400 p-1.5 font-bold font-mono">
                    <input
                      type="text"
                      value={data.licenseNo}
                      onChange={(e) => updateField('licenseNo', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 bg-slate-100 p-2 font-bold" rowSpan={2}>
                    موقعیت دفتر مرکزی شرکت:
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold">ولایت</td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold">ناحیه/ولسوالی</td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold">مارکیت</td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold" colSpan={2}>
                    منزل و شماره دکان
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.centralProvince}
                      onChange={(e) => updateField('centralProvince', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.centralDistrict}
                      onChange={(e) => updateField('centralDistrict', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.centralMarket}
                      onChange={(e) => updateField('centralMarket', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 p-1" colSpan={2}>
                    <input
                      type="text"
                      value={data.centralShopNo}
                      onChange={(e) => updateField('centralShopNo', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-center"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 bg-slate-100 p-2 font-bold" rowSpan={2}>
                    پل ارتباطی با شرکت:
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold" colSpan={2}>
                    شماره تیلیفون
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1.5 text-center font-semibold" colSpan={3}>
                    ایمیل آدرس
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1" colSpan={2}>
                    <input
                      type="text"
                      value={data.companyPhone}
                      onChange={(e) => updateField('companyPhone', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded font-mono text-center"
                    />
                  </td>
                  <td className="border border-slate-400 p-1" colSpan={3}>
                    <input
                      type="text"
                      value={data.companyEmail}
                      onChange={(e) => updateField('companyEmail', e.target.value)}
                      className="w-full px-1.5 py-1 border rounded font-mono text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: Branch and Representative Details */}
          <div className="mt-6">
            <p className="text-xs font-bold text-slate-800 mb-2">
              ۲. لطفاً در جدول ذیل مشخصات نماینده گی تحت اثر و نماینده را درج نمایید.
            </p>
            <table className="w-full border-collapse border border-slate-400 text-xs text-center">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold">
                  <th className="border border-slate-400 p-2 w-1/3" colSpan={2}>
                    اسم و محل فعالیت نماینده گی شرکت صرافی و خدمات پولی
                  </th>
                  <th className="border border-slate-400 p-2 w-1/4" colSpan={2}>
                    سکونت فعلی
                  </th>
                  <th className="border border-slate-400 p-2 w-5/12" colSpan={2}>
                    شهرت مکمل نماینده با صلاحیت
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">ولایت</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.branchProvince}
                      onChange={(e) => updateField('branchProvince', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">ولایت</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repResProv}
                      onChange={(e) => updateField('repResProv', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">اسم</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repName}
                      onChange={(e) => updateField('repName', e.target.value)}
                      className="w-full p-1 border rounded font-bold text-blue-900 text-center"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">شماره نمایندگی</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.branchNo}
                      onChange={(e) => updateField('branchNo', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">ناحیه/ولسوالی</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repResDistrict}
                      onChange={(e) => updateField('repResDistrict', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">ولد</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repFatherName}
                      onChange={(e) => updateField('repFatherName', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">اسم مارکیت</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.branchMarketName}
                      onChange={(e) => updateField('branchMarketName', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">قریه</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repResVillage}
                      onChange={(e) => updateField('repResVillage', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">نمبر تذکره</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repTazkiraNo}
                      onChange={(e) => updateField('repTazkiraNo', e.target.value)}
                      className="w-full p-1 border rounded font-mono text-center"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">شماره دکان و منزل</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.branchShopNo}
                      onChange={(e) => updateField('branchShopNo', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">محل فعالیت</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.branchLocation}
                      onChange={(e) => updateField('branchLocation', e.target.value)}
                      className="w-full p-1 border rounded text-center"
                    />
                  </td>
                  <td className="border border-slate-400 bg-slate-50 p-1 font-semibold">شماره تماس نماینده</td>
                  <td className="border border-slate-400 p-1">
                    <input
                      type="text"
                      value={data.repPhone}
                      onChange={(e) => updateField('repPhone', e.target.value)}
                      className="w-full p-1 border rounded font-mono text-center"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Education & Endorsement */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-t-lg text-sm mb-3">
            بخش دوم:
          </div>

          {/* Education level check */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs mb-4">
            <p className="font-bold text-slate-800 mb-2">
              ۱. سطح تحصیلات نماینده با صلاحیت تا چه حد است؟ در صورت داشتن تحصیل، سند تحصیلی را ضمیمه این فورم نمایید.
            </p>
            <div className="flex flex-wrap items-center gap-6 my-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="educationLevel"
                  checked={data.educationLevel === 'baccalaureate'}
                  onChange={() => updateField('educationLevel', 'baccalaureate')}
                  className="w-4 h-4 text-blue-900"
                />
                <span className="font-semibold">بکلوریا (۱۲ پاس)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="educationLevel"
                  checked={data.educationLevel === 'higher'}
                  onChange={() => updateField('educationLevel', 'higher')}
                  className="w-4 h-4 text-blue-900"
                />
                <span className="font-semibold">دارای تحصیلات عالی (لیسانس / ماستر)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="educationLevel"
                  checked={data.educationLevel === 'other'}
                  onChange={() => updateField('educationLevel', 'other')}
                  className="w-4 h-4 text-blue-900"
                />
                <span className="font-semibold">سایر موارد</span>
              </label>
            </div>

            {data.educationLevel === 'other' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={data.educationOtherText}
                  onChange={(e) => updateField('educationOtherText', e.target.value)}
                  placeholder="سایر موارد سطح تحصیلات..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            )}
          </div>

          {/* Board of Supervisors Certification */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-800 mb-4">
            <p className="font-bold text-slate-900 mb-2 border-b pb-1">
              ۲. تصدیق هیأت نظار شرکت صرافی و خدمات پولی:
            </p>
            <p>
              این جانب (
              <input
                type="text"
                value={data.boardHeadName}
                onChange={(e) => updateField('boardHeadName', e.target.value)}
                className="inline-block mx-1 px-2 py-0.5 border-b border-slate-800 bg-white font-bold text-blue-900 w-36 text-center text-xs"
              />
              ) ولد (
              <input
                type="text"
                value={data.boardHeadFather}
                onChange={(e) => updateField('boardHeadFather', e.target.value)}
                className="inline-block mx-1 px-2 py-0.5 border-b border-slate-800 bg-white font-bold w-36 text-center text-xs"
              />
              ) رییس هیأت نظار شرکت صرافی و خدمات پولی (
              <span className="font-bold">{data.companyName}</span>) دارای جواز نمبر (
              <span className="font-mono font-bold">{data.licenseNo}</span>) از اهلیت و شهرت نیک نماینده با صلاحیت (
              <span className="font-bold text-blue-900">{data.repName}</span>) تصدیق نموده و موصوف را منحیث نماینده رسمی شرکت به د افغانستان بانک معرفی می نمایم. همچنان بدین وسیله اقرار مینمایم که معلومات ارائه شده در فورم درخواستی هذا را با تمام هوش و حواس خویش خانه پوری نموده و درست و کامل میباشد.
            </p>
          </div>

          {/* Clauses for Branch Renewal */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs mb-4">
            <p className="font-bold text-slate-900 mb-3 border-b pb-1">
              ب: تعهد سهمدار / سهمداران در قسمت تمدید نمایندگی
            </p>

            <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-800">
              <li>
                اینجانب/مایان سهمدار/سهمداران مسئول و پاسخگوی تمام نماینده گی های خویش در مرکز و ولایات میباشم/میباشیم و از تطبیق قوانین و مقررات در تمام فعالیت های شرکت، بشمول نمایندگی های خویش، حصول اطمینان مینمایم/مینهماییم؛
              </li>
              <li>
                تعهد میدارم/میداریم که نمایندگی، تحت اثر شرکت صرافی و خدمات پولی می باشد و همواره از اجراآت خویش به مرکز گزارشدهی می نمایند.
              </li>
              <li>
                به کارکنان نمایندگی بشمول نماینده از طرف دفتر مرکزی معاش مشخص تعیین گردیده و بشکل ماهوار پرداخت می گردد.
              </li>
              <li>
                تمام مسائل مالی از قبیل سرمایه و مفاد و ضرر نمایندگی مربوط به دفتر مرکزی می باشد و طبق هدایات دفتر مرکزی در نمایندگی اجراآت صورت میگیرد.
              </li>
              <li>
                تعهد میدارم/میداریم که نمایندگی صرف مسئولیت تصفیه معاملات با دفتر مرکزی را دارد و بدون توافق و هدایت دفتر مرکزی، نمیتواند بشکل مستقلانه با صرافان و سایر اشخاص اجراآت داشته باشد.
              </li>
              <li>
                قرارداد محل فعالیت نمایندگی از آدرس سهمداران و یا شرکت صرافی و خدمات پولی عقد گردیده و نماینده در آن هیچ نقشی ندارد.
              </li>
              <li>
                نمایندگی از سیستم دفتر مرکزی استفاده می نماید و تمامی معاملات آن وارد سیستم می گردد که همزمان به دفتر مرکزی نمایان و از طرف مسئولین دفتر مرکزی بررسی و نظارت می گردد.
              </li>
              <li>
                از تمامی فعالیت ها و معاملات نمایندگی آگاهی دارم/داریم و تمامی معاملات و اجراآت نمایندگی در هماهنگی با دفتر مرکزی صورت میگیرد.
              </li>
              <li>
                اگر بعد از تعلیق، ترک پیشه یا لغو اجازه نامه نمایندگی، فعالیت های نمایندگی صرافی و خدمات پولی ام در مرکز و یا و لایات کشور آشکار میشود، غیر قانونی بوده و مسئول میباشم؛
              </li>
            </ol>
          </div>

          {/* Signatures Table */}
          <div className="border border-slate-400 rounded-lg overflow-hidden text-xs mt-4">
            <div className="bg-slate-200 font-bold px-3 py-2 text-slate-900 border-b border-slate-400 text-center">
              امضاء مسئولین شرکت صرافی و خدمات پولی
            </div>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="border-r border-slate-300 p-2 w-1/3">مسئولین</th>
                  <th className="border-r border-slate-300 p-2 w-1/3">نام</th>
                  <th className="p-2 w-1/3">امضاء و شصت</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="border-r border-slate-300 p-2 font-bold bg-slate-50">رئیس هیئت نظار</td>
                  <td className="border-r border-slate-300 p-2 font-bold text-blue-900">
                    {data.boardHeadName}
                  </td>
                  <td className="p-2">______________________</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="border-r border-slate-300 p-2 font-bold bg-slate-50">سهمدار</td>
                  <td className="border-r border-slate-300 p-1">
                    <input
                      type="text"
                      value={data.shareholder1Name}
                      onChange={(e) => updateField('shareholder1Name', e.target.value)}
                      className="w-full p-1 border rounded text-center font-bold"
                    />
                  </td>
                  <td className="p-2">______________________</td>
                </tr>
                <tr>
                  <td className="border-r border-slate-300 p-2 font-bold bg-slate-50">سهمدار</td>
                  <td className="border-r border-slate-300 p-1">
                    <input
                      type="text"
                      value={data.shareholder2Name}
                      onChange={(e) => updateField('shareholder2Name', e.target.value)}
                      className="w-full p-1 border rounded text-center font-bold"
                    />
                  </td>
                  <td className="p-2">______________________</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap justify-between items-center text-xs font-bold pt-2">
            <div>
              مُهر شرکت صرافی و خدمات پولی: <span className="text-blue-900">{data.companyName}</span>
            </div>
            <div>
              تاریخ: 
              <input
                type="text"
                value={data.formDate}
                onChange={(e) => updateField('formDate', e.target.value)}
                className="inline-block mx-2 px-2 py-1 border rounded bg-white font-mono text-center w-32"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Completed by DAB Officers */}
        <div className="border-2 border-slate-400 rounded-xl p-4 bg-slate-50/80 text-xs">
          <div className="bg-slate-900 text-white font-bold px-3 py-1 rounded text-xs inline-block mb-3">
            بخش سوم:
          </div>
          <p className="font-bold text-slate-800 mb-3">
            این قسمت توسط کارمند مسئول د افغانستان بانک تکمیل می گردد:
          </p>

          <div className="space-y-2 mb-4 text-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-slate-400 rounded bg-white inline-block"></span>
              <span>درخواست کننده دارای جواز فعالیت شرکت صرافی و خدمات پولی از این اداره بوده و جواز اش به روز (Updated) می باشد.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-slate-400 rounded bg-white inline-block"></span>
              <span>کاپی تذکره نماینده با صلاحیت معرفی شده تسلیم گردیده است.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-slate-400 rounded bg-white inline-block"></span>
              <span>
                نماینده صلاحیت دارای سند تحصیلی (________________) با تجربه کاری مرتبط می باشد که اسناد مربوطه ارایه گردیده است.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-slate-400 rounded bg-white inline-block"></span>
              <span>فورم هذا حسب اسناد مربوطه، خانه پُری گردیده است.</span>
            </div>
          </div>

          <p className="leading-relaxed text-slate-800 mb-6 bg-white p-3 border rounded border-slate-300">
            با بررسی و ارزیابی این درخواستی و سایر معلومات و مدارک ارائه شده، درخواست کننده واجد شرایط برای اخذ جواز نماینده گی تحت اثر شرکت صرافی و خدمات پولی بوده و نماینده معرفی شده واجد شرایط برای پیشبرد امور نمایندهگی درخواست شده می باشد.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-300 font-bold text-slate-800">
            <div>
              اسم ارزیابی کننده: ___________________
              <div className="mt-2">امضاء ارزیابی کننده: ___________________</div>
            </div>
            <div>
              اسم و امضاء مسئول نظارت ساحوی در زون مربوطه: ___________________
              <div className="mt-2">تاریخ: ______ / ______ / ________</div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-6 border-t border-slate-300 flex items-end justify-between px-6">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-slate-400 text-[9px] font-bold p-2 text-center">
              <span>محل مهر رسمی شرکت</span>
            </div>
          </div>

          <div className="text-center space-y-1.5 min-w-[200px]">
            <div className="font-bold text-slate-700 text-xs">با احترام؛</div>
            <div className="font-black text-sm text-slate-950">{data.repName || "محمد اشرف ولد محمد مراد"}</div>
            <div className="text-xs font-bold text-blue-900">{`نماینده باصلاحیت نمایندگی ${data.branchProvince}`}</div>
            <div className="pt-6 font-bold text-slate-600 text-[10px] border-t border-slate-300 mt-2">
              امضاء و شصت
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
