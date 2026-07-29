'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Printer, RotateCcw, Save, Download, 
  Building2, UserCheck, FileCheck, Info, Users, 
  ShieldCheck, Activity, Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdfExport';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface ChecklistPersonnel {
  id: number;
  position: string;
  name: string;
  fatherName: string;
  idNo: string;
  education: string;
  field: string;
  tin: string;
  criminalInquiry: string;
  sanctions: string;
}

export interface ChecklistData {
  companyName: string;
  licenseNo: string;
  province: string;
  personnel: ChecklistPersonnel[];
  checklistItems: { id: number; text: string; status: string; note: string }[];
  postLicenseObligations: { id: number; subject: string; submitted: string; note: string }[];
}

const DEFAULT_CHECKLIST_DATA: ChecklistData = {
  companyName: 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  licenseNo: 'DAB/7-0965',
  province: 'کندز',
  personnel: [
    { id: 1, position: 'سهمدار و رئیس هیئت مدیره', name: 'برکت‌الله', fatherName: 'عبدالغفور', idNo: '۵۵۵۲۲-۱۱۰۴-۱۰۰۱۳۹۹', education: 'لیسانس', field: 'کامپیوتر ساینس', tin: '9003365203', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 2, position: 'رئیس هیئت نظار', name: 'بسم‌الله شیرزی', fatherName: 'دوستمحمد', idNo: '۴۵۱۸۸', education: 'لیسانس', field: 'ادبیات پشتو', tin: '9005155800', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 3, position: 'عضو هیئت نظار', name: 'برکت‌الله غفوری', fatherName: 'عبدالغفور', idNo: '۵۵۵۲۲-۱۱۰۴-۱۰۰۱۳۹۹', education: 'لیسانس', field: 'اقتصاد', tin: '9003365203', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 4, position: 'عضو هیئت نظار', name: 'عظیم‌الله رحمانی', fatherName: 'محمد آجان', idNo: '۳۵۸۰۶', education: 'لیسانس', field: 'حقوق و علوم سیاسی', tin: '9020613858', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 5, position: 'مسئول رعایت از قانون و مقررات', name: 'محمد فهیم', fatherName: 'محمد امان', idNo: '۹۷۴۸۴', education: 'لیسانس', field: 'ادبیات دری', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 6, position: 'مسئول عملیاتی', name: 'صالح‌محمد', fatherName: 'عبدالرحیم', idNo: '۴۸۴۲۴', education: 'لیسانس', field: 'حقوق و علوم سیاسی', tin: '9020613858', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 7, position: 'نماینده تخار', name: 'رحمت‌الله', fatherName: 'فیض‌الله', idNo: '۲۹۳۸۴', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 8, position: 'خزانه‌دار تخار', name: 'عبیدالله', fatherName: 'نصرالله', idNo: '۴۸۳۹۲', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 9, position: 'نماینده کابل', name: 'اجمل', fatherName: 'نورآغا', idNo: '۴۶۳۳۸', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 10, position: 'عضو نمایندگی کابل', name: 'ریحان', fatherName: 'شیرآغا', idNo: '۱۲۳۴۵', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 11, position: 'منشی و خزانه‌دار کابل', name: 'صدیق‌الله', fatherName: 'حبیب‌الله', idNo: '۶۷۸۹۰', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 12, position: 'نماینده امام‌صاحب', name: 'محمدیوسف', fatherName: 'عبدالمجید', idNo: '۹۸۶۸۰', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 13, position: 'خزانه‌دار امام‌صاحب', name: 'عبدالمجید', fatherName: 'محمدیوسف', idNo: '۵۴۳۲۱', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
    { id: 14, position: 'نماینده کشم', name: 'عتیق‌الله', fatherName: 'شمس‌الدین', idNo: '۷۲۵۲', education: 'فارغ صنف ۱۲', field: 'عمومی', tin: '', criminalInquiry: 'پاک', sanctions: 'تطبیق' },
  ],
  checklistItems: [
    { id: 1, text: 'اساسنامه (با تاپه شرکت و امضای سهمداران)', status: 'ارائه شده', note: '' },
    { id: 2, text: 'فورم درخواستی (شصت و امضا) توسط سهمداران', status: 'ارائه شده', note: '' },
    { id: 3, text: 'چارت ساختار تشکیلاتی شرکت (با تاپه شرکت و امضای هیئت نظار)', status: 'ارائه شده', note: '' },
    { id: 4, text: 'رسید پرداخت آویز تضمین (مبلغ ۳،۳۰۰،۰۰۰ افغانی)', status: 'ارائه شده', note: 'سایر ولایات' },
    { id: 5, text: 'فورم بازدید ساحه جهت مناسب بودن محل فعالیت', status: 'ارائه شده', note: '' },
    { id: 6, text: 'دریافت مکتوب عدم باقیداری مالیاتی یا مکتوب ترک پیشه', status: 'ارائه شده', note: '' },
    { id: 7, text: 'فورم تضمین سر سهمدار/سهمداران', status: 'ارائه شده', note: '' },
    { id: 8, text: 'ارائه قرارداد خط ایجاد سیستم نرم‌افزار و فعال بودن آن', status: 'ارائه شده', note: '' },
    { id: 9, text: 'پالیسی مبارزه علیه تطهیر پول و تمویل تروریزم (AML/CFT)', status: 'ارائه شده', note: '' },
  ],
  postLicenseObligations: [
    { id: 1, subject: 'ارائه اطلاعیه آغاز فعالیت بعد از دریافت جواز فعالیت', submitted: 'خیر', note: '' },
    { id: 2, subject: 'ثبت جواز فعالیت در ریاست ثبت مرکزی و مالکیت‌های فکری', submitted: 'خیر', note: '' },
    { id: 3, subject: 'ارائه سرمایه کاری توسط حساب بانکی (۳۳،۳۰۰،۰۰۰ افغانی)', submitted: 'خیر', note: '' },
    { id: 4, subject: 'تأیید صورت حساب بانکی بابت ارائه سرمایه کاری', submitted: 'خیر', note: '' },
    { id: 5, subject: 'منظوری کارمندان', submitted: 'خیر', note: '' },
  ]
};

interface DabLicenseChecklistProps {
  customLogo?: string | null;
  onOpenLogoModal?: () => void;
}

export default function DabLicenseChecklist({ customLogo }: DabLicenseChecklistProps) {
  const [data, setData] = useState<ChecklistData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bg_license_checklist_v1');
        if (saved) return { ...DEFAULT_CHECKLIST_DATA, ...JSON.parse(saved) };
      } catch (e) { console.error(e); }
    }
    return DEFAULT_CHECKLIST_DATA;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'license_checklist_v1');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData?.checklistData) setData(prev => ({ ...prev, ...remoteData.checklistData }));
        }
      });
      return () => unsubscribe();
    } catch (e) { console.warn(e); }
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('bg_license_checklist_v1', JSON.stringify(data));
      const docRef = doc(db, 'settings', 'license_checklist_v1');
      await setDoc(docRef, { checklistData: data, updatedAt: new Date().toISOString() }, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf({
        elementId: 'license-checklist-canvas',
        filename: `چک_لست_جواز_${data.companyName.replace(/\s+/g, '_')}.pdf`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
            <ClipboardCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">چک لست اسناد و شرایط جواز</h2>
            <p className="text-[10px] text-slate-500">مدیریت اطلاعات و مدارک مورد نیاز د افغانستان بانک (DAB)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${isEditing ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-100 border-slate-200 dark:bg-slate-800'}`}>
            <Info className="w-4 h-4" /> {isEditing ? 'پیش‌نمایش سند' : 'ویرایش داده‌ها'}
          </button>
          <button onClick={handleSave} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaved ? 'ذخیره شد' : 'ذخیره در سیستم'}
          </button>
          <button onClick={handlePdfExport} disabled={isExporting} className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> {isExporting ? 'در حال تهیه...' : 'خروجی PDF'}
          </button>
          <button onClick={() => window.print()} className="p-2 bg-slate-800 text-white rounded-xl"><Printer className="w-4 h-4" /></button>
          <button onClick={() => { if(confirm('بازنشانی به تنظیمات اولیه؟')) setData(DEFAULT_CHECKLIST_DATA); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Document Canvas */}
      <div 
        id="license-checklist-canvas"
        className="bg-white text-slate-950 p-8 sm:p-12 border border-slate-200 rounded-2xl shadow-xl max-w-5xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 font-sans"
      >
        {/* Header */}
        <div className="border-b-4 border-double border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-left text-[9px] font-bold text-slate-500 leading-tight w-40">
              <div>DA AFGHANISTAN BANK</div>
              <div>Non-Bank Financial Institutions Supervision Department</div>
            </div>
            <div className="flex flex-col items-center">
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-14 h-14 bg-blue-900 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-inner">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="text-right text-[9px] font-bold text-slate-800 leading-tight w-40">
              <div className="text-[11px] font-black">د افغانستان بانک</div>
              <div>آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</div>
              <div>مدیریت جوازدهی</div>
            </div>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-4">فورم موجودیت اسناد و شرایط برای صدور جواز فعالیت شرکت صرافی و خدمات پولی</h1>
          <div className="inline-block bg-amber-50 border border-amber-200 px-6 py-1 rounded-full text-xs font-black text-amber-900">
            چک لست معلومات و اسناد ( {data.companyName} )
          </div>
        </div>

        {/* Section 1: Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.checklistItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 text-[11px] font-bold text-slate-800">{item.text}</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-400 rounded flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Personnel Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-black flex items-center gap-2 border-r-4 border-blue-900 pr-3 text-blue-900 uppercase">
            جدول مشخصات کادر مدیریتی و عملیاتی
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-[10px] text-right border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-2 border border-slate-700">موقف در شرکت</th>
                  <th className="p-2 border border-slate-700">اسم</th>
                  <th className="p-2 border border-slate-700">ولد</th>
                  <th className="p-2 border border-slate-700 w-12 text-center">عکس</th>
                  <th className="p-2 border border-slate-700 text-center">شماره تذکره</th>
                  <th className="p-2 border border-slate-700 text-center">سویه تحصیلی</th>
                  <th className="p-2 border border-slate-700 text-center">رشته</th>
                  <th className="p-2 border border-slate-700 text-center">TIN</th>
                  <th className="p-2 border border-slate-700 text-center">استعلام جنائی</th>
                  <th className="p-2 border border-slate-700 text-center">تطبیق تعزیرات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold">
                {data.personnel.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-100 font-black text-slate-950">{p.position}</td>
                    <td className="p-2 border border-slate-100">{p.name}</td>
                    <td className="p-2 border border-slate-100">{p.fatherName}</td>
                    <td className="p-2 border border-slate-100 text-center">
                      <div className="w-8 h-10 border border-slate-300 rounded bg-slate-100 mx-auto" />
                    </td>
                    <td className="p-2 border border-slate-100 text-center font-mono">{p.idNo}</td>
                    <td className="p-2 border border-slate-100 text-center">{p.education}</td>
                    <td className="p-2 border border-slate-100 text-center">{p.field}</td>
                    <td className="p-2 border border-slate-100 text-center font-mono">{p.tin}</td>
                    <td className="p-2 border border-slate-100 text-center text-emerald-600">ارائه شده</td>
                    <td className="p-2 border border-slate-100 text-center text-emerald-600">پاک</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Signature Grid */}
        <div className="grid grid-cols-5 gap-4 pt-8 text-center text-[9px] font-black text-slate-700">
          <div className="space-y-12">
            <div className="h-16 border-b border-slate-300 mx-auto w-24"></div>
            <div>امضاء معاون آمریت</div>
          </div>
          <div className="space-y-12">
            <div className="h-16 border-b border-slate-300 mx-auto w-24"></div>
            <div>امضاء مدیر ارشد جوازدهی</div>
          </div>
          <div className="space-y-12">
            <div className="h-16 border-b border-slate-300 mx-auto w-24"></div>
            <div>امضاء مدیر جوازدهی</div>
          </div>
          <div className="space-y-12">
            <div className="h-16 border-b border-slate-300 mx-auto w-24"></div>
            <div>امضاء مدیر ارشد زون ساحوی</div>
          </div>
          <div className="space-y-12">
            <div className="h-16 border-b border-slate-300 mx-auto w-24"></div>
            <div>امضاء کارمند ولایتی</div>
          </div>
        </div>

        {/* Section 4: Post-License Obligations */}
        <div className="space-y-4 pt-10 border-t-2 border-slate-200">
          <h3 className="text-sm font-black flex items-center gap-2 text-rose-900 border-r-4 border-rose-900 pr-3">
            مکلفیت‌های بعد از دریافت جواز ( {data.companyName} ) - دارنده جواز {data.licenseNo}
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <table className="w-full text-[11px] text-right border-collapse">
              <thead className="bg-slate-50 text-slate-900 font-black">
                <tr>
                  <th className="p-3 border border-slate-200 w-16 text-center">شماره</th>
                  <th className="p-3 border border-slate-200">موضوع</th>
                  <th className="p-3 border border-slate-200 w-32 text-center">ارائه شده یا خیر</th>
                  <th className="p-3 border border-slate-200">ملاحظه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {data.postLicenseObligations.map((obj, i) => (
                  <tr key={obj.id} className="hover:bg-slate-50">
                    <td className="p-3 border border-slate-100 text-center">{i + 1}</td>
                    <td className="p-3 border border-slate-100">{obj.subject}</td>
                    <td className="p-3 border border-slate-100 text-center">
                      <div className="w-4 h-4 border border-slate-300 rounded mx-auto" />
                    </td>
                    <td className="p-3 border border-slate-100 text-slate-400 font-normal italic">قید ملاحظه...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>Official DAB Licensing Form Template</span>
          <span>DAB/SUPERVISION/LICENSE-002</span>
          <span>صفحه ۱ از ۱</span>
        </div>
      </div>
    </div>
  );
}
