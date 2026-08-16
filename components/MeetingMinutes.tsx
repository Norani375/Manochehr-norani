'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, RotateCcw, Save, Edit3, Plus, Trash2, 
  Check, Download, Building2, Users, Calendar, Clock, MapPin, 
  UserCheck, ClipboardList, CheckSquare
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface Participant {
  id: number;
  name: string;
  position: string;
  idNo: string;
}

export interface MeetingAgendaItem {
  id: number;
  text: string;
}

export interface MeetingDecision {
  id: number;
  text: string;
}

export interface MeetingMinutesData {
  meetingNo: string;
  meetingDate: string;
  location: string;
  heldDate: string;
  heldTime: string;
  companyName: string;
  licenseNo: string;
  companyAddress: string;
  participants: Participant[];
  agenda: MeetingAgendaItem[];
  decisions: MeetingDecision[];
  closingStatement: string;
}

const DEFAULT_MEETING_DATA: MeetingMinutesData = {
  meetingNo: '۱۴۰۵/MM-۱۰۱',
  meetingDate: '۱۴۰۵/۰۲/۱۵',
  location: 'مومند مارکیت، منزل دوم، دکان ۳۰۱، ولایت کندز',
  heldDate: '۱۴۰۵/۰۲/۱۵',
  heldTime: '۱۰:۰۰ قبل از ظهر',
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری (سهامی خاص)',
  licenseNo: 'DAB/7-0965',
  companyAddress: 'ولایت کندز، مومند مارکیت، منزل دوم، دکان نمبر ۳۰۱',
  participants: [
    { id: 1, name: 'برکت‌الله ولد عبدالغفور', position: 'سهامدار و رئیس هیئت مدیره', idNo: '۵۵۵۲۲-۱۱۰۴-۱۰۰۱۳۹۹' },
    { id: 2, name: 'بسم‌الله شیرزی', position: 'رئیس هیئت نظار', idNo: '۴۵۱۸۸' },
    { id: 3, name: 'برکت‌الله غفوری', position: 'عضو هیئت نظار', idNo: '۵۵۵۲۲-۱۱۰۴-۱۰۰۱۳۹۹' },
    { id: 4, name: 'عظیم‌الله رحمانی', position: 'عضو هیئت نظار', idNo: '۳۵۸۰۶' },
  ],
  agenda: [
    { id: 1, text: 'بررسی گزارش بیلان مالی سالانه و عملکرد سود و زیان شرکت.' },
    { id: 2, text: 'تصمیم‌گیری در مورد تمدید جواز فعالیت مرکزی و نمایندگی‌های تابعه.' },
    { id: 3, text: 'ارزیابی رعایت قوانین مبارزه با تطهیر پول و عواید ناشی از جرایم (AML/CFT).' },
    { id: 4, text: 'تعیین مسئول پیگیری اسناد رسمی در آمریت ساحوی د افغانستان بانک.' },
  ],
  decisions: [
    { id: 1, text: 'تمدید جواز فعالیت شرکت و کلیه نمایندگی‌ها برای دوره جدید به اتفاق آراء تصویب گردید.' },
    { id: 2, text: 'گزارش مالی سال گذشته مورد تأیید مجمع قرار گرفت.' },
    { id: 3, text: 'صالح‌محمد به عنوان مسئول عملیاتی جهت طی مراحل تمدید جواز در DAB توظیف گردید.' },
  ],
  closingStatement: 'جلسه در فضای تفاهم کامل و با رعایت تمامی معیارهای قانونی خاتمه یافت و این صورتجلسه در حضور تمامی اشتراک‌کنندگان قرائت و جهت طی مراحل بعدی به امضا و مهر رسمی رسید.'
};

interface MeetingMinutesProps {
  companyId?: string;
  isEditMode?: boolean;
  customLogo?: string | null;
  onOpenLogoModal?: () => void;
  onExportPdf?: () => void;
}

export default function MeetingMinutes({ isEditMode = true, customLogo, onOpenLogoModal, onExportPdf , companyId = "default" }: MeetingMinutesProps) {
  const [data, setData] = useState<MeetingMinutesData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_meeting_minutes_v1_${companyId}`);
        if (saved) return { ...DEFAULT_MEETING_DATA, ...JSON.parse(saved) };
      } catch (e) { console.error(e); }
    }
    return DEFAULT_MEETING_DATA;
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bg_meeting_minutes_v1_${companyId}`);
        if (saved) {
          setData({ ...DEFAULT_MEETING_DATA, ...JSON.parse(saved) });
        } else {
          setData(DEFAULT_MEETING_DATA);
        }
      } catch (e) { console.error(e); }
    }
    try {
      const docRef = doc(db, 'settings', `meeting_minutes_v1_${companyId}`);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData?.meetingData) setData(prev => ({ ...prev, ...remoteData.meetingData }));
        }
      });
      return () => unsubscribe();
    } catch (e) { console.warn(e); }
  }, [companyId]);

  const handleSave = async () => {
    try {
      localStorage.setItem(`bg_meeting_minutes_v1_${companyId}`, JSON.stringify(data));
      const docRef = doc(db, 'settings', `meeting_minutes_v1_${companyId}`);
      await setDoc(docRef, { meetingData: data, updatedAt: new Date().toISOString() }, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const handleReset = () => {
    if (confirm('آیا از بازنشانی صورتجلسه اطمینان دارید؟')) {
      setData(DEFAULT_MEETING_DATA);
      localStorage.removeItem(`bg_meeting_minutes_v1_${companyId}`);
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'meeting-minutes-canvas',
        filename: 'صورتجلسه_مجمع_عمومی_برکت_الله_غفوری.pdf',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // List Management
  const addParticipant = () => setData({ ...data, participants: [...data.participants, { id: Date.now(), name: '', position: '', idNo: '' }] });
  const removeParticipant = (id: number) => setData({ ...data, participants: data.participants.filter(p => p.id !== id) });
  
  const addAgenda = () => setData({ ...data, agenda: [...data.agenda, { id: Date.now(), text: '' }] });
  const removeAgenda = (id: number) => setData({ ...data, agenda: data.agenda.filter(a => a.id !== id) });

  const addDecision = () => setData({ ...data, decisions: [...data.decisions, { id: Date.now(), text: '' }] });
  const removeDecision = (id: number) => setData({ ...data, decisions: data.decisions.filter(d => d.id !== id) });

  return (
    <div className="space-y-6 dir-rtl">
      {/* Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">مدیریت صورتجلسات رسمی</h2>
            <p className="text-[10px] text-slate-500">تنظیم و چاپ صورتجلسات مجمع عمومی و هیئت مدیره</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditMode && (
            <button onClick={handleSave} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaved ? 'ذخیره شد' : 'ذخیره'}
            </button>
          )}
          {isEditMode && (
            <button onClick={handleReset} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl" title="بازنشانی">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button onClick={handlePdfExport} disabled={isExporting} className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> {isExporting ? 'صبر کنید...' : 'دانلود PDF'}
          </button>
          <button onClick={() => window.print()} className="p-2 bg-slate-800 text-white rounded-xl" title="چاپ"><Printer className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Editor */}
      {isEditMode && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm print:hidden animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-bold mb-1">شماره صورتجلسه:</label><input className="w-full p-2 border rounded-xl text-xs" value={data.meetingNo} onChange={e => setData({...data, meetingNo: e.target.value})} /></div>
            <div><label className="block text-xs font-bold mb-1">تاریخ تنظیم:</label><input className="w-full p-2 border rounded-xl text-xs" value={data.meetingDate} onChange={e => setData({...data, meetingDate: e.target.value})} /></div>
            <div><label className="block text-xs font-bold mb-1">ساعت برگزاری:</label><input className="w-full p-2 border rounded-xl text-xs" value={data.heldTime} onChange={e => setData({...data, heldTime: e.target.value})} /></div>
          </div>
          <div><label className="block text-xs font-bold mb-1">محل برگزاری:</label><input className="w-full p-2 border rounded-xl text-xs" value={data.location} onChange={e => setData({...data, location: e.target.value})} /></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black">اشتراک‌کنندگان</h3><button onClick={addParticipant} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Plus className="w-4 h-4" /></button></div>
            {data.participants.map((p, i) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <input className="p-2 border rounded-lg text-xs" placeholder="نام" value={p.name} onChange={e => {
                  const updated = [...data.participants];
                  updated[i].name = e.target.value;
                  setData({ ...data, participants: updated });
                }} />
                <input className="p-2 border rounded-lg text-xs" placeholder="سمت" value={p.position} onChange={e => {
                  const updated = [...data.participants];
                  updated[i].position = e.target.value;
                  setData({ ...data, participants: updated });
                }} />
                <input className="p-2 border rounded-lg text-xs" placeholder="تذکره" value={p.idNo} onChange={e => {
                  const updated = [...data.participants];
                  updated[i].idNo = e.target.value;
                  setData({ ...data, participants: updated });
                }} />
                <button onClick={() => removeParticipant(p.id)} className="p-2 text-rose-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-sm font-black">موضوعات جلسه</h3><button onClick={addAgenda} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Plus className="w-4 h-4" /></button></div>
              {data.agenda.map((a, i) => (
                <div key={a.id} className="flex gap-2">
                  <input className="flex-1 p-2 border rounded-lg text-xs" value={a.text} onChange={e => {
                    const updated = [...data.agenda];
                    updated[i].text = e.target.value;
                    setData({ ...data, agenda: updated });
                  }} />
                  <button onClick={() => removeAgenda(a.id)} className="p-2 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-sm font-black">تصامیم اتخاذشده</h3><button onClick={addDecision} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Plus className="w-4 h-4" /></button></div>
              {data.decisions.map((d, i) => (
                <div key={d.id} className="flex gap-2">
                  <input className="flex-1 p-2 border rounded-lg text-xs" value={d.text} onChange={e => {
                    const updated = [...data.decisions];
                    updated[i].text = e.target.value;
                    setData({ ...data, decisions: updated });
                  }} />
                  <button onClick={() => removeDecision(d.id)} className="p-2 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official Document Canvas */}
      <div 
        id="meeting-minutes-canvas"
        className="bg-white text-slate-950 p-8 sm:p-12 border border-slate-200 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 font-sans leading-relaxed"
      >
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center">
          {/* Centered Logo */}
          <div className="flex flex-col items-center justify-center mb-3">
            {customLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={customLogo} alt="Logo" className="w-20 h-20 object-contain rounded-2xl border-2 border-slate-300 p-1 shadow-md bg-white" />
            ) : (
              <div className="w-16 h-16 bg-blue-950 text-amber-400 rounded-2xl flex items-center justify-center border-2 border-amber-400/60 shadow-md">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-xl font-black text-slate-900">صورتجلسه مجمع عمومی عادی سالانه</h1>
            <div className="text-xs font-bold text-slate-700">شرکت صرافی و خدمات پولی برکت‌الله غفوری (جواز: {data.licenseNo})</div>
            <p className="text-[11px] font-bold text-slate-600">{data.companyAddress}</p>
            <div className="inline-block bg-slate-100 border border-slate-300 text-slate-900 px-6 py-1 rounded-full text-xs font-black mt-1">
              رسمی / محرمانه
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[11px] font-bold border-b border-slate-100 pb-6 px-4">
          <div className="flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-500">شماره مکتوب:</span>
            <span className="text-blue-900 font-mono">{data.meetingNo}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-500">تاریخ تنظیم اسناد:</span>
            <span>{data.meetingDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-500">ساعت برگزاری جلسه:</span>
            <span>{data.heldTime}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-500">محل دقیق برگزاری:</span>
            <span className="text-[10px]">{data.location}</span>
          </div>
        </div>

        {/* Participants Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-black flex items-center gap-2 border-r-4 border-blue-900 pr-3 text-blue-950">اشتراک‌کنندگان جلسه:</h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-[11px] text-right">
              <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-12 text-center">ردیف</th>
                  <th className="p-2.5">نام و تخلص</th>
                  <th className="p-2.5">سمت در تشکیل شرکت</th>
                  <th className="p-2.5 text-center">نمبر تذکره / اسناد هویت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.participants.map((p, i) => (
                  <tr key={p.id} className="font-semibold text-slate-800 hover:bg-slate-50/50">
                    <td className="p-2.5 text-center text-slate-400">{i + 1}</td>
                    <td className="p-2.5 font-black text-slate-950">{p.name}</td>
                    <td className="p-2.5">{p.position}</td>
                    <td className="p-2.5 text-center font-mono text-[10px]">{p.idNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agenda & Decisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-xs font-black flex items-center gap-2 border-r-4 border-amber-600 pr-3 text-amber-950 uppercase tracking-tighter">آجندای جلسه (Agenda):</h3>
            <ul className="space-y-3 text-[11px] font-semibold pr-4 leading-relaxed">
              {data.agenda.map((a, i) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-slate-300 font-black">{i + 1}.</span>
                  <span className="text-slate-800">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black flex items-center gap-2 border-r-4 border-emerald-600 pr-3 text-emerald-950 uppercase tracking-tighter">تصامیم و فیصله‌ها (Decisions):</h3>
            <ul className="space-y-3 text-[11px] font-bold pr-4 leading-relaxed">
              {data.decisions.map((d, i) => (
                <li key={d.id} className="flex gap-2">
                  <span className="text-emerald-600 font-black">{i + 1}.</span>
                  <span className="text-slate-900">{d.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Closing */}
        <div className="text-[11px] font-bold leading-loose bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-slate-700 italic text-justify">
          {data.closingStatement}
        </div>

        {/* Standard Official Signature & Stamp Area */}
        <div className="pt-10 mt-8 border-t border-slate-300 flex items-start justify-between px-6">
          <div className="text-center">
            <div className="w-32 h-32 border-2 border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold p-3 text-center">
              <span className="mb-1">محل مهر رسمی</span>
              <span className="font-mono text-[9px] text-slate-400">DAB/7-0965</span>
              <div className="mt-2 text-[8px] text-slate-400 border-t border-slate-200 pt-1">
                صورتجلسه مجمع عمومی
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-8 pr-12">
            {data.participants.slice(0, 4).map((p) => (
              <div key={p.id} className="text-center space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.position}</div>
                <div className="font-black text-xs text-slate-950">{p.name}</div>
                <div className="pt-8 font-bold text-slate-400 text-[9px] border-t border-slate-200 mt-2 mx-auto w-24">
                  امضاء و شصت
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-tighter">
          <div className="flex items-center gap-4">
            <span>DAB Verified Template</span>
            <span>ID: {data.meetingNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>صفحه ۱ از ۱</span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <span>Printed: {new Date().toLocaleDateString('fa-AF')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
