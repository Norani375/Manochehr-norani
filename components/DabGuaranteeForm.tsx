'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserCheck, Building, FileText, CheckCircle2, Printer, RotateCcw, Save, ShieldAlert, Image as ImageIcon, Download } from 'lucide-react';

export interface Guarantor {
  id: number;
  name: string;
  fatherName: string;
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
    businessAddress: 'ولایت کندز، مارکیت مهمند، منزل دوم، دکان نمبر ۳۰۱',
  },
  shareholders: [
    { id: 1, name: 'برکت‌الله', fatherName: 'عبدالغفور', tazkiraNo: '55522' },
  ],
  formDate: new Date().toISOString().split('T')[0],
};

interface EditableFieldProps {
  isEditMode: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const EditableField = ({ isEditMode, value, onChange, placeholder, className = "" }: EditableFieldProps) => {
  if (isEditMode) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs ${className}`}
      />
    );
  }
  return <span className={`inline-block py-1 font-bold text-blue-900 border-b border-transparent ${className}`}>{value || '---'}</span>;
};

export default function DabGuaranteeForm({ isEditMode: initialEditMode = true, customLogo: propLogo, onOpenLogoModal, onExportPdf , companyId = "default"}: { isEditMode?: boolean; customLogo?: string | null; onOpenLogoModal?: () => void; onExportPdf?: () => void ; companyId?: string } = {}) {
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
      <div id="dab-official-form" className="bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Header Section */}
        <div className="relative text-center mb-6 pb-4 border-b-2 border-slate-900">
          {/* Central Official DAB Emblem matching PDF */}
          <div className="flex flex-col items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-blue-900 text-amber-400 border-4 border-amber-400 flex flex-col items-center justify-center shadow-md relative mx-auto">
              <Building className="w-9 h-9 text-amber-400 mb-0.5" />
              <div className="text-[8px] font-black tracking-tighter text-amber-300">د افغانستان بانک</div>
              <div className="text-[7px] text-white">1939</div>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2 mb-1">د افغانستان بانک</h1>
            <h2 className="text-base font-extrabold text-slate-800 mb-1">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</h2>
            <h3 className="text-sm font-bold text-slate-700 mb-3">مدیریت جوازدهی</h3>
          </div>

          <div className="inline-block bg-slate-100 border border-slate-400 font-extrabold text-slate-900 px-6 py-2 rounded-lg text-base">
            فورم تضمین سر سهمدار / سهمداران شرکت صرافی و خدمات پولی
          </div>
        </div>

        {/* Section 1: Guarantors Details */}
        <div className="mb-8">
          <div className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-t-lg text-sm mb-4">
            بخش اول: شهرت تضمین کنندگان
          </div>
          <p className="text-xs text-slate-600 mb-4 font-semibold">
            * تمامی سهمداران شرکت تضمین کننده نیاز است تا از سهمدار شرکت صرافی و خدمات پولی، تضمین نمایند.
          </p>

          {/* 3 Guarantors Tables matching PDF exactly */}
          <div className="space-y-8">
            {formData.guarantors.map((guarantor, idx) => (
              <div key={guarantor.id} className="border border-slate-900 rounded-lg overflow-hidden bg-white text-xs">
                <div className="bg-slate-900 text-white font-bold px-3 py-1.5 text-xs">
                  {idx === 0 ? '۱. شهرت سهامدار اول شرکت تضمین‌کننده:' : idx === 1 ? '۲. شهرت سهامدار دوم شرکت تضمین‌کننده:' : '۳. شهرت سهامدار سوم شرکت تضمین‌کننده:'}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold text-center">
                        <th className="border border-slate-900 p-2 w-[35%]">اسم و محل فعالیت تشبث</th>
                        <th className="border border-slate-900 p-2 w-[22%]">سکونت اصلی</th>
                        <th className="border border-slate-900 p-2 w-[22%]">سکونت فعلی</th>
                        <th className="border border-slate-900 p-2 w-[21%] bg-slate-50" rowSpan={7}>
                          <div className="h-full min-h-[160px] border-2 border-dashed border-slate-400 bg-white rounded flex flex-col items-center justify-center text-center p-2 text-slate-500">
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                            <span className="text-[10px] leading-tight font-bold">
                              عکس تضمین‌کننده در اینجا نصب و با مهر تضمین‌کننده تاپه گردد.
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-16 text-slate-700">اسم:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.name} onChange={(val) => updateGuarantor(idx, 'name', val)} className="font-bold" />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ولایت:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.province} onChange={(val) => updateGuarantor(idx, 'province', val)} />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ولایت:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.currentProvince} onChange={(val) => updateGuarantor(idx, 'currentProvince', val)} />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-16 text-slate-700">ولد:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.fatherName} onChange={(val) => updateGuarantor(idx, 'fatherName', val)} />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ولسوالی:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.district} onChange={(val) => updateGuarantor(idx, 'district', val)} />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ولسوالی:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.currentDistrict} onChange={(val) => updateGuarantor(idx, 'currentDistrict', val)} />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-16 text-slate-700">ولدیت:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.businessNameLocation} onChange={(val) => updateGuarantor(idx, 'businessNameLocation', val)} placeholder="نام و محل کسب..." />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ناحیه:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.nahia} onChange={(val) => updateGuarantor(idx, 'nahia', val)} />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">ناحیه:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.currentNahia} onChange={(val) => updateGuarantor(idx, 'currentNahia', val)} />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-16 text-slate-700">نمبر تذکره:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.tazkiraNo} onChange={(val) => updateGuarantor(idx, 'tazkiraNo', val)} className="font-mono" />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">قریه:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.village} onChange={(val) => updateGuarantor(idx, 'village', val)} />
                          </div>
                        </td>
                        <td className="border border-slate-900 p-1.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-14 text-slate-700">قریه:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.currentVillage} onChange={(val) => updateGuarantor(idx, 'currentVillage', val)} />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle" colSpan={3}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-24 text-slate-700">شماره تماس:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.phoneNo} onChange={(val) => updateGuarantor(idx, 'phoneNo', val)} className="font-mono" />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1.5 align-middle" colSpan={3}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-24 text-slate-700">ایمیل آدرس:</span>
                            <EditableField isEditMode={isEditMode} value={guarantor.email} onChange={(val) => updateGuarantor(idx, 'email', val)} placeholder="email@example.com" className="font-mono" />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

        <div className="pt-8 mt-6 border-t border-slate-300 flex items-end justify-between px-6">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-slate-400 text-[9px] font-bold p-2 text-center">
              <span>محل مهر رسمی شرکت</span>
            </div>
          </div>

          <div className="text-center space-y-1.5 min-w-[200px]">
            <div className="font-bold text-slate-700 text-xs">با احترام؛</div>
            <div className="font-black text-sm text-slate-950">برکت‌الله ولد عبدالغفور</div>
            <div className="text-xs font-bold text-blue-900">رئیس شرکت صرافی و خدمات پولی برکت‌الله غفوری</div>
            <div className="pt-6 font-bold text-slate-600 text-[10px] border-t border-slate-300 mt-2">
              امضاء و شصت
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
