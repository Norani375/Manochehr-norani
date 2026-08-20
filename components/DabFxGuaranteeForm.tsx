'use client';

import { useState } from 'react';

const sourceUrl = 'https://dab.gov.af/sites/default/files/2019-03/%D9%81%D9%88%D8%B1%D9%85%D8%B6%D9%85%D8%A7%D9%86%D8%AA%D8%B5%D8%B1%D8%A7%D9%81%DB%8C3.pdf';

type Guarantor = {
  fullName: string;
  businessNameLocation: string;
  province: string;
  fatherName: string;
  district: string;
  grandfatherName: string;
  area: string;
  tazkiraNo: string;
  village: string;
  currentResidence: string;
  phone: string;
  email: string;
  businessType: string;
  businessName: string;
  businessLicenseNo: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessLicenseExpiry: string;
};

const emptyGuarantor: Guarantor = {
  fullName: '',
  businessNameLocation: '',
  province: '',
  fatherName: '',
  district: '',
  grandfatherName: '',
  area: '',
  tazkiraNo: '',
  village: '',
  currentResidence: '',
  phone: '',
  email: '',
  businessType: '',
  businessName: '',
  businessLicenseNo: '',
  businessPhone: '',
  businessEmail: '',
  businessAddress: '',
  businessLicenseExpiry: '',
};

const undertakingText = [
  'تضمین هذا باید با حضور شخص تضمین کننده در مقابل کارمند مسئول صرافی در مدیریت جوازدهی آمریت عمومی نظارت امور مالی یا در مقابل کارمند مسئول صرافی در آمریت زون مربوطه/مدیریت نمایندگی د افغانستان بانک در ولایات امضاء و شصت گذاری گردد.',
  'در صورت که متضمن ترک تضمین می نماید و یا نمی خواهد از مالک صرافی فوق الذکر تضمین نماید، هر دو جناح (تضمین کننده و مالک صرافی) مکلف است تا د افغانستان بانک را عندالموقع باخبر سازند.',
  'هرگاه معلومات ضامن که در بخش اول این فورم ارائه گردیده تغییر نماید و یا تشبث و جواز فعالیت ضامن لغو گردد، تضمین کننده و مالک صرافی مکلف اند تا د افغانستان بانک را عندالموقع کتباً اطلاع دهد. در غیر آن مسئولیت بدوش ضامن و مالک صرافی می باشد.',
  'تضمین متذکره صرف برای سه سال بوده و در زمان تمدید جواز فوق الذکر، ضمانت خط هذا تجدید می گردد.',
];

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label className={textarea ? 'md:col-span-2' : ''}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-slate-400 p-2" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-400 p-2" />
      )}
    </label>
  );
}

export default function DabFxGuaranteeForm() {
  const [g, setG] = useState<Guarantor>(emptyGuarantor);
  const [ownerName, setOwnerName] = useState('');
  const [ownerFatherName, setOwnerFatherName] = useState('');
  const [ownerTazkiraNo, setOwnerTazkiraNo] = useState('');
  const [province, setProvince] = useState('');
  const [date, setDate] = useState('');
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Guarantor, value: string) => setG((current) => ({ ...current, [key]: value }));

  const saveDraft = () => {
    window.localStorage.setItem('dab-fx-guarantee-draft', JSON.stringify({ guarantor: g, ownerName, ownerFatherName, ownerTazkiraNo, province, date }));
    setSaved(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl bg-white print:max-w-none">
        <header className="border-2 border-slate-800 p-5 text-center">
          <div className="text-base font-bold">د افغانستان بانک</div>
          <div className="mt-1 text-sm font-semibold">آمریت عمومی نظارت امور مالی غیر بانکی</div>
          <div className="text-sm">مدیریت جوازدهی</div>
          <h1 className="mt-4 border-t pt-4 text-xl font-bold">فورم ضمانت خط صرافی</h1>
          <p className="mt-2 text-xs text-slate-600">فورم شماره ۱ — مطابق فایل رسمی منتشرشده د افغانستان بانک</p>
        </header>

        <section className="border-x-2 border-b-2 border-slate-800 p-5 md:p-8">
          <h2 className="mb-4 border-b pb-2 text-lg font-bold">بخش اول: شهرت مکمل تضمین کننده</h2>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Field label="اسم" value={g.fullName} onChange={(v) => update('fullName', v)} />
            <Field label="اسم و محل فعالیت تشبث" value={g.businessNameLocation} onChange={(v) => update('businessNameLocation', v)} />
            <Field label="ولد" value={g.fatherName} onChange={(v) => update('fatherName', v)} />
            <Field label="ولدیت" value={g.grandfatherName} onChange={(v) => update('grandfatherName', v)} />
            <Field label="ولایت سکونت اصلی" value={g.province} onChange={(v) => update('province', v)} />
            <Field label="ولایت سکونت فعلی" value={g.currentResidence} onChange={(v) => update('currentResidence', v)} />
            <Field label="ولسوالی سکونت اصلی" value={g.district} onChange={(v) => update('district', v)} />
            <Field label="ناحیه" value={g.area} onChange={(v) => update('area', v)} />
            <Field label="قریه" value={g.village} onChange={(v) => update('village', v)} />
            <Field label="نمبر تذکره" value={g.tazkiraNo} onChange={(v) => update('tazkiraNo', v)} />
            <Field label="شماره تماس" value={g.phone} onChange={(v) => update('phone', v)} />
            <Field label="ایمیل آدرس" value={g.email} onChange={(v) => update('email', v)} />
          </div>

          <div className="mb-6 border-2 border-slate-400 p-4">
            <div className="mb-4 text-sm font-semibold">عکس تضمین کننده در اینجا نصب و با مهر تضمین کننده تاپه گردد.</div>
            <div className="mx-auto h-44 w-36 border-2 border-dashed border-slate-500 text-center text-xs text-slate-500 pt-16">محل عکس</div>
          </div>

          <h3 className="mb-4 border-b pb-2 text-base font-bold">معلومات در مورد تشبث یا فعالیت ضامن</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اسم تشبث" value={g.businessName} onChange={(v) => update('businessName', v)} />
            <Field label="نوع فعالیت" value={g.businessType} onChange={(v) => update('businessType', v)} />
            <Field label="نمبر جواز" value={g.businessLicenseNo} onChange={(v) => update('businessLicenseNo', v)} />
            <Field label="تاریخ اعتبار" value={g.businessLicenseExpiry} onChange={(v) => update('businessLicenseExpiry', v)} />
            <Field label="شماره تماس تشبث" value={g.businessPhone} onChange={(v) => update('businessPhone', v)} />
            <Field label="ایمیل آدرس تشبث" value={g.businessEmail} onChange={(v) => update('businessEmail', v)} />
            <Field label="آدرس تشبث" value={g.businessAddress} onChange={(v) => update('businessAddress', v)} textarea />
          </div>

          <div className="mt-8 border-t-2 border-slate-800 pt-6">
            <h2 className="mb-4 text-lg font-bold">بخش دوم: تعهدات و اقرار تضمین کننده</h2>
            <div className="space-y-3 text-sm leading-7">
              {undertakingText.map((item, index) => <p key={item}>{index + 1}. {item}</p>)}
              <p>5. این جانب ({g.fullName || '_________________'}) که شهرت مکمل ام در فوق ذکر گردیده است، با رضایت تام اظهار میدارم که از محترم ({ownerName || '_________________'}) ولد ({ownerFatherName || '_________________'}) دارنده نمبر تذکره ({ownerTazkiraNo || '_________'}) که می خواهد جواز صرافی را در ولایت ({province || '_________________'}) اخذ نماید، تضمین نموده و در صورت هر گونه تخلف و تخطی که از قوانین و مقررات نافذه کشور از آدرس صرافی وی سر زند، ایشان را در وقت معینه به مرجع مربوطه یا د افغانستان بانک حاضر می نمایم و در اقرار خود صادق می باشم.</p>
              <p>عکس و مهر بنده در فورم هذا و نقل تذکره تابعیت با جواز قابل اعتبار بنده به این تضمین خط ضمیمه گردیده و صحت است.</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="نام مالک صرافی" value={ownerName} onChange={setOwnerName} />
              <Field label="نام پدر مالک صرافی" value={ownerFatherName} onChange={setOwnerFatherName} />
              <Field label="شماره تذکره مالک صرافی" value={ownerTazkiraNo} onChange={setOwnerTazkiraNo} />
              <Field label="ولایت صرافی" value={province} onChange={setProvince} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="min-h-28 border p-4">امضاء تضمین کننده:<br /><br />_________________</div>
              <div className="min-h-28 border p-4">شصت تضمین کننده:<br /><br />_________________</div>
              <div className="min-h-28 border p-4">تاریخ:<br /><br />{date || '____ / ____ / ____'}</div>
            </div>
            <div className="mt-4 max-w-sm"><Field label="تاریخ" value={date} onChange={setDate} /></div>
          </div>

          <div className="mt-6 border-t pt-4 text-xs leading-6 text-slate-600">
            منبع رسمی: <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline">فورم ضمانت صرافی — د افغانستان بانک</a>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={saveDraft} className="border bg-slate-900 px-5 py-2 text-white">ذخیره پیش‌نویس</button>
            <button type="button" onClick={() => window.print()} className="border px-5 py-2">چاپ A4</button>
          </div>
          {saved ? <p className="mt-3 border p-2 text-sm print:hidden">پیش‌نویس در این دستگاه ذخیره شد.</p> : null}
        </section>
      </div>
      <style jsx global>{`
        @page { size: A4 portrait; margin: 12mm; }
        @media print {
          html, body { background: #fff !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          input, textarea { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </main>
  );
}
