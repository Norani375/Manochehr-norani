'use client';

import { useMemo, useState } from 'react';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCompany } from '@/lib/companyContext';

type FieldType = 'text' | 'date' | 'number' | 'textarea' | 'checkbox';
type Field = { key: string; label: string; type?: FieldType; required?: boolean };
type FormDef = { id: string; title: string; category: string; fields: Field[] };
type Values = Record<string, string | boolean>;

const companyFields: Field[] = [
  { key: 'companyName', label: 'نام رسمی شرکت', required: true },
  { key: 'licenseNo', label: 'شماره جواز', required: true },
  { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date' },
  { key: 'licenseExpiryDate', label: 'تاریخ ختم جواز', type: 'date' },
  { key: 'tin', label: 'نمبر تشخیصیه مالیاتی (TIN)' },
  { key: 'province', label: 'ولایت' },
  { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'address', label: 'آدرس مکمل', type: 'textarea' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'email', label: 'ایمیل' },
];

const personFields: Field[] = [
  { key: 'fullName', label: 'نام و تخلص', required: true },
  { key: 'fatherName', label: 'نام پدر' },
  { key: 'grandfatherName', label: 'نام پدرکلان' },
  { key: 'identityNo', label: 'شماره تذکره / سند هویت' },
  { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' },
  { key: 'nationality', label: 'تابعیت' },
  { key: 'occupation', label: 'وظیفه / پیشه' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'address', label: 'آدرس', type: 'textarea' },
];

const forms: FormDef[] = [
  { id: 'license-application', title: 'درخواست اخذ جواز فعالیت شرکت صرافی و خدمات پولی', category: 'جوازدهی', fields: [...companyFields, { key: 'capital', label: 'سرمایه' }, { key: 'businessScope', label: 'نوع و ساحه فعالیت', type: 'textarea' }, { key: 'authorizedRepresentative', label: 'نماینده باصلاحیت' }] },
  { id: 'license-renewal', title: 'درخواست تمدید جواز فعالیت شرکت صرافی و خدمات پولی', category: 'تمدید', fields: [...companyFields, { key: 'renewalDate', label: 'تاریخ درخواست', type: 'date', required: true }, { key: 'renewalReason', label: 'درخواست / توضیحات تمدید', type: 'textarea' }, { key: 'taxClearanceNo', label: 'شماره تصفیه مالیاتی' }, { key: 'criminalClearanceNo', label: 'شماره تصدیق عدم مسئولیت جنایی' }] },
  { id: 'shareholder-employee-profile', title: 'شهرت سهمدار / کارمند شرکت صرافی و خدمات پولی', category: 'اشخاص', fields: personFields },
  { id: 'articles', title: 'اساسنامه شرکت صرافی و خدمات پولی', category: 'شرکت', fields: [...companyFields, { key: 'registrationDate', label: 'تاریخ ثبت', type: 'date' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-establishment', title: 'ایجاد نمایندگی و معرفی نماینده باصلاحیت', category: 'نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'agencyProvince', label: 'ولایت نمایندگی' }, { key: 'agencyDistrict', label: 'ولسوالی / ناحیه نمایندگی' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }] },
  { id: 'agency-renewal', title: 'تمدید نمایندگی شرکت صرافی و خدمات پولی', category: 'تمدید نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'agencyLicenseNo', label: 'شماره اجازه‌نامه نمایندگی' }, { key: 'agencyExpiryDate', label: 'تاریخ ختم اجازه‌نامه', type: 'date' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }] },
  { id: 'shareholder-guarantee', title: 'تضمین سر سهمدار / سهمداران', category: 'تضمین', fields: [...companyFields, { key: 'shareholderName', label: 'نام سهمدار', required: true }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'guaranteeAmount', label: 'مبلغ تضمین', type: 'number' }, { key: 'guaranteeDate', label: 'تاریخ تضمین', type: 'date' }] },
  { id: 'aml-cft-policy', title: 'پالیسی مبارزه با پولشویی و تمویل تروریزم', category: 'AML/CFT', fields: [...companyFields, { key: 'complianceOfficer', label: 'مسئول رعایت قوانین', required: true }, { key: 'policyVersion', label: 'نسخه پالیسی' }, { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date' }, { key: 'riskAssessment', label: 'ارزیابی خطر', type: 'textarea' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-change', title: 'تغییرات نمایندگی', category: 'تغییرات', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'changeType', label: 'نوع تغییر', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }] },
  { id: 'ownership-transfer', title: 'انتقال مالکیت شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldOwner', label: 'مالک / سهمدار قبلی', required: true }, { key: 'newOwner', label: 'مالک / سهمدار جدید', required: true }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date' }, { key: 'transferNotes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'name-change', title: 'تغییر نام شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldName', label: 'نام قبلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'approvalReference', label: 'مرجع / شماره تأیید' }] },
  { id: 'location-change', title: 'تغییر موقعیت شرکت', category: 'تغییرات', fields: [...companyFields, { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true }, { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'approvalReference', label: 'مرجع / شماره تأیید' }] },
  { id: 'license-suspension', title: 'تعلیق جواز شرکت', category: 'وضعیت جواز', fields: [...companyFields, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date', required: true }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true }, { key: 'referenceNo', label: 'شماره مرجع' }] },
  { id: 'agency-suspension', title: 'تعلیق اجازه‌نامه نمایندگی', category: 'وضعیت نمایندگی', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'suspensionDate', label: 'تاریخ تعلیق', type: 'date' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea' }] },
  { id: 'license-closure', title: 'ترک پیشه جواز فعالیت شرکت', category: 'ترک پیشه', fields: [...companyFields, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date', required: true }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }, { key: 'declaration', label: 'تعهد / اقرار', type: 'textarea' }] },
  { id: 'agency-closure', title: 'ترک پیشه اجازه‌نامه نمایندگی', category: 'ترک پیشه', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea' }] },
  { id: 'agency-closure-permit', title: 'ترک پیشه اجازه‌نامه نمایندگی (فورم مستقل)', category: 'ترک پیشه', fields: [...companyFields, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'permitNo', label: 'شماره اجازه‌نامه' }, { key: 'closureDate', label: 'تاریخ ترک پیشه', type: 'date' }, { key: 'statement', label: 'تعهد و توضیحات', type: 'textarea' }] },
  { id: 'commencement-letter', title: 'مکتوب آغاز فعالیت', category: 'فعالیت', fields: [...companyFields, { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true }, { key: 'authorizedPerson', label: 'شخص مجاز' }, { key: 'letterReference', label: 'شماره مکتوب' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
];

function emptyValues(form: FormDef): Values {
  return Object.fromEntries(form.fields.map(field => [field.key, field.type === 'checkbox' ? false : '']));
}

function autoCompanyValues(form: FormDef, name: string, licenseNo: string): Values {
  const values = emptyValues(form);
  if ('companyName' in values) values.companyName = name;
  if ('licenseNo' in values) values.licenseNo = licenseNo;
  return values;
}

export default function DabAllFormsOperationalWorkspace({ companyId }: { companyId: string }) {
  const { activeCompany } = useCompany();
  const [activeId, setActiveId] = useState('license-renewal');
  const [values, setValues] = useState<Record<string, Values>>(() => Object.fromEntries(forms.map(form => [form.id, autoCompanyValues(form, activeCompany.name, activeCompany.licenseNo)])));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const active = forms.find(form => form.id === activeId) ?? forms[0];
  const current = values[active.id] ?? autoCompanyValues(active, activeCompany.name, activeCompany.licenseNo);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term ? forms.filter(form => `${form.title} ${form.category}`.toLocaleLowerCase().includes(term)) : forms;
  }, [search]);

  const update = (key: string, value: string | boolean) => setValues(state => ({ ...state, [active.id]: { ...(state[active.id] ?? emptyValues(active)), [key]: value } }));

  const loadAll = async () => {
    setBusy(true);
    try {
      const next: Record<string, Values> = {};
      for (const form of forms) {
        const snap = await getDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`));
        next[form.id] = snap.exists() ? { ...autoCompanyValues(form, activeCompany.name, activeCompany.licenseNo), ...(snap.data().values ?? {}) } : autoCompanyValues(form, activeCompany.name, activeCompany.licenseNo);
      }
      setValues(next);
      setStatus('تمام فورم‌های موجود از دیتابیس خوانده شد.');
    } catch (error) {
      setStatus(error instanceof Error ? `خواندن اطلاعات ناموفق بود: ${error.message}` : 'خواندن اطلاعات ناموفق بود.');
    } finally { setBusy(false); }
  };

  const saveAll = async () => {
    setBusy(true);
    try {
      await Promise.all(forms.map(form => setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), { formId: form.id, title: form.title, category: form.category, values: values[form.id] ?? emptyValues(form), status: 'draft', updatedAt: new Date().toISOString() }, { merge: true })));
      setStatus('تمام ۱۸ فورم با موفقیت ذخیره شد.');
    } catch (error) {
      setStatus(error instanceof Error ? `ذخیره ناموفق بود: ${error.message}` : 'ذخیره ناموفق بود.');
    } finally { setBusy(false); }
  };

  const completion = (form: FormDef) => {
    const data = values[form.id] ?? emptyValues(form);
    const required = form.fields.filter(field => field.required);
    if (!required.length) return 100;
    return Math.round(required.filter(field => Boolean(data[field.key])).length * 100 / required.length);
  };

  const exportCase = () => {
    const payload = { companyId, company: activeCompany, generatedAt: new Date().toISOString(), forms: forms.map(form => ({ ...form, values: values[form.id] ?? emptyValues(form) })) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `dab-case-${companyId}.json`; anchor.click(); URL.revokeObjectURL(url);
  };

  const printForm = () => window.print();

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 print:bg-white">
      <section className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl bg-white p-5 shadow-sm print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-bold">مرکز عملیاتی فورم‌های DAB</h1><p className="mt-1 text-sm text-slate-500">پرونده: {activeCompany.name} · جواز: {activeCompany.licenseNo}</p></div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button onClick={loadAll} disabled={busy} className="rounded-lg border px-4 py-2">خواندن از دیتابیس</button>
              <button onClick={saveAll} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-white">ذخیره تمام فورم‌ها</button>
              <button onClick={exportCase} className="rounded-lg border px-4 py-2">خروجی پرونده</button>
              <button onClick={printForm} className="rounded-lg border px-4 py-2">چاپ</button>
            </div>
          </div>
          {status && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm">{status}</p>}
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl bg-white p-3 shadow-sm print:hidden">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="جستجوی فورم..." className="mb-3 w-full rounded-lg border px-3 py-2" />
            <div className="max-h-[70vh] space-y-1 overflow-auto">
              {filtered.map(form => <button key={form.id} onClick={() => setActiveId(form.id)} className={`w-full rounded-lg p-3 text-right ${active.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}><div className="font-medium">{form.title}</div><div className="mt-1 flex justify-between text-xs opacity-70"><span>{form.category}</span><span>{completion(form)}%</span></div></button>)}
            </div>
          </aside>

          <section className="rounded-2xl bg-white p-5 shadow-sm print:shadow-none">
            <div className="mb-5 border-b pb-4"><p className="text-xs text-slate-500">{active.category}</p><h2 className="text-xl font-bold">{active.title}</h2><p className="mt-1 text-sm text-slate-500">تکمیل فیلدهای الزامی: {completion(active)}%</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              {active.fields.map(field => <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}><span className="mb-1 block text-sm font-medium">{field.label}{field.required && <b className="mr-1 text-red-600">*</b>}</span>{field.type === 'textarea' ? <textarea value={String(current[field.key] ?? '')} onChange={event => update(field.key, event.target.value)} className="min-h-28 w-full rounded-lg border p-3" /> : field.type === 'checkbox' ? <input type="checkbox" checked={Boolean(current[field.key])} onChange={event => update(field.key, event.target.checked)} className="h-5 w-5" /> : <input type={field.type ?? 'text'} value={String(current[field.key] ?? '')} onChange={event => update(field.key, event.target.value)} className="w-full rounded-lg border px-3 py-2" />}</label>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2 print:hidden"><button onClick={async () => { setBusy(true); await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${active.id}`), { formId: active.id, title: active.title, category: active.category, values: current, status: 'draft', updatedAt: new Date().toISOString() }, { merge: true }); setBusy(false); setStatus('فورم فعال ذخیره شد.'); }} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-white">ذخیره فورم فعال</button><button onClick={printForm} className="rounded-lg border px-4 py-2">چاپ فورم فعال</button></div>
          </section>
        </div>
      </section>
    </main>
  );
}
