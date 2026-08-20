'use client';

import { useMemo, useState } from 'react';
import DabOfficialHeader from './DabOfficialHeader';

type Guarantor = {
  name: string;
  business: string;
  mainResidence: string;
  currentResidence: string;
  father: string;
  grandfather: string;
  idNumber: string;
  phone: string;
  email: string;
  mainProvince: string;
  mainDistrict: string;
  mainArea: string;
  mainVillage: string;
  currentProvince: string;
  currentDistrict: string;
  currentArea: string;
  currentVillage: string;
};

const emptyGuarantor = (): Guarantor => ({
  name: '', business: '', mainResidence: '', currentResidence: '', father: '',
  grandfather: '', idNumber: '', phone: '', email: '', mainProvince: '',
  mainDistrict: '', mainArea: '', mainVillage: '', currentProvince: '',
  currentDistrict: '', currentArea: '', currentVillage: '',
});

const labels: Array<[keyof Guarantor, string]> = [
  ['name', 'اسم'], ['father', 'ولد'], ['grandfather', 'ولدیت'], ['idNumber', 'نمبر تذکره'],
  ['business', 'اسم و محل فعالیت تشبث'], ['phone', 'شماره تماس'], ['email', 'ایمیل آدرس'],
  ['mainProvince', 'ولایت'], ['mainDistrict', 'ولسوالی'], ['mainArea', 'ناحیه'], ['mainVillage', 'قریه'],
  ['currentProvince', 'ولایت'], ['currentDistrict', 'ولسوالی'], ['currentArea', 'ناحیه'], ['currentVillage', 'قریه'],
  ['mainResidence', 'سکونت اصلی'], ['currentResidence', 'سکونت فعلی'],
];

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-right"><span className="mb-1 block text-sm font-semibold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-none border border-slate-700 bg-white px-2 text-right outline-none focus:ring-2 focus:ring-slate-400" /></label>;
}

function GuarantorSection({ index, data, setData }: { index: number; data: Guarantor; setData: (data: Guarantor) => void }) {
  const update = (key: keyof Guarantor, value: string) => setData({ ...data, [key]: value });
  return <section className="mb-8 break-inside-avoid">
    <h2 className="mb-3 text-right text-lg font-bold">{index}. شهرت سهم دار {index === 1 ? 'اول' : index === 2 ? 'دوم' : 'سوم'} شرکت تضمین کننده:</h2>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_1fr]">
      <div className="space-y-3">
        <Input label="اسم و محل فعالیت تشبث" value={data.business} onChange={(v) => update('business', v)} />
        <Input label="سکونت اصلی" value={data.mainResidence} onChange={(v) => update('mainResidence', v)} />
        <Input label="سکونت فعلی" value={data.currentResidence} onChange={(v) => update('currentResidence', v)} />
      </div>
      <div className="flex min-h-[180px] items-center justify-center border-2 border-dashed border-slate-500 text-center text-xs font-semibold">
        عکس تضمین کننده در اینجا نصب و با مهر تضمین کننده تاپه گردد
      </div>
      <div className="grid grid-cols-2 gap-2">
        {labels.slice(0, 4).map(([key, label]) => <Input key={key} label={label} value={data[key]} onChange={(v) => update(key, v)} />)}
      </div>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="border border-slate-700 p-3"><h3 className="mb-2 text-right font-bold">سکونت اصلی</h3><div className="grid grid-cols-2 gap-2">{labels.slice(7, 11).map(([key, label]) => <Input key={key} label={label} value={data[key]} onChange={(v) => update(key, v)} />)}</div></div>
      <div className="border border-slate-700 p-3"><h3 className="mb-2 text-right font-bold">سکونت فعلی</h3><div className="grid grid-cols-2 gap-2">{labels.slice(11, 15).map(([key, label]) => <Input key={key} label={label} value={data[key]} onChange={(v) => update(key, v)} />)}</div></div>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"><Input label="شماره تماس" value={data.phone} onChange={(v) => update('phone', v)} /><Input label="ایمیل آدرس" value={data.email} onChange={(v) => update('email', v)} /></div>
  </section>;
}

export default function DabShareholderGuaranteeForm() {
  const [guarantors, setGuarantors] = useState([emptyGuarantor(), emptyGuarantor(), emptyGuarantor()]);
  const [companyName, setCompanyName] = useState('');
  const [province, setProvince] = useState('');
  const [shareholderName, setShareholderName] = useState('');
  const [shareholderFather, setShareholderFather] = useState('');
  const [shareholderId, setShareholderId] = useState('');
  const [date, setDate] = useState('');
  const [saved, setSaved] = useState(false);

  const payload = useMemo(() => ({ guarantors, companyName, province, shareholderName, shareholderFather, shareholderId, date }), [guarantors, companyName, province, shareholderName, shareholderFather, shareholderId, date]);

  const saveDraft = () => { localStorage.setItem('dab-shareholder-guarantee-v1', JSON.stringify(payload)); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const print = () => window.print();
  const setGuarantor = (i: number, data: Guarantor) => setGuarantors((current) => current.map((item, index) => index === i ? data : item));

  return <main dir="rtl" className="mx-auto max-w-6xl bg-white px-5 py-8 text-slate-950 print:max-w-none print:px-8">
    <DabOfficialHeader
      storageKey="dab_shareholder_guarantee_header"
      governmentTitle="امارت اسلامی افغانستان"
      bankName="د افغانستان بانک"
      department="آمریت عمومی نظارت از مؤسسات مالی غیر بانکی"
      directorate="مدیریت جوازدهی"
      formNumber=""
      formTitle="فورم تضمین سر سهمدار / سهمداران شرکت صرافی و خدمات پولی"
      isEditable={true}
    />

    <div className="mb-6 flex justify-end gap-2 print:hidden"><button onClick={saveDraft} className="rounded bg-slate-900 px-4 py-2 text-sm font-bold text-white">{saved ? 'ذخیره شد' : 'ذخیره پیش‌نویس'}</button><button onClick={print} className="rounded border border-slate-900 px-4 py-2 text-sm font-bold">چاپ A4</button></div>

    <h2 className="mb-3 border-b border-slate-700 pb-2 text-right text-lg font-black">بخش اول: شهرت تضمین کنندگان</h2>
    <p className="mb-5 text-right text-sm leading-7">تمامی سهمداران شرکت تضمین کننده نیاز است تا از سهمدار شرکت صرافی و خدمات پولی، تضمین نمایند.</p>
    {guarantors.map((g, i) => <GuarantorSection key={i} index={i + 1} data={g} setData={(data) => setGuarantor(i, data)} />)}

    <section className="mb-8 break-inside-avoid">
      <h2 className="mb-3 border-b border-slate-700 pb-2 text-right text-lg font-black">بخش دوم: شهرت سهمدار شرکت صرافی و خدمات پولی (شخص تضمین شونده)</h2>
      <p className="mb-4 text-justify text-sm leading-8">مایان هریک که شهرت مکمل مان در فوق ذکر گردیده است، با رضایت کامل اظهار میداریم که سهمدار/سهمداران آتی الذکر که می‌خواهد جواز شرکت صرافی و خدمات پولی را تحت نام ({companyName || '____________________'}) در ولایت ({province || '____________________'}) اخذ/تمدید نماید، تضمین نموده و در صورت هر گونه تخلف و تخطی که از قوانین و مقررات نافذه کشور از آدرس شرکت صرافی و خدمات پولی ایشان انجام یابد، ایشان را در وقت معینه به مرجع مربوط یا د افغانستان بانک حاضر می‌نماییم و در اقرار خود صادق می‌باشیم.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3"><Input label="اسم" value={shareholderName} onChange={setShareholderName} /><Input label="ولد" value={shareholderFather} onChange={setShareholderFather} /><Input label="شماره تذکره" value={shareholderId} onChange={setShareholderId} /></div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"><Input label="نام شرکت" value={companyName} onChange={setCompanyName} /><Input label="ولایت" value={province} onChange={setProvince} /><Input label="تاریخ" value={date} onChange={setDate} /></div>
    </section>

    <section className="mb-8 break-inside-avoid">
      <h2 className="mb-3 border-b border-slate-700 pb-2 text-right text-lg font-black">بخش سوم: تعهدات تضمین کنندگان</h2>
      <ol className="space-y-3 pr-6 text-justify text-sm leading-8">
        <li>تضمین هذا باید با حضور شخص تضمین کننده در مقابل کارمند مسئول در مدیریت جوازدهی آمریت عمومی نظارت از مؤسسات مالی غیر بانکی یا در مقابل کارمند مسئول در آمریت زون مربوط/مدیریت نمایندگی د افغانستان بانک در ولایات امضاء و شصت گذاری گردد. کارمند مسئول متذکره خود را مطمئین سازد که فورم تضمین هذا حسب اسناد و مدارک مربوط به تضمین کننده خانه‌پُری گردیده و توسط شخص خود تضمین کننده امضاء و شصت گذاری می‌گردد.</li>
        <li>در صورتیکه تضمین کننده، ترک تضمین می‌نماید و یا نمی‌خواهد از مالک شرکت صرافی و خدمات پولی فوق‌الذکر تضمین نماید، نیاز است تا سهمدار/سهمداران شرکت صرافی و خدمات پولی، کتباً تضمین کننده جدید را به د افغانستان بانک معرفی نماید.</li>
        <li>تضمین کنندگان الی معرفی تضمین کننده جدید توسط سهمدار/سهمداران شرکت صرافی و خدمات پولی، منحیث تضمین کننده نزد د افغانستان بانک قرار می‌داشته باشند.</li>
        <li>هرگاه معلومات ضامن که در بخش اول این فورم ارائه گردیده تغییر نماید و یا تشبث و جواز فعالیت ضامن لغو گردد، تضمین کننده و سهمدار/سهمداران شرکت صرافی و خدمات پولی مکلف اند تا د افغانستان بانک را عندالموقع کتباً اطلاع دهد. در غیر آن مسئولیت بدوش ضامن و سهمدار/سهمداران شرکت می‌باشد.</li>
        <li>تضمین متذکره صرف برای سه سال بوده و در زمان تمدید جواز فوق‌الذکر، ضمانت‌خط هذا تجدید می‌گردد.</li>
        <li>تضمین کننده نمی‌تواند از جمله اقارب درجه اول (پدر، مادر، فرزند، همسر، برادر و خواهر) شخص تضمین شونده باشد.</li>
      </ol>
      <p className="mt-5 text-justify text-sm leading-8">عکس‌ها و مُهر شرکت در فورم هذا و نقل تذکره تابعیت با جواز قابل اعتبار به این تضمین‌خط ضمیمه گردیده و صحت است.</p>
    </section>

    <section className="break-inside-avoid">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">{guarantors.map((_, i) => <div key={i} className="text-right"><div className="mb-5 border-b border-slate-700 pb-2">امضاء تضمین کننده: ____________________</div><div>شصت تضمین کننده: ____________________</div></div>)}</div>
      <div className="mt-10 text-right">تاریخ: ______ / ______ / ______</div>
    </section>
  </main>;
}
