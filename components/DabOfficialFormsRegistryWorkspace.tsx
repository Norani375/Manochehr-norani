'use client';

import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DAB_OFFICIAL_FORMS,
  DAB_RENEWAL_FORM_ID,
  DAB_RENEWAL_REQUIRED_DOCUMENTS,
} from '@/lib/dabOfficialFormRegistry';

type Field = { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea'; required?: boolean };
type Values = Record<string, string>;

const common: Field[] = [
  { key: 'companyName', label: 'نام شرکت صرافی و خدمات پولی', required: true },
  { key: 'licenseNo', label: 'شماره جواز', required: true },
  { key: 'province', label: 'ولایت' },
  { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'market', label: 'مارکیت' },
  { key: 'floor', label: 'منزل' },
  { key: 'shopNo', label: 'نمبر دکان' },
  { key: 'address', label: 'آدرس مکمل', type: 'textarea' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'email', label: 'ایمیل' },
];

const fieldsById: Record<string, Field[]> = {
  [DAB_RENEWAL_FORM_ID]: [
    ...common,
    { key: 'licenseExpiryDate', label: 'تاریخ ختم جواز', type: 'date', required: true },
    { key: 'applicationDate', label: 'تاریخ درخواستی تمدید', type: 'date', required: true },
    { key: 'shareholders', label: 'شهرت سهمدار / سهمداران', type: 'textarea' },
    { key: 'representatives', label: 'نمایندگی‌ها و نمایندگان باصلاحیت', type: 'textarea' },
    { key: 'bankAccounts', label: 'حسابات بانکی شرکت', type: 'textarea' },
    { key: 'majorChanges', label: 'تغییرات عمده از درخواست قبلی', type: 'textarea' },
    { key: 'lastYearActivity', label: 'فعالیت شرکت از سال گذشته تا اکنون', type: 'textarea' },
    { key: 'legalClaims', label: 'دعاوی حقوقی / قضایی، در صورت موجودیت', type: 'textarea' },
    { key: 'declaration', label: 'اقرار و تعهد', type: 'textarea', required: true },
  ],
  'license-application': [...common, { key: 'shareholders', label: 'شهرت سهمدار / سهمداران', type: 'textarea' }, { key: 'capital', label: 'سرمایه', type: 'number' }, { key: 'businessScope', label: 'نوع و ساحه فعالیت', type: 'textarea' }],
  'shareholder-employee-profile': [
    { key: 'position', label: 'موقف در شرکت', required: true }, { key: 'fullName', label: 'نام و تخلص', required: true },
    { key: 'fatherName', label: 'نام پدر' }, { key: 'grandfatherName', label: 'نام پدرکلان' }, { key: 'identityNo', label: 'شماره تذکره / سند هویت' },
    { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' }, { key: 'education', label: 'سویه تحصیلی' }, { key: 'field', label: 'رشته' },
    { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'phone', label: 'شماره تماس' }, { key: 'address', label: 'آدرس', type: 'textarea' },
  ],
  'articles': [...common, { key: 'legalBasis', label: 'مبنای حقوقی و شخصیت شرکت', type: 'textarea' }, { key: 'purpose', label: 'هدف شرکت', type: 'textarea' }, { key: 'organization', label: 'تشکیلات شرکت', type: 'textarea' }, { key: 'shareCapital', label: 'سهام و سرمایه', type: 'textarea' }, { key: 'financialRules', label: 'احکام مالی و حسابداری', type: 'textarea' }],
  'agency-establishment': [...common, { key: 'agencyLocation', label: 'موقعیت نمایندگی', type: 'textarea', required: true }, { key: 'agencyRepresentative', label: 'نماینده باصلاحیت', required: true }, { key: 'representativeFather', label: 'ولد' }, { key: 'representativeIdentityNo', label: 'نمبر تذکره' }, { key: 'representativeEducation', label: 'تحصیلات' }],
  'agency-renewal': [...common, { key: 'agencyNo', label: 'شماره نمایندگی', required: true }, { key: 'agencyLocation', label: 'ولایت / محل فعالیت', required: true }, { key: 'agencyRepresentative', label: 'شهرت نماینده باصلاحیت', required: true }, { key: 'representativeIdentityNo', label: 'نمبر تذکره' }, { key: 'boardCertification', label: 'تصدیق هیئت نظار', type: 'textarea' }, { key: 'employeeList', label: 'لیست کارمندان نمایندگی', type: 'textarea' }],
  'shareholder-guarantee': [{ key: 'shareholderName', label: 'نام سهمدار', required: true }, { key: 'guarantorName', label: 'نام تضمین‌کننده', required: true }, { key: 'guarantorFather', label: 'نام پدر تضمین‌کننده' }, { key: 'guarantorIdentity', label: 'نمبر تذکره تضمین‌کننده' }, { key: 'guarantorBusiness', label: 'تشبث / جواز تضمین‌کننده', type: 'textarea' }, { key: 'guaranteeUndertaking', label: 'تعهد تضمین‌کننده', type: 'textarea', required: true }],
  'aml-cft-policy': [...common, { key: 'complianceOfficer', label: 'مسئول رعایت قوانین', required: true }, { key: 'policyVersion', label: 'نسخه پالیسی' }, { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date' }, { key: 'riskAssessment', label: 'ارزیابی خطر', type: 'textarea' }, { key: 'monitoring', label: 'نظارت و گزارش‌دهی', type: 'textarea' }],
};

function fieldsFor(id: string): Field[] {
  if (fieldsById[id]) return fieldsById[id];
  if (id.includes('suspension')) return [...common, { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date' }, { key: 'reason', label: 'دلیل', type: 'textarea', required: true }];
  if (id.includes('closure')) return [...common, { key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true }, { key: 'settlement', label: 'تصفیه حساب و اسناد', type: 'textarea' }];
  if (id === 'commencement-letter') return [...common, { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true }, { key: 'authorizedPerson', label: 'مدیر عملیاتی / شخص مجاز', required: true }];
  if (id.includes('ownership')) return [...common, { key: 'oldOwner', label: 'سهمدار انتقال‌دهنده', required: true }, { key: 'newOwner', label: 'سهمدار انتقال‌گیرنده', required: true }, { key: 'transferPercent', label: 'فیصدی انتقال', type: 'number' }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date' }];
  if (id.includes('name-change')) return [...common, { key: 'oldName', label: 'نام قبلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }];
  if (id.includes('location-change')) return [...common, { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true }, { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' }];
  if (id.includes('agency-change')) return [...common, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'changeType', label: 'نوع تغییر', required: true }, { key: 'oldRepresentative', label: 'نماینده قبلی' }, { key: 'newRepresentative', label: 'نماینده جدید' }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }];
  return [...common, { key: 'notes', label: 'توضیحات', type: 'textarea' }];
}

export default function DabOfficialFormsRegistryWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [activeId, setActiveId] = useState(DAB_RENEWAL_FORM_ID);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const form = DAB_OFFICIAL_FORMS.find((item) => item.id === activeId) ?? DAB_OFFICIAL_FORMS[0];
  const fields = useMemo(() => fieldsFor(form.id), [form.id]);
  const visibleForms = DAB_OFFICIAL_FORMS.filter((item) => `${item.title} ${item.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), {
        formId: form.id,
        officialTitle: form.title,
        category: form.category,
        sourceUrl: form.sourceUrl,
        values,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setMessage('فورم ذخیره شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره فورم موفق نشد.');
    } finally {
      setSaving(false);
    }
  };

  const print = () => window.print();

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">د افغانستان بانک</p>
              <h1 className="text-2xl font-bold">فورم‌های رسمی شرکت‌های صرافی و خدمات پولی</h1>
              <p className="mt-1 text-sm text-slate-500">مرجع فورم‌ها: دستورالعمل‌ها و فورمه‌های جوازدهی DAB</p>
            </div>
            <div className="flex gap-2">
              <button onClick={print} className="rounded-lg border px-4 py-2 text-sm">چاپ</button>
              <button disabled={saving} onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'در حال ذخیره...' : 'ذخیره فورم'}</button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border bg-white p-4 shadow-sm">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی فورم" className="mb-3 w-full rounded-lg border p-2" />
            <div className="max-h-[70vh] space-y-1 overflow-auto">
              {visibleForms.map((item) => (
                <button key={item.id} onClick={() => { setActiveId(item.id); setValues({}); }} className={`w-full rounded-lg p-3 text-right text-sm ${item.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block opacity-70">{item.category}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 border-b pb-4">
              <p className="text-xs font-semibold text-slate-500">عنوان رسمی فورم</p>
              <h2 className="text-xl font-bold">{form.title}</h2>
              <p className="mt-2 text-xs text-slate-500">این فورم دیجیتال برای جمع‌آوری معلومات است و نباید به‌عنوان نسخه چاپی رسمی DAB معرفی شود.</p>
            </div>

            {form.id === DAB_RENEWAL_FORM_ID && (
              <div className="mb-5 rounded-xl border p-4">
                <h3 className="mb-3 font-bold">اسناد لازم برای تمدید جواز</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {DAB_RENEWAL_REQUIRED_DOCUMENTS.map((item) => <div key={item.key} className="rounded-lg bg-slate-50 p-3 text-sm"><strong>{item.title}</strong><div className="text-xs text-slate-500">{item.legalBasis}{'quantity' in item && item.quantity ? ` — ${item.quantity} قطعه` : ''}</div></div>)}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-sm font-semibold">{field.label}{field.required ? ' *' : ''}</span>
                  {field.type === 'textarea' ? <textarea value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} rows={4} className="w-full rounded-lg border p-2" /> : <input type={field.type ?? 'text'} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} required={field.required} className="w-full rounded-lg border p-2" />}
                </label>
              ))}
            </div>

            {message && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
