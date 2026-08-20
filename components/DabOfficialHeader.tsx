'use client';

import React, { useState } from 'react';
import { Edit3, Check, RotateCcw } from 'lucide-react';

export interface DabOfficialHeaderProps {
  bankName?: string;
  department?: string;
  directorate?: string;
  formTitle?: string;
  formNumber?: string;
  companyName?: string;
  licenseNo?: string;
  logoUrl?: string | null;
  isEditable?: boolean;
  onHeaderChange?: (headerData: {
    bankName: string;
    department: string;
    directorate: string;
    formTitle: string;
    formNumber: string;
  }) => void;
  onOpenLogoModal?: () => void;
  className?: string;
}

export default function DabOfficialHeader({
  bankName: initialBankName = 'د افغانستان بانک',
  department: initialDepartment = 'آمریت عمومی نظارت از مؤسسات مالی غیر بانکی',
  directorate: initialDirectorate = 'مدیریت جوازدهی صرافی‌ها و خدمات پولی',
  formTitle: initialFormTitle = '',
  formNumber: initialFormNumber = '',
  companyName,
  licenseNo,
  logoUrl,
  isEditable = true,
  onHeaderChange,
  onOpenLogoModal,
  className = '',
}: DabOfficialHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bankName, setBankName] = useState(initialBankName);
  const [department, setDepartment] = useState(initialDepartment);
  const [directorate, setDirectorate] = useState(initialDirectorate);
  const [formTitle, setFormTitle] = useState(initialFormTitle);
  const [formNumber, setFormNumber] = useState(initialFormNumber);

  const handleSave = () => {
    setIsEditing(false);
    if (onHeaderChange) {
      onHeaderChange({
        bankName,
        department,
        directorate,
        formTitle,
        formNumber,
      });
    }
  };

  const handleReset = () => {
    setBankName(initialBankName);
    setDepartment(initialDepartment);
    setDirectorate(initialDirectorate);
    setFormTitle(initialFormTitle);
    setFormNumber(initialFormNumber);
  };

  return (
    <header
      className={`dab-official-header relative text-center mb-6 pb-4 border-b-2 border-slate-900 ${className}`}
      dir="rtl"
      aria-label="سربرگ رسمی د افغانستان بانک"
    >
      {/* Edit Header Control Button (Hidden in Print) */}
      {isEditable && (
        <div className="flex justify-end mb-2 print:hidden">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
                title="بازنشانی سربرگ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                بازنشانی
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                تأیید ویرایش سربرگ
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 font-bold px-3 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              ویرایش سربرگ
            </button>
          )}
        </div>
      )}

      {/* Centered Logo if available */}
      {logoUrl && (
        <div className="flex flex-col items-center justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="لوگوی شرکت"
            className="w-20 h-20 object-contain border border-slate-200 rounded-2xl p-1 bg-white shadow-xs mx-auto"
          />
          {onOpenLogoModal && (
            <button
              type="button"
              onClick={onOpenLogoModal}
              className="text-[11px] text-blue-700 hover:underline font-bold print:hidden cursor-pointer mt-1"
            >
              تغییر لوگو
            </button>
          )}
        </div>
      )}

      {/* Editing Form Fields */}
      {isEditing ? (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-4 text-right print:hidden space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نام نهاد / بانک مرکزی</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">آمریت عمومی</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدیریت مربوطه</label>
              <input
                type="text"
                value={directorate}
                onChange={(e) => setDirectorate(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>
          {formTitle !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان اصلی فورم</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره یا نوع فورم</label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Official DAB Header Typography - Clean Persian without English */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-black text-slate-900 mb-1 leading-snug">{bankName}</h1>
        <h2 className="text-base font-extrabold text-slate-800 mb-1 leading-snug">{department}</h2>
        <h3 className="text-sm font-bold text-slate-700 mb-1">{directorate}</h3>
      </div>

      {formTitle && (
        <div className="mt-3">
          <div className="inline-block bg-slate-100 border-2 border-slate-800 font-black text-slate-950 px-6 py-2 rounded-xl text-base shadow-xs">
            {formNumber ? `${formNumber} — ${formTitle}` : formTitle}
          </div>
        </div>
      )}

      {(companyName || licenseNo) && (
        <div className="mt-3 text-xs font-bold text-slate-700 flex flex-wrap justify-center gap-4 border-t border-slate-200 pt-2">
          {companyName && <span>نام شرکت: <strong className="text-blue-900">{companyName}</strong></span>}
          {licenseNo && <span>شماره جواز: <strong className="font-mono text-slate-900">{licenseNo}</strong></span>}
        </div>
      )}
    </header>
  );
}
