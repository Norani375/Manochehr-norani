'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, RotateCcw, Save, Edit3, Plus, Trash2, 
  Check, Download, Building2, Stamp, Calendar, Hash, ShieldCheck, UserCheck, CheckSquare
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface IntroducedMember {
  id: number;
  name: string;
  fatherName?: string;
  tazkiraNo?: string;
  position: string;
}

export interface IntroducedPersonnelGroup {
  id: number;
  groupTitle: string;
  location?: string;
  members: IntroducedMember[];
}

export interface ProposalData {
  proposalNo: string;
  proposalDate: string;
  approvalStatusText: string;
  subject: string;
  boardMembers: { name: string; position: string }[];
  recipientTitle: string;
  companyName: string;
  licenseNo: string;
  companyAddress: string;
  expiryDate: string;
  bodyText: string;
  personnelIntroText: string;
  personnelGroups: IntroducedPersonnelGroup[];
  closingText: string;
  signatoryName: string;
  signatoryTitle: string;
}

const DEFAULT_PROPOSAL_DATA: ProposalData = {
  proposalNo: '۱۴۰۴/P-۱۰۷',
  proposalDate: '۱۴۰۴/۱۱/۰۱',
  approvalStatusText: 'متن پیشنهاد منظور است.',
  subject: 'موضوع: معرفی رئیس و اعضای هیئت نظار',
  boardMembers: [
    { name: 'خالد احمد مؤمند', position: 'سهم‌دار / هیئت مدیره' },
    { name: 'محمد داوود مومند', position: 'سهم‌دار / هیئت مدیره' },
    { name: 'عبدالله مؤمند', position: 'سهم‌دار / هیئت مدیره' },
  ],
  recipientTitle: 'به مقام محترم سهمداران شرکت!',
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  licenseNo: 'DAB/7-0787',
  companyAddress: 'مومند مارکیت، دوکان نمبر ۱۴۵',
  expiryDate: '۱۴۰۴/۱۱/۰۵',
  bodyText: 'محترما : شرکت صرافی و خدمات پولی برکت‌الله غفوری دارنده جواز نمبر DAB/7-0787 واقع مومند مارکیت دوکان نمبر ۱۴۵ که به تاریخ ۱۴۰۴/۱۱/۰۵ جواز فعالیت شرکت ختم میگردد و به منظور فعالیت و ادامه کار صرافی و خدمات پولی، رهبری شرکت تصمیم دارد رئیس و اعضای هیئت نظار را برای شما معرفی نمایند.',
  personnelIntroText: 'مشخصات اعضای محترم هیئت نظار معرفی‌شده به شرح ذیل می‌باشد:',
  personnelGroups: [
    {
      id: 1,
      groupTitle: 'فهرست اعضای هیئت نظار:',
      members: [
        { id: 1, name: 'عزیزالله ناصری', fatherName: 'غلام محی الدین', tazkiraNo: '79824-1101-1402', position: 'رئیس هیئت نظار' },
        { id: 2, name: 'محمد داود مؤمند', fatherName: 'ولی محمد', tazkiraNo: '69208-1204-1399', position: 'عضو هیئت نظار' },
        { id: 3, name: 'احمد رامین دستگیر', fatherName: 'غلام دستگیر', tazkiraNo: '21002-0300-1400', position: 'عضو هیئت نظار' },
      ]
    }
  ],
  closingText: 'غرض اجراآت بعدی به شما معرفی گردید.',
  signatoryName: 'عبدالله مؤمند',
  signatoryTitle: 'مدیر عملیاتی شرکت صرافی و خدمات پولی برکت‌الله غفوری'
};

interface CompanyProposalProps {
  customLogo?: string | null;
}

export default function CompanyProposal({ customLogo }: CompanyProposalProps) {
  const [data, setData] = useState<ProposalData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bg_company_proposal_v2');
        if (saved) return { ...DEFAULT_PROPOSAL_DATA, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROPOSAL_DATA;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'company_proposal_v2');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remote = snapshot.data();
          if (remote && remote.proposalData) {
            setData((prev) => ({ ...prev, ...remote.proposalData }));
          }
        }
      }, (err) => console.warn(err));
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('bg_company_proposal_v2', JSON.stringify(data));
      try {
        const docRef = doc(db, 'settings', 'company_proposal_v2');
        await setDoc(docRef, {
          proposalData: data,
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
    if (window.confirm('آیا از بازنشانی متن پیشنهاد به حالت اولیه اطمینان دارید؟')) {
      setData(DEFAULT_PROPOSAL_DATA);
      localStorage.removeItem('bg_company_proposal_v2');
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'company-proposal-canvas',
        filename: 'پیشنهاد_تمدید_جواز_برکت_الله_غفوری.pdf',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error(error);
      alert('خطا در دانلود فایل PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const updateMember = (gIdx: number, mIdx: number, field: keyof IntroducedMember, value: string) => {
    const updated = [...data.personnelGroups];
    updated[gIdx].members[mIdx] = { ...updated[gIdx].members[mIdx], [field]: value };
    setData({ ...data, personnelGroups: updated });
  };

  const addMember = (gIdx: number) => {
    const updated = [...data.personnelGroups];
    const newId = updated[gIdx].members.length + 1;
    updated[gIdx].members.push({ id: newId, name: 'نام کارمند', position: 'وظیفه' });
    setData({ ...data, personnelGroups: updated });
  };

  const removeMember = (gIdx: number, mIdx: number) => {
    const updated = [...data.personnelGroups];
    if (updated[gIdx].members.length <= 1) return;
    updated[gIdx].members.splice(mIdx, 1);
    setData({ ...data, personnelGroups: updated });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 dir-rtl">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">فرم پیشنهاد رسمی تمدید جواز (به هیئت نظار)</h2>
            <p className="text-xs text-slate-500">تنظیم شده مطابق مشخصات شرکت صرافی و خدمات پولی برکت‌الله غفوری</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isEditMode
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? 'تکمیل ویرایش' : 'ویرایش متن پیشنهاد'}</span>
          </button>

          {isEditMode && (
            <button
              onClick={handleSave}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'ذخیره شد' : 'ذخیره'}</span>
            </button>
          )}

          <button
            onClick={handlePdfExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'در حال خروجی...' : 'دانلود PDF'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl"
            title="بازنشانی"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editing Form Panel */}
      {isEditMode && (
        <div className="bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 text-xs print:hidden">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 border-b border-amber-200 pb-2">
            <Edit3 className="w-4 h-4" />
            <span>فرم ویرایش متن پیشنهاد رسمی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1">شماره پیشنهاد:</label>
              <input
                type="text"
                value={data.proposalNo}
                onChange={(e) => setData({ ...data, proposalNo: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">تاریخ پیشنهاد:</label>
              <input
                type="text"
                value={data.proposalDate}
                onChange={(e) => setData({ ...data, proposalDate: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">متن احکام / منظور:</label>
              <input
                type="text"
                value={data.approvalStatusText}
                onChange={(e) => setData({ ...data, approvalStatusText: e.target.value })}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">متن اصلی درخواست تمدید (پیشنهاد):</label>
            <textarea
              rows={3}
              value={data.bodyText}
              onChange={(e) => setData({ ...data, bodyText: e.target.value })}
              className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg leading-relaxed"
            />
          </div>

          {/* Personnel & Branch Groups Editor */}
          <div className="space-y-3 pt-2">
            <label className="font-bold block text-slate-800 dark:text-slate-200">فهرست کارمندان و نمایندگی‌های معرفی‌شده:</label>
            {data.personnelGroups.map((group, gIdx) => (
              <div key={group.id} className="bg-white dark:bg-slate-900 p-3 border rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={group.groupTitle}
                    onChange={(e) => {
                      const updated = [...data.personnelGroups];
                      updated[gIdx].groupTitle = e.target.value;
                      setData({ ...data, personnelGroups: updated });
                    }}
                    className="flex-1 p-1.5 border rounded font-bold text-xs"
                  />
                  <button
                    onClick={() => addMember(gIdx)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                  >
                    + کارمند
                  </button>
                </div>

                <div className="space-y-1.5 pr-2 border-r-2 border-amber-400">
                  {group.members.map((m, mIdx) => (
                    <div key={mIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        value={m.name}
                        placeholder="نام"
                        onChange={(e) => updateMember(gIdx, mIdx, 'name', e.target.value)}
                        className="p-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={m.fatherName || ''}
                        placeholder="ولد"
                        onChange={(e) => updateMember(gIdx, mIdx, 'fatherName', e.target.value)}
                        className="p-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={m.tazkiraNo || ''}
                        placeholder="نمبر تذکره"
                        onChange={(e) => updateMember(gIdx, mIdx, 'tazkiraNo', e.target.value)}
                        className="p-1 border rounded text-xs font-mono"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={m.position}
                          placeholder="سمت"
                          onChange={(e) => updateMember(gIdx, mIdx, 'position', e.target.value)}
                          className="flex-1 p-1 border rounded text-xs"
                        />
                        <button
                          onClick={() => removeMember(gIdx, mIdx)}
                          className="p-1 text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A4 Printable Proposal Document */}
      <div 
        id="company-proposal-canvas"
        className="bg-white text-slate-950 p-6 sm:p-12 border border-slate-300 rounded-2xl shadow-xl text-xs sm:text-sm print:shadow-none print:border-none print:p-0 print:m-0 font-sans leading-relaxed dir-rtl"
      >
        {/* Header Table Layout matching Afghan Official Proposal Standard */}
        <div className="border-2 border-slate-900 mb-6">
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-900 border-b-2 border-slate-900">
            {/* Column 1: احکام (Right Side) */}
            <div className="p-4 bg-slate-50 flex flex-col justify-between space-y-4">
              <div className="text-center font-black text-sm sm:text-base border-b-2 border-slate-900 pb-2 bg-slate-200">
                احکام
              </div>

              <div className="my-3 text-center">
                <div className="inline-block border-2 border-emerald-700 bg-emerald-50 text-emerald-950 font-black px-4 py-1.5 rounded-lg text-xs sm:text-sm shadow-xs">
                  {data.approvalStatusText}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="font-bold text-[11px] text-slate-700">امضای اعضای هیئت نظار:</p>
                {data.boardMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-dashed border-slate-300 pb-1.5">
                    <span>{idx + 1}- {member.name}</span>
                    <span className="text-slate-400 font-normal">امضاء</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: پیشنهاد (Left Side) */}
            <div className="p-4 flex flex-col justify-between space-y-3">
              <div className="text-center font-black text-sm sm:text-base border-b-2 border-slate-900 pb-2 bg-slate-200">
                پیشنهاد
              </div>

              <div className="text-center space-y-1">
                {customLogo ? (
                  <img src={customLogo} alt="Logo" className="w-12 h-12 mx-auto object-contain" />
                ) : (
                  <div className="w-10 h-10 mx-auto rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ب.غ
                  </div>
                )}
                <h1 className="font-black text-xs sm:text-sm text-slate-950">{data.companyName}</h1>
                <p className="text-[11px] font-bold text-slate-700">جواز: {data.licenseNo}</p>
                <p className="text-[10px] text-slate-600">{data.companyAddress}</p>
              </div>

              <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-300 pt-2 text-slate-800">
                <span>شماره پیشنهاد: <strong className="font-mono text-blue-900">{data.proposalNo}</strong></span>
                <span>تاریخ: <strong>{data.proposalDate}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Title & Subject Header */}
        <div className="mb-5 border-b border-slate-300 pb-3 space-y-1.5">
          <h2 className="text-base sm:text-lg font-black text-slate-950">
            {data.recipientTitle}
          </h2>
          {data.subject && (
            <div className="inline-block bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm px-3 py-1 rounded-md">
              {data.subject}
            </div>
          )}
        </div>

        {/* Proposal Main Paragraphs */}
        <div className="space-y-3 text-slate-900 leading-relaxed text-justify font-semibold text-xs sm:text-sm">
          <p className="whitespace-pre-line text-justify leading-7">
            {data.bodyText}
          </p>
          <p className="whitespace-pre-line font-bold pt-1 text-slate-950">
            {data.personnelIntroText}
          </p>
        </div>

        {/* Introduced Personnel / Members List (Minimalist Clean Table Format) */}
        <div className="space-y-4 my-6">
          {data.personnelGroups.map((group) => (
            <div key={group.id} className="border border-slate-300 rounded-lg overflow-hidden">
              {group.groupTitle && (
                <div className="bg-slate-100 px-4 py-2 font-black text-xs sm:text-sm text-slate-950 border-b border-slate-300 flex items-center justify-between">
                  <span>{group.groupTitle}</span>
                  {group.location && <span className="text-[11px] font-normal text-slate-600">{group.location}</span>}
                </div>
              )}

              <table className="w-full text-right border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 w-10 text-center border-l border-slate-200">#</th>
                    <th className="p-2.5 border-l border-slate-200">نام و تخلص</th>
                    <th className="p-2.5 border-l border-slate-200">ولد</th>
                    <th className="p-2.5 border-l border-slate-200 font-mono">نمبر تذکره</th>
                    <th className="p-2.5">سمت پیشنهادی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {group.members.map((m, mIdx) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-500 border-l border-slate-200">{mIdx + 1}</td>
                      <td className="p-2.5 font-extrabold text-slate-950 border-l border-slate-200">{m.name}</td>
                      <td className="p-2.5 font-semibold text-slate-800 border-l border-slate-200">{m.fatherName || '-'}</td>
                      <td className="p-2.5 font-mono text-xs text-slate-700 border-l border-slate-200">{m.tazkiraNo || '-'}</td>
                      <td className="p-2.5 font-bold text-blue-900 bg-blue-50/30">{m.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Closing */}
        <p className="font-bold text-xs sm:text-sm text-slate-900 mt-4">
          {data.closingText}
        </p>

        {/* Official Signatory Section */}
        <div className="pt-8 mt-6 border-t border-slate-300 flex items-end justify-between px-4">
          <div className="text-center">
            <div className="w-24 h-24 border border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
              <span>محل مهر شرکت</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="font-bold text-xs text-slate-700">با احترام؛</p>
            <p className="font-black text-sm sm:text-base text-slate-950">{data.signatoryName}</p>
            <p className="text-xs font-bold text-blue-900">{data.signatoryTitle}</p>
            <div className="pt-6 font-bold text-slate-500 text-xs border-t border-slate-300 mt-3 min-w-[140px]">
              امضاء و شصت
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between items-center">
          <span>{data.companyName}</span>
          <span>فرم رسمی پیشنهاد به سهم‌داران / هیئت نظار</span>
          <span>جواز {data.licenseNo}</span>
        </div>
      </div>
    </div>
  );
}
