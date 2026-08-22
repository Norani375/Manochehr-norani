'use client';
import { toEnglishDigits } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserCheck, Building, FileText, CheckCircle2, Printer, RotateCcw, Save, ShieldAlert, Image as ImageIcon, Download, FileCode } from 'lucide-react';
import { exportElementToWord } from '@/lib/wordExport';
import DabOfficialHeader from './DabOfficialHeader';

export interface Guarantor {
  id: number;
  name: string;
  fatherName: string;
  grandfatherName?: string;
  tazkiraNo: string;
  phoneNo: string;
  email: string;
  province: string;
  district: string;
  nahia: string;
  village: string;
  currentProvince: string;
  currentDistrict: string;
  currentNahia: string;
  currentVillage: string;
  businessNameLocation: string;
}

export interface GuarantorCompany {
  businessName: string;
  activityType: string;
  licenseNo: string;
  companyPhone: string;
  expiryDate: string;
  email: string;
  issuingAuthority: string;
  businessAddress: string;
}

export interface GuaranteedShareholder {
  id: number;
  name: string;
  fatherName: string;
  tazkiraNo: string;
}

export interface GuaranteeFormData {
  guarantors: Guarantor[];
  guarantorCompany: GuarantorCompany;
  companyName: string;
  provinceName: string;
  shareholders: GuaranteedShareholder[];
  formDate: string;
}

const DEFAULT_FORM_DATA: GuaranteeFormData = {
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  provinceName: 'کندز',
  guarantors: [
    {
      id: 1,
      name: 'بسم‌الله شیرزی',
      fatherName: 'دوست محمد',
      grandfatherName: 'محمد غوث',
      tazkiraNo: '45188',
      phoneNo: '0799681111',
      email: 'bismillah@exchange.af',
      province: 'کندز',
      district: 'مرکز',
      nahia: 'ناحیه اول',
      village: 'مرکز شهر',
      currentProvince: 'کندز',
      currentDistrict: 'مرکز',
      currentNahia: 'ناحیه اول',
      currentVillage: 'مرکز شهر',
      businessNameLocation: 'صرافی برکت‌الله غفوری - کندز',
    },
    {
      id: 2,
      name: 'عظیم‌الله رحمانی',
      fatherName: 'محمد آجان',
      grandfatherName: 'رحمان‌قل',
      tazkiraNo: '35806',
      phoneNo: '0749340000',
      email: 'azim@exchange.af',
      province: 'کندز',
      district: 'مرکز',
      nahia: 'ناحیه دوم',
      village: 'مرکز',
      currentProvince: 'کندز',
      currentDistrict: 'مرکز',
      currentNahia: 'ناحیه دوم',
      currentVillage: 'مرکز',
      businessNameLocation: 'صرافی برکت‌الله غفوری - کندز',
    },
    {
      id: 3,
      name: 'صالح محمد',
      fatherName: 'عبدالرحیم',
      grandfatherName: 'غلام نبی',
      tazkiraNo: '48424',
      phoneNo: '0799681111',
      email: 'saleh@exchange.af',
      province: 'کندز',
      district: 'مرکز',
      nahia: 'ناحیه سوم',
      village: 'مرکز',
      currentProvince: 'کندز',
      currentDistrict: 'مرکز',
      currentNahia: 'ناحیه سوم',
      currentVillage: 'مرکز',
      businessNameLocation: 'صرافی برکت‌الله غفوری - کندز',
    },
  ],
  guarantorCompany: {
    businessName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
    activityType: 'صرافی و خدمات پولی (MSP)',
    licenseNo: '7-0965',
    companyPhone: '0799681111 / 0749340000',
    expiryDate: '1405/03/13',
    email: 'info@barakatullah-exchange.af',
    issuingAuthority: 'مرجع مربوطه',
    businessAddress: 'ولایت کندز، مارکیت مهمند، منزل دوم، دکان نمبر 301',
  },
  shareholders: [
    { id: 1, name: 'برکت‌الله', fatherName: 'عبدالغفور', tazkiraNo: '55522' },
  ],
  formDate: new Date().toISOString().split('T')[0],
};



interface EditableFieldProps {
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: string;
  isTazkira?: boolean;
}
const EditableField = ({ isEditMode, value, onChange, placeholder, className = "", dir, isTazkira }: EditableFieldProps) => {
  if (isEditMode) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(isTazkira ? toEnglishDigits(e.target.value) : e.target.value)}
        placeholder={placeholder}
        dir={dir || (isTazkira ? "ltr" : undefined)}
        className={`w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs ${isTazkira ? 'text-left font-sans' : ''} ${className}`}
      />
    );
  }
  return <span className={`inline-block py-1 font-bold text-blue-900 border-b border-transparent ${className}`}>{value || '---'}</span>;
};

export default function DabGuaranteeForm({ 
  isEditMode: initialEditMode = true, 
  customLogo: propLogo, 
  onOpenLogoModal, 
  onExportPdf, 
  onExportWord,
  companyId = "default"
}: { 
  isEditMode?: boolean; 
  customLogo?: string | null; 
  onOpenLogoModal?: () => void; 
  onExportPdf?: () => void; 
  onExportWord?: () => void;
  companyId?: string 
} = {}) {
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuaranteeFormData>(DEFAULT_FORM_DATA);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(initialEditMode);

  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', `guarantee_form_v1_${companyId}`);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData?.formData) {
            setFormData(prev => ({ ...prev, ...remoteData.formData }));
          }
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase load error:", error);
    }
  }, [companyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLogo(localStorage.getItem(`custom_company_logo_${companyId}`));
      try {
        const saved = localStorage.getItem(`dab_guarantee_form_data_${companyId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else {
          setFormData(DEFAULT_FORM_DATA);
        }
      } catch (e) {
        console.error('Failed to load DAB guarantee form from storage', e);
      }
    }, 0);

    const handleLogoUpdate = () => {
      setLocalLogo(localStorage.getItem(`custom_company_logo_${companyId}`));
    };
    window.addEventListener('custom_logo_updated', handleLogoUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('custom_logo_updated', handleLogoUpdate);
    };
  }, [companyId]);

  const customLogo = propLogo !== undefined ? propLogo : localLogo;

  const handleRemoveLogo = () => {
    localStorage.removeItem(`custom_company_logo_${companyId}`);
    setLocalLogo(null);
    window.dispatchEvent(new Event('custom_logo_updated'));
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(`dab_guarantee_form_data_${companyId}`, JSON.stringify(formData));
      const docRef = doc(db, 'settings', `guarantee_form_v1_${companyId}`);
      await setDoc(docRef, { formData, updatedAt: new Date().toISOString() }, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save DAB form', e);
    }
  };

  const handleReset = () => {
    if (confirm('آیا اطمینان دارید که می‌خواهید تمام مقادیر این فورم به حالت اولیه بازگردد؟')) {
      setFormData(DEFAULT_FORM_DATA);
      localStorage.removeItem(`dab_guarantee_form_data_${companyId}`);
    }
  };

  const updateGuarantor = (index: number, field: keyof Guarantor, value: string) => {
    const newGuarantors = [...formData.guarantors];
    newGuarantors[index] = { ...newGuarantors[index], [field]: value };
    setFormData({ ...formData, guarantors: newGuarantors });
  };

  const updateGuarantorCompany = (field: keyof GuarantorCompany, value: string) => {
    setFormData({
      ...formData,
      guarantorCompany: { ...formData.guarantorCompany, [field]: value },
    });
  };

  const updateShareholder = (index: number, field: keyof GuaranteedShareholder, value: string) => {
    const newShareholders = [...formData.shareholders];
    newShareholders[index] = { ...newShareholders[index], [field]: value };
    setFormData({ ...formData, shareholders: newShareholders });
  };

  const addShareholderRow = () => {
    setFormData({
      ...formData,
      shareholders: [
        ...formData.shareholders,
        { id: Date.now(), name: '', fatherName: '', tazkiraNo: '' },
      ],
    });
  };

  const removeShareholderRow = (id: number) => {
    if (formData.shareholders.length <= 1) return;
    setFormData({
      ...formData,
      shareholders: formData.shareholders.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-6 dir-rtl text-slate-900">
      {/* Top Floating Control Toolbar (Hidden in Print) */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-900" />
          <div>
            <h2 className="font-bold text-lg text-slate-900">فورم رسمی تضمین سر سهمدار (د افغانستان بانک)</h2>
            <p className="text-xs text-slate-500">مشخصات تضمین کنندگان و سهمداران را وارد و فرم را به صورت مستقیم چاپ کنید.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isEditMode 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
            }`}
          >
            {isEditMode ? 'قفل و پیش‌نمایش' : 'فعال‌سازی ویرایش'}
          </button>

          {onOpenLogoModal && isEditMode && (
            <button
              type="button"
              onClick={onOpenLogoModal}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300"
            >
              <ImageIcon className="w-4 h-4 text-blue-900" />
              {customLogo ? 'تغییر لوگوی شرکت' : 'آپلود لوگوی شرکت'}
            </button>
          )}

          {isEditMode && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'ذخیره شد!' : 'ذخیره اطلاعات'}
            </button>
          )}

          {isEditMode && (
            <button
              onClick={handleReset}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
              title="پاکسازی / بازنشانی"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (onExportWord) {
                onExportWord();
              } else {
                exportElementToWord({
                  elementId: 'dab-official-form',
                  filename: 'فورم_تضمین_سر_سهمدار_DAB.doc',
                  title: 'فورم تعهدنامه و تضمین سر سهمدار (د افغانستان بانک)',
                  orientation: 'portrait'
                });
              }
            }}
            className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-xs"
            title="استخراج این فرم به عنوان فایل Word قابل ویرایش (.doc)"
          >
            <FileCode className="w-4 h-4 text-blue-200" />
            استخراج به Word
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

      {/* Official Form Printable Canvas */}
      <div id="dab-guarantee-form-canvas" data-export-id="dab-official-form" className="dab-official-form dab-form-document bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Official Header */}
        <DabOfficialHeader
          storageKey={`guarantee_form_${companyId}`}
          
          bankName="د افغانستان بانک"
          department="آمریت عمومی نظارت از مؤسسات مالی غیر بانکی"
          directorate="مدیریت جوازدهی"
          formNumber=""
          formTitle="فورم تضمین سر سهمدار / سهمداران شرکت صرافی و خدمات پولی"
          guidelineText="تمامی سهمداران شرکت تضمین کننده نیاز است تا از سهمدار شرکت صرافی و خدمات پولی، تضمین نمایند."
          logoUrl={customLogo}
          onOpenLogoModal={onOpenLogoModal}
          isEditable={true}
        />

        {/* Section 1: Guarantors Details */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-black px-4 py-2 rounded-t-lg text-sm mb-3">
            بخش اول: شهرت تضمین کنندگان
          </div>
          <p className="text-xs text-slate-700 mb-4 font-bold bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg">
            تمامی سهمداران شرکت تضمین کننده نیاز است تا از سهمدار شرکت صرافی و خدمات پولی، تضمین نمایند.
          </p>

          {/* 3 Guarantors Tables matching official DAB standard exactly */}
          <div className="space-y-8">
            {formData.guarantors.map((guarantor, idx) => (
              <div key={guarantor.id} className="border-2 border-slate-900 rounded-xl overflow-hidden bg-white text-xs shadow-xs">
                <div className="bg-slate-900 text-white font-black px-3.5 py-2 text-xs flex items-center justify-between">
                  <span>
                    {idx === 0 ? '1. شهرت سهم دار اول شرکت تضمین کننده:' : idx === 1 ? '2. شهرت سهم دار دوم شرکت تضمین کننده:' : '3. شهرت سهم دار سوم شرکت تضمین کننده:'}
                  </span>
                  <span className="text-[11px] font-normal text-slate-300">سهم‌دار ضامن #{idx + 1}</span>
                </div>
                <div className="p-3">
                  <div className="flex flex-col md:flex-row print:flex-row gap-3 items-stretch">
                    {/* 3-Column Information Table */}
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full border-collapse border-2 border-slate-900 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-950 font-black text-center text-xs">
                            <th className="border border-slate-900 py-2 px-2.5 w-[42%] text-right font-black">اسم و محل فعالیت تشبث</th>
                            <th className="border border-slate-900 py-2 px-2.5 w-[29%] text-right font-black">سکونت اصلی</th>
                            <th className="border border-slate-900 py-2 px-2.5 w-[29%] text-right font-black">سکونت فعلی</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-black w-16 text-slate-900 shrink-0">اسم:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.name} onChange={(val) => updateGuarantor(idx, 'name', val)} className="font-black text-slate-950" />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ولایت:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.province} onChange={(val) => updateGuarantor(idx, 'province', val)} />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ولایت:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.currentProvince} onChange={(val) => updateGuarantor(idx, 'currentProvince', val)} />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-16 text-slate-800 shrink-0">ولد:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.fatherName} onChange={(val) => updateGuarantor(idx, 'fatherName', val)} />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ولسوالی:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.district} onChange={(val) => updateGuarantor(idx, 'district', val)} />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ولسوالی:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.currentDistrict} onChange={(val) => updateGuarantor(idx, 'currentDistrict', val)} />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-16 text-slate-800 shrink-0">ولدیت:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.grandfatherName || ''} onChange={(val) => updateGuarantor(idx, 'grandfatherName', val)} placeholder="نام پدرکلان..." />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ناحیه:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.nahia} onChange={(val) => updateGuarantor(idx, 'nahia', val)} />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">ناحیه:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.currentNahia} onChange={(val) => updateGuarantor(idx, 'currentNahia', val)} />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-16 text-slate-800 shrink-0">نمبر تذکره:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.tazkiraNo} onChange={(val) => updateGuarantor(idx, 'tazkiraNo', val)} isTazkira className="font-mono" />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">قریه:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.village} onChange={(val) => updateGuarantor(idx, 'village', val)} />
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-14 text-slate-700 shrink-0">قریه:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.currentVillage} onChange={(val) => updateGuarantor(idx, 'currentVillage', val)} />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle" colSpan={3}>
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-36 text-slate-800 shrink-0">اسم و محل فعالیت تشبث:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.businessNameLocation} onChange={(val) => updateGuarantor(idx, 'businessNameLocation', val)} placeholder="نام تشبث و آدرس کامل محل فعالیت ضامن..." className="text-slate-900 font-semibold" />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle" colSpan={3}>
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-36 text-slate-800 shrink-0">شماره تماس:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.phoneNo} onChange={(val) => updateGuarantor(idx, 'phoneNo', val)} className="font-mono" />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 p-1.5 align-middle" colSpan={3}>
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-36 text-slate-800 shrink-0">ایمیل آدرس:</span>
                                <EditableField isEditMode={isEditMode} value={guarantor.email} onChange={(val) => updateGuarantor(idx, 'email', val)} placeholder="email@example.com" className="font-mono" />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Official Photo & Stamp Box matching DAB official guidelines */}
                    <div className="w-full lg:w-56 flex flex-col border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <div className="bg-slate-200 text-slate-950 font-black p-2 text-center text-xs border-b border-slate-900">
                        محل نصب عکس و تاپه
                      </div>
                      <div className="flex-1 min-h-[190px] p-3 flex flex-col items-center justify-center text-center bg-white m-2 border-2 border-dashed border-slate-400 rounded-lg">
                        <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                        <span className="text-xs leading-relaxed font-bold text-slate-800">
                          عکس تضمين کننده در اينجا نصب و با مهر تضمين کننده تاپه گردد
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 my-3 font-semibold">
            نوت: در صورتیکه شرکت تضمین کننده علاوه بر سهمداران موجود، دارای سهمدار دیگر باشد، فورم جداگانه تکمیل گردد.
          </p>

          {/* Guarantor Company Details Table */}
          <div className="border border-slate-400 rounded-lg overflow-hidden mt-4 text-xs">
            <div className="bg-slate-200 font-bold px-3 py-1.5 border-b border-slate-400 text-slate-800">
              مشخصات شرکت تضمین کننده
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-slate-300 border-b border-slate-300">
              <div className="p-2 bg-slate-50 font-bold">اسم تشبث:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.businessName}
                  onChange={(val) => updateGuarantorCompany('businessName', val)}
                  placeholder="اسم شرکت ضامن..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">نوع فعالیت:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.activityType}
                  onChange={(val) => updateGuarantorCompany('activityType', val)}
                  placeholder="نوع فعالیت..."
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">نمبر جواز:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.licenseNo}
                  onChange={(val) => updateGuarantorCompany('licenseNo', val)}
                  className="font-mono"
                  placeholder="شماره جواز..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">شماره تماس شرکت:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.companyPhone}
                  onChange={(val) => updateGuarantorCompany('companyPhone', val)}
                  className="font-mono"
                  placeholder="شماره تماس..."
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">تاریخ اعتبار:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.expiryDate}
                  onChange={(val) => updateGuarantorCompany('expiryDate', val)}
                  placeholder="۱۴۰x/xx/xx"
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">ایمیل آدرس:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.email}
                  onChange={(val) => updateGuarantorCompany('email', val)}
                  className="font-mono"
                  placeholder="email@example.com"
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">اداره صادر کننده جواز:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.issuingAuthority}
                  onChange={(val) => updateGuarantorCompany('issuingAuthority', val)}
                  placeholder="وزارت صنعت و تجارت / ..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">آدرس تشبث:</div>
              <div className="p-1.5">
                <EditableField isEditMode={isEditMode}
                  value={formData.guarantorCompany.businessAddress}
                  onChange={(val) => updateGuarantorCompany('businessAddress', val)}
                  placeholder="آدرس کامل دفتر..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Guaranteed Shareholders */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-t-lg text-sm mb-3">
            بخش دوم: شهرت سهمدار شرکت صرافی و خدمات پولی (شخص تضمین شونده)
          </div>

          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-800 mb-4 print:bg-white print:p-2">
            مایان هریک که شهرت مکمل مان در فوق ذکر گردیده است، با رضایت کامل اظهار می‌داریم که سهمدار/سهمداران آتی‌الذکر که می‌خواهد جواز شرکت صرافی و خدمات پولی را تحت نام 
            <EditableField isEditMode={isEditMode}
              value={formData.companyName}
              onChange={(val) => setFormData({ ...formData, companyName: val })}
              className="inline-block mx-2 font-bold text-blue-900 text-center w-48 text-xs"
            />
            در ولایت 
            <EditableField isEditMode={isEditMode}
              value={formData.provinceName}
              onChange={(val) => setFormData({ ...formData, provinceName: val })}
              className="inline-block mx-2 font-bold text-blue-900 text-center w-32 text-xs"
            />
            اخذ/تمدید نماید، تضمین نموده و در صورت هر گونه تخلف و تخطی که از قوانین و مقررات نافذه کشور از آدرس شرکت صرافی و خدمات پولی ایشان انجام یابد، ایشان را در وقت معینه به مرجع مربوطه حاضر می‌نماییم و در اقرار خود صادق می‌باشیم.
          </div>

          {/* Table of Guaranteed Shareholders */}
          <table className="w-full border-collapse border border-slate-400 text-xs text-center mb-2">
            <thead>
              <tr className="bg-slate-200 text-slate-800">
                <th className="border border-slate-400 p-2 w-12">شماره</th>
                <th className="border border-slate-400 p-2">اسم</th>
                <th className="border border-slate-400 p-2">ولد</th>
                <th className="border border-slate-400 p-2">شماره تذکره</th>
                <th className="border border-slate-400 p-2 w-16 print:hidden">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {formData.shareholders.map((shareholder, sIdx) => (
                <tr key={shareholder.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-1 font-bold">{sIdx + 1}</td>
                  <td className="border border-slate-300 p-1">
                    <EditableField isEditMode={isEditMode}
                      value={shareholder.name}
                      onChange={(val) => updateShareholder(sIdx, 'name', val)}
                      className="text-center font-bold"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <EditableField isEditMode={isEditMode}
                      value={shareholder.fatherName}
                      onChange={(val) => updateShareholder(sIdx, 'fatherName', val)}
                      className="text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <EditableField isEditMode={isEditMode}
                      value={shareholder.tazkiraNo}
                      onChange={(val) => updateShareholder(sIdx, 'tazkiraNo', val)}
                      className="text-center font-mono"
                    />
                  </td>
                  <td className="border border-slate-300 p-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => removeShareholderRow(shareholder.id)}
                      className="text-red-600 hover:text-red-800 font-bold px-2 py-0.5 rounded"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print:hidden">
            <button
              type="button"
              onClick={addShareholderRow}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
            >
              + افزودن سهمدار دیگر
            </button>
          </div>
        </div>

        {/* Section 3: Commitments & Official Clauses */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-t-lg text-sm mb-3">
            بخش سوم: تعهدات تضمین کنندگان
          </div>

          <ol className="list-decimal list-inside text-xs leading-relaxed text-slate-800 space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg print:bg-white print:border-none print:p-0">
            <li>
              تضمین هذا باید با حضور شخص تضمین کننده در مقابل کارمند مسئول در مدیریت جوازدهی آمریت عمومی نظارت از مؤسسات مالی غیر بانکی یا در مقابل کارمند مسئول در آمریت زون مربوط/مدیریت نمایندگی د افغانستان بانک در ولایات امضاء و شصت گذاری گردد. کارمند مسئول متذکره خود را مطمئین سازد که فورم تضمین هذا حسب اسناد و مدارک مربوط به تضمین کننده خانه پُری گردیده و توسط شخص خود تضمین کننده امضاء و شصت گذاری می گردد.
            </li>
            <li>
              در صورتیکه تضمین کننده، ترک تضمین مینماید و یا نمیخواهد از مالک شرکت صرافی و خدمات پولی فوق الذکر تضمین نماید، نیاز است تا سهمدار/سهمداران شرکت صرافی و خدمات پولی، کتباً تضمین کننده جدید را به د افغانستان بانک معرفی نماید.
            </li>
            <li>
              تضمین کنندگان الی معرفی تضمین کننده جدید توسط سهمدار/سهمداران شرکت صرافی و خدمات پولی، منحیث تضمین کننده نزد د افغانستان بانک قرار میداشته باشند.
            </li>
            <li>
              هرگاه معلومات ضامن که در بخش اول این فورم ارائه گردیده تغییر نماید و یا تشبث و جواز فعالیت ضامن لغو گردد، تضمین کننده و سهمدار/ سهمداران شرکت صرافی و خدمات پولی مکلف اند تا د افغانستان بانک را عندالموقع کتباً اطلاع دهد. در غیر آن مسئولیت بدوش ضامن و سهمدار/سهمداران شرکت میباشد.
            </li>
            <li>
              تضمین متذکره صرف برای سه سال بوده و در زمان تمدید جواز فوق الذکر، ضمانت خط هذا تجدید میگردد.
            </li>
            <li>
              تضمین کننده نمیتواند از جمله اقارب درجه اول (پدر، مادر، فرزند، همسر، برادر و خواهر) شخص تضمین شونده باشد.
            </li>
          </ol>

          <p className="text-xs font-bold text-slate-900 mt-4 text-center">
            عکس‌ها و مُهر شرکت در فورم هذا و نقل تذکره تابعیت با جواز قابل اعتبار به این تضمین خط ضمیمه گردیده و صحت است.
          </p>

          {/* Signatures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-4 border-t border-slate-300 text-xs">
            <div className="border border-slate-300 p-3 rounded-lg text-center bg-slate-50 print:bg-white">
              <div className="font-bold mb-2">تضمین کننده اول</div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
              <div className="flex flex-col gap-2">
                <div>امضاء تضمین کننده: __________________</div>
                <div>شصت تضمین کننده: __________________</div>
              </div>
            </div>

            <div className="border border-slate-300 p-3 rounded-lg text-center bg-slate-50 print:bg-white">
              <div className="font-bold mb-2">تضمین کننده دوم</div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
              <div className="flex flex-col gap-2">
                <div>امضاء تضمین کننده: __________________</div>
                <div>شصت تضمین کننده: __________________</div>
              </div>
            </div>

            <div className="border border-slate-300 p-3 rounded-lg text-center bg-slate-50 print:bg-white">
              <div className="font-bold mb-2">تضمین کننده سوم</div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
              <div className="flex flex-col gap-2">
                <div>امضاء تضمین کننده: __________________</div>
                <div>شصت تضمین کننده: __________________</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-xs font-bold border-t border-slate-200 pt-4">
            <div>
              تاریخ: 
              <EditableField isEditMode={isEditMode}
                value={formData.formDate}
                onChange={(val) => setFormData({ ...formData, formDate: val })}
                className="inline-block mx-2 text-center font-mono w-32"
              />
            </div>
            <div>
              امضاء و مهر کارمند مسئول: ______________________
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
