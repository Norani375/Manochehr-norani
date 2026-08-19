'use client';

import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Field = { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea' | 'file' };
type FormDef = { id: string; title: string; category: string; fields: Field[] };

const commonCompany: Field[] = [
  { key: 'companyName', label: 'نام رسمی شرکت' }, { key: 'licenseNo', label: 'شماره جواز' },
  { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date' }, { key: 'licenseExpiryDate', label: 'تاریخ ختم جواز', type: 'date' },
  { key: 'tin', label: 'شماره تشخیصیه مالیاتی (TIN)' }, { key: 'province', label: 'ولایت' }, { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'address', label: 'آدرس مکمل', type: 'textarea' }, { key: 'phone', label: 'شماره تماس' }, { key: 'email', label: 'ایمیل' },
];

const person: Field[] = [
  { key: 'fullName', label: 'نام و تخلص' }, { key: 'fatherName', label: 'نام پدر' }, { key: 'grandfatherName', label: 'نام پدرکلان' },
  { key: 'tazkira', label: 'شماره تذکره / سند هویت' }, { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' },
  { key: 'nationality', label: 'تابعیت' }, { key: 'occupation', label: 'وظیفه / پیشه' }, { key: 'phone', label: 'شماره تماس' },
  { key: 'address', label: 'آدرس', type: 'textarea' }, { key: 'photo', label: 'عکس', type: 'file' }, { key: 'identityDocument', label: 'سند هویت', type: 'file' },
];

const forms: FormDef[] = [
  { id: 'license-application', title: 'درخواست اخذ جواز فعالیت شرکت صرافی و خدمات پولی', category: 'جوازدهی', fields: [...commonCompany, { key: 'capital', label: 'سرمایه' }, { key: 'businessScope', label: 'نوع و ساحه فعالیت', type: 'textarea' }, { key: 'representative', label: 'نماینده باصلاحیت' }] },
  { id: 'license-renewal', title: 'درخواست تمدید جواز فعالیت شرکت صرافی و خدمات پولی', category: 'تمدید', fields: [...commonCompany, { key: 'renewalReason', label: 'درخواست / توضیحات تمدید', type: 'textarea' }, { key: 'taxClearance', label: 'تصفیه / عدم باقیداری مالیاتی', type: 'file' }, { key: 'criminalClearance', label: 'تصدیق عدم مسئولیت جنایی، در صورت مطالبه', type: 'file' }] },
  { id: 'shareholder-employee-profile', title: 'شهرت سهمدار / کارمند شرکت صرافی و خدمات پولی', category: 'اشخاص', fields: person },
  { id: 'articles', title: 'اساسنامه شرکت صرافی و خدمات پولی', category: 'شرکت', fields: [...commonCompany, { key: 'articlesFile', label: 'فایل اساسنامه', type: 'file' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-establishment', title: 'ایجاد نمایندگی و معرفی نماینده باصلاحیت', category: 'نمایندگی', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'agencyProvince', label: 'ولایت نمایندگی' }, { key: 'agencyDistrict', label: 'ولسوالی / ناحیه نمایندگی' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }] },
  { id: 'agency-renewal', title: 'تمدید نمایندگی شرکت صرافی و خدمات پولی', category: 'تمدید نمایندگی', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'agencyLicenseNo', label: 'شماره اجازه‌نامه نمایندگی' }, { key: 'agencyExpiryDate', label: 'تاریخ ختم اجازه‌نامه', type: 'date' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }, { key: 'supportingDocuments', label: 'اسناد حمایوی', type: 'file' }] },
  { id: 'shareholder-guarantee', title: 'تضمین سر سهمدار / سهمداران', category: 'تضمین', fields: [...commonCompany, { key: 'shareholderName', label: 'نام سهمدار' }, { key: 'share', label: 'درصد سهم', type: 'number' }, { key: 'guaranteeAmount', label: 'مبلغ تضمین', type: 'number' }, { key: 'guaranteeDocument', label: 'سند تضمین', type: 'file' }] },
  { id: 'aml-cft-policy', title: 'پالیسی مبارزه با پولشویی و تمویل تروریزم', category: 'Compliance', fields: [...commonCompany, { key: 'complianceOfficer', label: 'مسئول رعایت قوانین' }, { key: 'policyVersion', label: 'نسخه پالیسی' }, { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date' }, { key: 'policyFile', label: 'فایل پالیسی', type: 'file' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-change', title: 'تغییرات نمایندگی', category: 'تغییرات', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'changeType', label: 'نوع تغییر' }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }, { key: 'evidence', label: 'سند اثباتی', type: 'file' }] },
  { id: 'ownership-transfer', title: 'انتقال مالکیت شرکت', category: 'تغییرات', fields: [...commonCompany, { key: 'oldOwner', label: 'مالک / سهمدار قبلی' }, { key: 'newOwner', label: 'مالک / سهمدار جدید' }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date' }, { key: 'transferDocument', label: 'سند انتقال', type: 'file' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'name-change', title: 'تغییر نام شرکت', category: 'تغییرات', fields: [...commonCompany, { key: 'oldName', label: 'نام قبلی' }, { key: 'newName', label: 'نام جدید' }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'approvalDocument', label: 'سند تأیید', type: 'file' }] },
  { id: 'location-change', title: 'تغییر موقعیت شرکت', category: 'تغییرات', fields: [...commonCompany, { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea' }, { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea' }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'approvalDocument', label: 'سند تأیید', type: 'file' }] },
  { id: 'license-suspension', title: 'تعلیق جواز شرکت', category: 'وضعیت جواز', fields: [...commonCompany, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea' }, { key: 'supportingDocument', label: 'سند حمایوی', type: 'file' }] },
  { id: 'agency-suspension', title: 'تعلیق اجازه‌نامه نمایندگی', category: 'وضعیت نمایندگی', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea' }] },
  { id: 'license-closure', title: 'ترک پیشه جواز فعالیت شرکت', category: 'ترک پیشه', fields: [...commonCompany, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }, { key: 'licenseReturn', label: 'اصل جواز', type: 'file' }] },
  { id: 'agency-closure', title: 'ترک پیشه اجازه‌نامه نمایندگی', category: 'ترک پیشه', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }, { key: 'permitReturn', label: 'اصل اجازه‌نامه', type: 'file' }] },
  { id: 'agency-closure-permit', title: 'ترک پیشه اجازه‌نامه نمایندگی (فورم مستقل)', category: 'ترک پیشه', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'permitNo', label: 'شماره اجازه‌نامه' }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'statement', label: 'تعهد و توضیحات', type: 'textarea' }] },
  { id: 'commencement-letter', title: 'مکتوب آغاز فعالیت', category: 'فعالیت', fields: [...commonCompany, { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date' }, { key: 'authorizedPerson', label: 'شخص مجاز' }, { key: 'letterFile', label: 'مکتوب', type: 'file' }] },
];

const initial = Object.fromEntries(forms.flatMap(f => f.fields.map(x => [x.key, ''])));

export default function DabAllOfficialFormsWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [active, setActive] = useState(forms[1].id);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState('');
  const [query, setQuery] = useState('');
  const form = forms.find(x => x.id === active)!;
  const filtered = useMemo(() => forms.filter(x => `${x.title} ${x.category}`.includes(query.trim())), [query]);
  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));
  const save = async () => { await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), { formId: form.id, title: form.title, values, updatedAt: new Date().toISOString(), status: 'draft' }, { merge: true }); setSaved('فورم با موفقیت ذخیره شد.'); setTimeout(() => setSaved(''), 2500); };
  const print = () => window.print();

  return <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
    <header className="border-b bg-white px-4 py-5 print:hidden"><div className="mx-auto max-w-7xl"><div className="text-xs font-black text-blue-700">DA AFGHANISTAN BANK • LICENSING FORMS</div><h1 className="mt-1 text-2xl font-black">مرکز فورم‌های جوازدهی صرافی و خدمات پولی</h1><p className="mt-1 text-sm text-slate-500">کتابخانه واحد فورم‌ها، تکمیل معلومات، ذخیره پرونده و چاپ</p></div></header>
    <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[310px_1fr]">
      <aside className="rounded-xl border bg-white p-3 print:hidden"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجوی فورم..." className="mb-3 w-full rounded-lg border px-3 py-2 text-sm" /><div className="space-y-1">{filtered.map(x => <button key={x.id} onClick={() => setActive(x.id)} className={`w-full rounded-lg p-3 text-right text-sm font-bold ${active === x.id ? 'bg-blue-700 text-white' : 'hover:bg-slate-100'}`}><span className="block">{x.title}</span><span className={`text-[10px] ${active === x.id ? 'text-blue-100' : 'text-slate-400'}`}>{x.category}</span></button>)}</div></aside>
      <section className="rounded-xl border bg-white p-5 shadow-sm print:border-0 print:shadow-none"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-500">فورم {forms.findIndex(x => x.id === form.id) + 1} از {forms.length}</div><h2 className="mt-1 text-xl font-black">{form.title}</h2><p className="mt-1 text-xs text-slate-500">دسته: {form.category}</p></div><div className="flex gap-2 print:hidden"><button onClick={print} className="rounded-lg border px-4 py-2 text-sm font-bold">چاپ</button><button onClick={save} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">ذخیره</button></div></div>{saved && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800 print:hidden">{saved}</div>}
        <div className="grid gap-4 md:grid-cols-2">{form.fields.map(f => <label key={f.key} className={f.type === 'textarea' ? 'space-y-1 md:col-span-2' : 'space-y-1'}><span className="block text-xs font-bold text-slate-700">{f.label}</span>{f.type === 'textarea' ? <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" value={values[f.key] || ''} onChange={e => set(f.key, e.target.value)} /> : f.type === 'file' ? <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm" type="file" onChange={e => set(f.key, e.target.files?.[0]?.name || '')} /> : <input className="w-full rounded-lg border px-3 py-2" type={f.type || 'text'} value={values[f.key] || ''} onChange={e => set(f.key, e.target.value)} />}</label>)}</div>
        <div className="mt-8 grid gap-8 border-t pt-6 sm:grid-cols-2"><div><div className="text-sm font-bold">نام و امضای درخواست‌کننده</div><div className="mt-10 border-b" /></div><div><div className="text-sm font-bold">مهر و امضای شرکت</div><div className="mt-10 border-b" /></div></div>
        <p className="mt-6 text-[10px] leading-5 text-slate-500">این صفحه برای دیجیتالی‌سازی و مدیریت فورم‌های رسمی DAB ساخته شده است. متن، ترتیب و نسخه چاپی هر فورم باید با آخرین فایل رسمی منتشرشده توسط د افغانستان بانک تطبیق و قبل از ارسال رسمی تأیید شود.</p>
      </section>
    </div>
  </main>;
}
