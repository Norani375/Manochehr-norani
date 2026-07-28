'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Building, FileText, CheckCircle2, Printer, RotateCcw, Save, ShieldAlert, Image as ImageIcon, Download } from 'lucide-react';

export interface Guarantor {
  id: number;
  name: string;
  fatherName: string;
  tazkiraNo: string;
  phoneNo: string;
  province: string;
  district: string;
  nahia: string;
  village: string;
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
  companyName: 'برکت‌الله غفوری',
  provinceName: 'کابل',
  guarantors: [
    {
      id: 1,
      name: '',
      fatherName: '',
      tazkiraNo: '',
      phoneNo: '',
      province: '',
      district: '',
      nahia: '',
      village: '',
      businessNameLocation: '',
    },
    {
      id: 2,
      name: '',
      fatherName: '',
      tazkiraNo: '',
      phoneNo: '',
      province: '',
      district: '',
      nahia: '',
      village: '',
      businessNameLocation: '',
    },
    {
      id: 3,
      name: '',
      fatherName: '',
      tazkiraNo: '',
      phoneNo: '',
      province: '',
      district: '',
      nahia: '',
      village: '',
      businessNameLocation: '',
    },
  ],
  guarantorCompany: {
    businessName: '',
    activityType: '',
    licenseNo: '',
    companyPhone: '',
    expiryDate: '',
    email: '',
    issuingAuthority: '',
    businessAddress: '',
  },
  shareholders: [
    { id: 1, name: 'برکت‌الله', fatherName: 'عبدالغفور', tazkiraNo: '55522' },
    { id: 2, name: 'خالد احمد مؤمند', fatherName: 'ولی محمد', tazkiraNo: '1399-1204-71680' },
    { id: 3, name: 'محمد داود مؤمند', fatherName: 'ولی محمد', tazkiraNo: '1399-1204-69208' },
  ],
  formDate: new Date().toISOString().split('T')[0],
};

export default function DabGuaranteeForm({ customLogo: propLogo, onOpenLogoModal, onExportPdf }: { customLogo?: string | null; onOpenLogoModal?: () => void; onExportPdf?: () => void } = {}) {
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuaranteeFormData>(DEFAULT_FORM_DATA);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLogo(localStorage.getItem('custom_company_logo'));
      try {
        const saved = localStorage.getItem('dab_guarantee_form_data');
        if (saved) setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load DAB guarantee form from storage', e);
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
      localStorage.setItem('dab_guarantee_form_data', JSON.stringify(formData));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save DAB form', e);
    }
  };

  const handleReset = () => {
    if (confirm('آیا اطمینان دارید که می‌خواهید تمام مقادیر این فورم به حالت اولیه بازگردد؟')) {
      setFormData(DEFAULT_FORM_DATA);
      localStorage.removeItem('dab_guarantee_form_data');
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

      {/* Official Form Printable Canvas */}
      <div id="dab-official-form" className="bg-white p-6 sm:p-10 border border-slate-300 rounded-2xl shadow-sm text-sm print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Header Section */}
        <div className="relative text-center mb-6 pb-4 border-b-2 border-slate-900">
          {customLogo && (
            <div className="absolute right-0 top-0 hidden sm:block print:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customLogo}
                alt="Company Logo"
                className="w-20 h-20 object-contain border border-slate-300 rounded-xl p-1 bg-white shadow-xs"
              />
            </div>
          )}
          <h1 className="text-lg font-extrabold text-slate-900 mb-1">د افغانستان بانک</h1>
          <h2 className="text-base font-bold text-slate-800 mb-1">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</h2>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">مدیریت جوازدهی</h3>
          <div className="inline-block bg-slate-100 border border-slate-400 font-extrabold text-slate-900 px-6 py-2 rounded-lg text-base mt-1">
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

          {/* 3 Guarantors Grid */}
          <div className="space-y-6">
            {formData.guarantors.map((guarantor, idx) => (
              <div key={guarantor.id} className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 print:bg-white print:p-2">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  
                  {/* Photo & Stamp box */}
                  <div className="w-32 h-40 border-2 border-dashed border-slate-400 bg-white rounded-lg flex flex-col items-center justify-center text-center p-2 text-slate-400 shrink-0 print:w-28 print:h-36">
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                    <span className="text-[10px] leading-snug">
                      عکس تضمین کننده در اینجا نصب و با مهر تاپه گردد
                    </span>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-xs">
                    <div className="col-span-full font-bold text-blue-900 text-sm border-b pb-1 mb-1 flex items-center justify-between">
                      <span>تضمین کننده {idx === 0 ? 'اول' : idx === 1 ? 'دوم' : 'سوم'}</span>
                    </div>

                    <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم و محل فعالیت تشبث تضمین کننده:</label>
                        <input
                          type="text"
                          value={guarantor.businessNameLocation}
                          onChange={(e) => updateGuarantor(idx, 'businessNameLocation', e.target.value)}
                          placeholder="نام و محل کسب ضامن..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">سکونت فعلی (ولایت/ولسوالی):</label>
                        <input
                          type="text"
                          value={guarantor.province}
                          onChange={(e) => updateGuarantor(idx, 'province', e.target.value)}
                          placeholder="ولایت / ولسوالی سکونت..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم:</label>
                      <input
                        type="text"
                        value={guarantor.name}
                        onChange={(e) => updateGuarantor(idx, 'name', e.target.value)}
                        placeholder="اسم ضامن..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ولایت:</label>
                      <input
                        type="text"
                        value={guarantor.province}
                        onChange={(e) => updateGuarantor(idx, 'province', e.target.value)}
                        placeholder="ولایت..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ولد:</label>
                      <input
                        type="text"
                        value={guarantor.fatherName}
                        onChange={(e) => updateGuarantor(idx, 'fatherName', e.target.value)}
                        placeholder="نام پدر..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ولسوالی:</label>
                      <input
                        type="text"
                        value={guarantor.district}
                        onChange={(e) => updateGuarantor(idx, 'district', e.target.value)}
                        placeholder="ولسوالی..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">نمبر تذکره:</label>
                      <input
                        type="text"
                        value={guarantor.tazkiraNo}
                        onChange={(e) => updateGuarantor(idx, 'tazkiraNo', e.target.value)}
                        placeholder="نمبر تذکره..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ناحیه / قریه:</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={guarantor.nahia}
                          onChange={(e) => updateGuarantor(idx, 'nahia', e.target.value)}
                          placeholder="ناحیه..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={guarantor.village}
                          onChange={(e) => updateGuarantor(idx, 'village', e.target.value)}
                          placeholder="قریه..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره تماس:</label>
                      <input
                        type="text"
                        value={guarantor.phoneNo}
                        onChange={(e) => updateGuarantor(idx, 'phoneNo', e.target.value)}
                        placeholder="07xxxxxxxx"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                      />
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
                <input
                  type="text"
                  value={formData.guarantorCompany.businessName}
                  onChange={(e) => updateGuarantorCompany('businessName', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white"
                  placeholder="اسم شرکت ضامن..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">نوع فعالیت:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.activityType}
                  onChange={(e) => updateGuarantorCompany('activityType', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white"
                  placeholder="نوع فعالیت..."
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">نمبر جواز:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.licenseNo}
                  onChange={(e) => updateGuarantorCompany('licenseNo', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white font-mono"
                  placeholder="شماره جواز..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">شماره تماس شرکت:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.companyPhone}
                  onChange={(e) => updateGuarantorCompany('companyPhone', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white font-mono"
                  placeholder="شماره تماس..."
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">تاریخ اعتبار:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.expiryDate}
                  onChange={(e) => updateGuarantorCompany('expiryDate', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white"
                  placeholder="۱۴۰x/xx/xx"
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">ایمیل آدرس:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.email}
                  onChange={(e) => updateGuarantorCompany('email', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white font-mono"
                  placeholder="email@example.com"
                />
              </div>

              <div className="p-2 bg-slate-50 font-bold">اداره صادر کننده جواز:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.issuingAuthority}
                  onChange={(e) => updateGuarantorCompany('issuingAuthority', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white"
                  placeholder="وزارت صنعت و تجارت / ..."
                />
              </div>
              <div className="p-2 bg-slate-50 font-bold">آدرس تشبث:</div>
              <div className="p-1.5">
                <input
                  type="text"
                  value={formData.guarantorCompany.businessAddress}
                  onChange={(e) => updateGuarantorCompany('businessAddress', e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-white"
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
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="inline-block mx-2 px-2 py-0.5 border-b-2 border-slate-800 bg-white font-bold text-blue-900 text-center w-48 text-xs"
            />
            در ولایت 
            <input
              type="text"
              value={formData.provinceName}
              onChange={(e) => setFormData({ ...formData, provinceName: e.target.value })}
              className="inline-block mx-2 px-2 py-0.5 border-b-2 border-slate-800 bg-white font-bold text-blue-900 text-center w-32 text-xs"
            />
            اخذ/تمدید نماید، تضمین نموده و در صورت هر گونه تخلف و تخطی که از قوانین و مقررات نافذه کشور از آدرس شرکت صرافی و خدمات پولی ایشان انجام یابد، ایشان را در وقت معینه به مرجع مربوط یا د افغانستان بانک حاضر می‌نماییم و در اقرار خود صادق می‌باشیم.
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
                  <td className="border border-slate-300 p-2 font-bold">{sIdx + 1}</td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={shareholder.name}
                      onChange={(e) => updateShareholder(sIdx, 'name', e.target.value)}
                      className="w-full p-1 border rounded bg-white text-center font-bold"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={shareholder.fatherName}
                      onChange={(e) => updateShareholder(sIdx, 'fatherName', e.target.value)}
                      className="w-full p-1 border rounded bg-white text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={shareholder.tazkiraNo}
                      onChange={(e) => updateShareholder(sIdx, 'tazkiraNo', e.target.value)}
                      className="w-full p-1 border rounded bg-white text-center font-mono"
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
              تضمین کنندگان الی معرفی تضمین کننده جدید توسط سهمدار/سمهداران شرکت صرافی و خدمات پولی، منحیث تضمین کننده نزد د افغانستان بانک قرار میداشته باشند.
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
              <div>امضاء: __________________</div>
              <div className="mt-2">شصت: __________________</div>
            </div>

            <div className="border border-slate-300 p-3 rounded-lg text-center bg-slate-50 print:bg-white">
              <div className="font-bold mb-2">تضمین کننده دوم</div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
              <div>امضاء: __________________</div>
              <div className="mt-2">شصت: __________________</div>
            </div>

            <div className="border border-slate-300 p-3 rounded-lg text-center bg-slate-50 print:bg-white">
              <div className="font-bold mb-2">تضمین کننده سوم</div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
              <div>امضاء: __________________</div>
              <div className="mt-2">شصت: __________________</div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-xs font-bold border-t border-slate-200 pt-4">
            <div>
              تاریخ: 
              <input
                type="text"
                value={formData.formDate}
                onChange={(e) => setFormData({ ...formData, formDate: e.target.value })}
                className="inline-block mx-2 px-2 py-1 border rounded bg-white text-center font-mono w-32"
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
