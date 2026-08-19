'use client';

import { useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCompany } from '@/lib/companyContext';
import { barakatullahGhafouriProfile as profile } from '@/lib/barakatullahGhafouriProfile';

type Field = { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea'; required?: boolean };
type Values = Record<string, string>;
type FormDef = { id: string; title: string; category: string; fields: Field[] };

const companyFields: Field[] = [
  { key: 'companyName', label: 'نام رسمی شرکت', required: true }, { key: 'formerName', label: 'نام قبلی شرکت' },
  { key: 'englishName', label: 'نام انگلیسی' }, { key: 'licenseNo', label: 'شماره جواز', required: true },
  { key: 'province', label: 'ولایت' }, { key: 'address', label: 'آدرس', type: 'textarea' },
  { key: 'tin', label: 'TIN' }, { key: 'phone', label: 'شماره تماس' }, { key: 'email', label: 'ایمیل' },
];

const forms: FormDef[] = [
  { id: 'license-application', title: 'درخواست اخذ جواز فعالیت شرکت صرافی و خدمات پولی', category: 'جوازدهی', fields: [...companyFields, { key: 'capital', label: 'سرمایه' }, { key: 'businessScope', label: 'نوع و ساحه فعالیت', type: 'textarea' }] },
  { id: 'license-renewal', title: 'درخواست تمدید جواز فعالیت شرکت صرافی و خدمات پولی', category: 'تمدید', fields: [...companyFields, { key: 'renewalDate', label: 'تاریخ درخواست', type: 'date', required: true }, { key: 'renewalReason', label: 'درخواست / توضیحات تمدید', type: 'textarea' }, { key: 'branches', label: 'نمایندگی‌ها' }, { key: 'taxClearanceNo', label: 'شماره تصفیه مالیاتی' }] },
  { id: 'shareholder-employee-profile', title: 'شهرت سهمدار / کارمند شرکت صرافی و خدمات پولی', category: 'اشخاص', fields: [{ key: 'fullName', label: 'نام و تخلص', required: true }, { key: 'fatherName', label: 'نام پدر' }, { key: 'identityNo', label: 'شماره تذکره / سند هویت' }, { key: 'role', label: 'سمت' }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'education', label: 'تحصیلات' }] },
  { id: 'articles', title: 'اساسنامه و مشخصات شرکت', category: 'شرکت', fields: [...companyFields, { key: 'registrationDate', label: 'تاریخ ثبت', type: 'date' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-establishment', title: 'ایجاد نمایندگی و معرفی نماینده باصلاحیت', category: 'نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }] },
  { id: 'agency-renewal', title: 'تمدید نمایندگی شرکت صرافی و خدمات پولی', category: 'تمدید نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'agencyLicenseNo', label: 'شماره اجازه‌نامه' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }] },
  { id: 'shareholder-guarantee', title: 'تضمین سر سهمدار / سهمداران', category: 'تضمین', fields: [...companyFields, { key: 'shareholderName', label: 'نام سهمدار', required: true }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'guaranteeAmount', label: 'مبلغ تضمین', type: 'number' }] },
  { id: 'aml-cft-policy', title: 'پالیسی مبارزه با پولشویی و تمویل تروریزم', category: 'AML/CFT', fields: [...companyFields, { key: 'complianceOfficer', label: 'مسئول پیروی از قوانین', required: true }, { key: 'officerIdentityNo', label: 'تذکره مسئول پیروی از قوانین' }, { key: 'officerEducation', label: 'تحصیلات مسئول پیروی از قوانین' }, { key: 'riskAssessment', label: 'ارزیابی خطر', type: 'textarea' }] },
  { id: 'agency-change', title: 'تغییرات نمایندگی', category: 'تغییرات', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'changeType', label: 'نوع تغییر', required: true }, { key: 'newRepresentative', label: 'نماینده جدید' }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }] },
  { id: 'ownership-transfer', title: 'انتقال مالکیت شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldOwner', label: 'مالک / سهمدار قبلی', required: true }, { key: 'newOwner', label: 'مالک / سهمدار جدید', required: true }, { key: 'transferPercent', label: 'فیصدی انتقال', type: 'number' }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date' }] },
  { id: 'name-change', title: 'تغییر نام شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldName', label: 'نام قبلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'approvalReference', label: 'مرجع / شماره تأیید' }] },
  { id: 'location-change', title: 'تغییر موقعیت شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true }, { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }] },
  { id: 'license-suspension', title: 'تعلیق جواز شرکت', category: 'وضعیت جواز', fields: [...companyFields, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea' }] },
  { id: 'agency-suspension', title: 'تعلیق اجازه‌نامه نمایندگی', category: 'وضعیت نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea' }] },
  { id: 'license-closure', title: 'ترک پیشه جواز فعالیت شرکت', category: 'ترک پیشه', fields: [...companyFields, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }] },
  { id: 'agency-closure', title: 'ترک پیشه اجازه‌نامه نمایندگی', category: 'ترک پیشه', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }] },
  { id: 'agency-closure-permit', title: 'ترک پیشه اجازه‌نامه نمایندگی (فورم مستقل)', category: 'ترک پیشه', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'permitNo', label: 'شماره اجازه‌نامه' }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'statement', label: 'تعهد و توضیحات', type: 'textarea' }] },
  { id: 'commencement-letter', title: 'مکتوب آغاز فعالیت', category: 'فعالیت', fields: [...companyFields, { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date' }, { key: 'authorizedPerson', label: 'شخص مجاز' }, { key: 'letterReference', label: 'شماره مکتوب' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
];

const masterValues: Values = {
  companyName: profile.legalName, formerName: profile.formerName, englishName: profile.englishName, licenseNo: profile.licenseNo,
  province: profile.province, address: profile.meetingPlace, branches: profile.branches.join('، '),
  shareholderName: profile.shareholders[0].name, sharePercent: String(profile.shareholders[0].sharePercent),
  oldOwner: profile.formerShareholders[0].name, newOwner: profile.shareholders[0].name, transferPercent: '100',
  oldName: profile.formerName, newName: profile.legalName,
  newRepresentative: profile.kabulRepresentative.name, agencyManager: profile.kabulRepresentative.name,
  complianceOfficer: `${profile.complianceOfficer.name} ولد ${profile.complianceOfficer.fatherName}`,
  officerIdentityNo: profile.complianceOfficer.identityNo, officerEducation: profile.complianceOfficer.education,
  authorizedPerson: profile.kabulRepresentative.name,
};

function initialValues(form: FormDef): Values { return Object.fromEntries(form.fields.map(f => [f.key, masterValues[f.key] ?? ''])); }

export default function DabAllFormsOperationalWorkspace({ companyId }: { companyId: string }) {
  const { activeCompany } = useCompany();
  const [activeId, setActiveId] = useState('license-renewal');
  const [values, setValues] = useState<Record<string, Values>>(() => Object.fromEntries(forms.map(f => [f.id, initialValues(f)])));
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  const active = forms.find(f => f.id === activeId) ?? forms[0]; const current = values[active.id] ?? initialValues(active);
  const filtered = useMemo(() => { const q = search.trim().toLocaleLowerCase(); return q ? forms.filter(f => `${f.title} ${f.category}`.toLocaleLowerCase().includes(q)) : forms; }, [search]);
  const update = (key: string, value: string) => setValues(s => ({ ...s, [active.id]: { ...(s[active.id] ?? initialValues(active)), [key]: value } }));
  const saveAll = async () => { setBusy(true); try { await Promise.all(forms.map(f => setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${f.id}`), { formId: f.id, title: f.title, category: f.category, company: profile.legalName, values: values[f.id] ?? initialValues(f), source: 'company-master-profile', updatedAt: new Date().toISOString() }, { merge: true }))); setStatus('تمام ۱۸ فورم با معلومات مرکزی شرکت به‌روزرسانی و ذخیره شد.'); } catch (e) { setStatus(e instanceof Error ? e.message : 'ذخیره ناموفق بود.'); } finally { setBusy(false); } };
  const loadAll = async () => { setBusy(true); try { const next: Record<string, Values> = {}; for (const f of forms) { const snap = await getDoc(doc(db, `companies/${companyId}/dabOfficialForms/${f.id}`)); next[f.id] = snap.exists() ? { ...initialValues(f), ...(snap.data().values ?? {}) } : initialValues(f); } setValues(next); setStatus('تمام فورم‌ها خوانده شد.'); } catch (e) { setStatus(e instanceof Error ? e.message : 'خواندن ناموفق بود.'); } finally { setBusy(false); } };
  const completion = (f: FormDef) => { const req = f.fields.filter(x => x.required); if (!req.length) return 100; const data = values[f.id] ?? initialValues(f); return Math.round(req.filter(x => Boolean(data[x.key])).length * 100 / req.length); };
  const exportCase = () => { const blob = new Blob([JSON.stringify({ company: profile, meeting: { number: profile.meetingNo, date: profile.meetingDate, time: profile.meetingTime, place: profile.meetingPlace }, forms: forms.map(f => ({ id: f.id, title: f.title, category: f.category, values: values[f.id] ?? initialValues(f) })) }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'barakatullah-ghafouri-dab-case.json'; a.click(); URL.revokeObjectURL(a.href); };
  return <main dir="rtl" className="min-h-screen bg-slate-50 p-4"><section className="mx-auto max-w-7xl space-y-4"><header className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold">مرکز فورم‌های DAB — برکت‌الله غفوری</h1><p className="text-sm text-slate-500">{profile.legalName} · جواز {profile.licenseNo} · مالکیت 100٪</p></div><div className="flex flex-wrap gap-2"><button onClick={loadAll} disabled={busy} className="rounded-lg border px-4 py-2">خواندن</button><button onClick={saveAll} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-white">ذخیره تمام ۱۸ فورم</button><button onClick={exportCase} className="rounded-lg border px-4 py-2">خروجی پرونده</button><button onClick={() => window.print()} className="rounded-lg border px-4 py-2">چاپ</button></div></div>{status && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm">{status}</p>}</header><div className="grid gap-4 lg:grid-cols-[320px_1fr]"><aside className="rounded-2xl bg-white p-3 shadow-sm"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی فورم..." className="mb-3 w-full rounded-lg border px-3 py-2" />{filtered.map(f => <button key={f.id} onClick={() => setActiveId(f.id)} className={`mb-1 w-full rounded-lg p-3 text-right ${active.id === f.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}><div className="font-medium">{f.title}</div><div className="text-xs opacity-70">{f.category} · {completion(f)}%</div></button>)}</aside><section className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-5 border-b pb-4"><h2 className="text-xl font-bold">{active.title}</h2><p className="text-sm text-slate-500">{active.category}</p></div><div className="grid gap-4 md:grid-cols-2">{active.fields.map(f => <label key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}><span className="mb-1 block text-sm font-medium">{f.label}{f.required && <b className="mr-1 text-red-600">*</b>}</span>{f.type === 'textarea' ? <textarea value={current[f.key] ?? ''} onChange={e => update(f.key, e.target.value)} className="min-h-28 w-full rounded-lg border p-3" /> : <input type={f.type ?? 'text'} value={current[f.key] ?? ''} onChange={e => update(f.key, e.target.value)} className="w-full rounded-lg border px-3 py-2" />}</label>)}</div><div className="mt-6 flex gap-2"><button onClick={async () => { setBusy(true); await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${active.id}`), { formId: active.id, title: active.title, category: active.category, company: profile.legalName, values: current, updatedAt: new Date().toISOString() }, { merge: true }); setBusy(false); setStatus('فورم فعال ذخیره شد.'); }} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-white">ذخیره فورم</button></div></section></div></section></main>;
}
