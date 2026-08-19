'use client';

import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DAB_OFFICIAL_FORMS,
  DAB_RENEWAL_FORM_ID,
  DAB_RENEWAL_REQUIRED_DOCUMENTS,
} from '@/lib/dabOfficialFormRegistry';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'textarea';
  required?: boolean;
};

type Section = { title: string; fields: Field[] };
type Values = Record<string, string>;

const companyFields: Field[] = [
  { key: 'companyName', label: 'نام شرکت صرافی و خدمات پولی', required: true },
  { key: 'licenseNo', label: 'شماره جواز', required: true },
  { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date', required: true },
  { key: 'centralLocation', label: 'موقعیت مرکزی', required: true },
  { key: 'province', label: 'ولایت', required: true },
  { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'market', label: 'مارکیت' },
  { key: 'shopNo', label: 'نمبر دکان' },
  { key: 'phone', label: 'شماره تیلیفون شرکت' },
  { key: 'email', label: 'آدرس ایمیل' },
];

const renewalSections: Section[] = [
  {
    title: '۱. مشخصات شرکت صرافی و خدمات پولی',
    fields: companyFields,
  },
  {
    title: '۲. معلومات درخواست تمدید جواز',
    fields: [
      { key: 'applicationDate', label: 'تاریخ درخواست تمدید', type: 'date', required: true },
      { key: 'licenseExpiryDate', label: 'تاریخ ختم جواز', type: 'date', required: true },
      { key: 'authorizedName', label: 'نام مسئول باصلاحیت', required: true },
      { key: 'authorizedPosition', label: 'موقف مسئول باصلاحیت', required: true },
      { key: 'authorizedPhone', label: 'شماره تماس مسئول باصلاحیت', required: true },
    ],
  },
  {
    title: '۳. معلومات نمایندگی‌ها و تغییرات عمده',
    fields: [
      { key: 'agencySummary', label: 'معلومات نمایندگی‌های تحت اثر', type: 'textarea' },
      { key: 'majorChanges', label: 'تغییرات عمده نسبت به معلومات قبلی', type: 'textarea' },
      { key: 'updatedInformation', label: 'معلومات و مدارک به‌روزشده', type: 'textarea' },
      { key: 'otherDabInformation', label: 'سایر معلومات مورد مطالبه د افغانستان بانک', type: 'textarea' },
    ],
  },
  {
    title: '۴. اقرار و تعهد متقاضی',
    fields: [
      {
        key: 'declaration',
        label: 'اقرار و تعهد: معلومات ارائه‌شده درست است و اسناد لازم همراه درخواست ارائه می‌شود.',
        type: 'textarea',
        required: true,
      },
      { key: 'signatureName', label: 'نام و تخلص امضاکننده', required: true },
      { key: 'signatureDate', label: 'تاریخ امضا', type: 'date', required: true },
    ],
  },
];

function sectionsFor(id: string): Section[] {
  if (id === DAB_RENEWAL_FORM_ID) return renewalSections;

  const common: Section = { title: 'معلومات اساسی شرکت', fields: companyFields };
  if (id === 'agency-renewal') {
    return [
      common,
      {
        title: 'معلومات نمایندگی',
        fields: [
          { key: 'agencyNo', label: 'شماره نمایندگی', required: true },
          { key: 'agencyLocation', label: 'محل فعالیت نمایندگی', type: 'textarea', required: true },
          { key: 'representativeFullName', label: 'شهرت مکمل نماینده باصلاحیت', required: true },
          { key: 'representativeFather', label: 'ولد' },
          { key: 'representativeTazkira', label: 'نمبر تذکره' },
          { key: 'representativePhone', label: 'شماره تماس' },
        ],
      },
      {
        title: 'تأیید و تعهد',
        fields: [
          { key: 'boardCertification', label: 'تصدیق هیئت نظار', type: 'textarea' },
          { key: 'employeeList', label: 'لیست کارمندان نمایندگی', type: 'textarea' },
          { key: 'declaration', label: 'تعهد', type: 'textarea', required: true },
        ],
      },
    ];
  }
  if (id === 'shareholder-employee-profile') {
    return [{ title: 'شهرت سهمدار / کارمند', fields: [
      { key: 'position', label: 'موقف در شرکت', required: true },
      { key: 'fullName', label: 'نام و تخلص', required: true },
      { key: 'fatherName', label: 'نام پدر' },
      { key: 'grandfatherName', label: 'نام پدرکلان' },
      { key: 'identityNo', label: 'شماره تذکره / سند هویت' },
      { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' },
      { key: 'education', label: 'سویه تحصیلی' },
      { key: 'field', label: 'رشته' },
      { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' },
      { key: 'phone', label: 'شماره تماس' },
      { key: 'address', label: 'آدرس', type: 'textarea' },
    ] }];
  }
  if (id === 'shareholder-guarantee') {
    return [{ title: 'معلومات ضمانت سر سهمدار / سهمداران', fields: [
      { key: 'shareholderName', label: 'نام سهمدار', required: true },
      { key: 'guarantorName', label: 'نام تضمین‌کننده', required: true },
      { key: 'guarantorFather', label: 'نام پدر تضمین‌کننده' },
      { key: 'guarantorIdentity', label: 'نمبر تذکره تضمین‌کننده' },
      { key: 'guarantorBusiness', label: 'تشبث / جواز تضمین‌کننده', type: 'textarea' },
      { key: 'guaranteeUndertaking', label: 'تعهد تضمین‌کننده', type: 'textarea', required: true },
    ] }];
  }
  if (id === 'ownership-transfer') return [common, { title: 'انتقال مالکیت', fields: [
    { key: 'oldOwner', label: 'سهمدار انتقال‌دهنده', required: true },
    { key: 'newOwner', label: 'سهمدار انتقال‌گیرنده', required: true },
    { key: 'transferPercent', label: 'فیصدی انتقال', type: 'number' },
    { key: 'transferDate', label: 'تاریخ انتقال', type: 'date' },
    { key: 'reason', label: 'دلیل انتقال', type: 'textarea' },
  ] }];
  if (id === 'name-change') return [common, { title: 'تغییر نام', fields: [
    { key: 'oldName', label: 'نام قبلی', required: true },
    { key: 'newName', label: 'نام جدید', required: true },
    { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' },
    { key: 'reason', label: 'دلیل تغییر', type: 'textarea' },
  ] }];
  if (id === 'location-change') return [common, { title: 'تغییر موقعیت', fields: [
    { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true },
    { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true },
    { key: 'changeDate', label: 'تاریخ تغییر', type: 'date' },
  ] }];
  if (id.includes('suspension')) return [common, { title: 'تعلیق', fields: [
    { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date', required: true },
    { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true },
  ] }];
  if (id.includes('closure')) return [common, { title: 'ترک پیشه', fields: [
    { key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true },
    { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true },
    { key: 'settlement', label: 'تصفیه حساب و اسناد', type: 'textarea' },
  ] }];
  if (id === 'commencement-letter') return [common, { title: 'مکتوب آغاز فعالیت', fields: [
    { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true },
    { key: 'authorizedPerson', label: 'شخص مجاز', required: true },
  ] }];
  return [common, { title: 'معلومات تکمیلی', fields: [{ key: 'notes', label: 'توضیحات', type: 'textarea' }] }];
}

export default function DabOfficialFormsRegistryWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [activeId, setActiveId] = useState(DAB_RENEWAL_FORM_ID);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const form = DAB_OFFICIAL_FORMS.find((item) => item.id === activeId) ?? DAB_OFFICIAL_FORMS[0];
  const sections = useMemo(() => sectionsFor(form.id), [form.id]);
  const visibleForms = DAB_OFFICIAL_FORMS.filter((item) => `${item.title} ${item.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage('');
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

  const renewal = form.id === DAB_RENEWAL_FORM_ID;
  const applicationDate = values.applicationDate ? new Date(values.applicationDate) : null;
  const expiryDate = values.licenseExpiryDate ? new Date(values.licenseExpiryDate) : null;
  const daysBeforeExpiry = applicationDate && expiryDate
    ? Math.ceil((expiryDate.getTime() - applicationDate.getTime()) / 86400000)
    : null;
  const renewalTimingWarning = renewal && daysBeforeExpiry !== null && daysBeforeExpiry < 21;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border bg-white p-5 shadow-sm print:rounded-none print:border-b-2 print:shadow-none">
          <div className="text-center">
            <p className="text-sm font-semibold">د افغانستان بانک</p>
            <p className="text-xs text-slate-500">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p>
            <h1 className="mt-2 text-xl font-bold">{form.title}</h1>
            <p className="mt-1 text-xs text-slate-500">فورم دیجیتال بر اساس عنوان و اسناد منتشرشده DAB تنظیم شده است.</p>
          </div>
          <div className="mt-4 flex justify-end gap-2 print:hidden">
            <button onClick={() => window.print()} className="rounded-lg border px-4 py-2 text-sm">چاپ</button>
            <button disabled={saving} onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'در حال ذخیره...' : 'ذخیره فورم'}</button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] print:block">
          <aside className="rounded-2xl border bg-white p-4 shadow-sm print:hidden">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی فورم" className="mb-3 w-full rounded-lg border p-2" />
            <div className="max-h-[70vh] space-y-1 overflow-auto">
              {visibleForms.map((item) => (
                <button key={item.id} onClick={() => { setActiveId(item.id); setValues({}); setMessage(''); }} className={`w-full rounded-lg p-3 text-right text-sm ${item.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block opacity-70">{item.category}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border bg-white p-5 shadow-sm print:rounded-none print:border-0 print:shadow-none">
            {renewal && (
              <>
                <div className="mb-5 rounded-xl border p-4">
                  <h2 className="mb-2 font-bold">اسناد مورد نیاز تمدید جواز</h2>
                  <p className="mb-3 text-xs text-slate-600">این فهرست از ماده ۱۵ مقرره شرکت‌های صرافی و خدمات پولی گرفته شده است. برای نسخه نهایی، آخرین سند DAB را مبنا قرار دهید.</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {DAB_RENEWAL_REQUIRED_DOCUMENTS.map((item) => (
                      <div key={item.key} className="rounded-lg bg-slate-50 p-3 text-sm">
                        <strong>{item.title}</strong>
                        <div className="text-xs text-slate-500">{item.legalBasis}{'quantity' in item && item.quantity ? ` — ${item.quantity} قطعه` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {renewalTimingWarning && (
                  <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
                    درخواست کمتر از ۲۱ روز قبل از ختم جواز ثبت شده است. ماده ۱۵ برای متقاضیان مشمول، ارائه درخواست حداقل سه هفته قبل از ختم جواز را بیان می‌کند.
                  </div>
                )}
              </>
            )}

            {sections.map((section) => (
              <fieldset key={section.title} className="mb-6 rounded-xl border p-4">
                <legend className="px-2 text-base font-bold">{section.title}</legend>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : 'block'}>
                      <span className="mb-1 block text-sm font-semibold">{field.label}{field.required ? ' *' : ''}</span>
                      {field.type === 'textarea' ? (
                        <textarea value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} rows={4} className="w-full rounded-lg border p-2" />
                      ) : (
                        <input type={field.type ?? 'text'} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} required={field.required} className="w-full rounded-lg border p-2" />
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="mt-6 border-t pt-4 text-xs text-slate-600">
              <p><strong>منبع رسمی:</strong> دستورالعمل‌ها و فورمه‌های جوازدهی د افغانستان بانک.</p>
              <p className="mt-1">این صفحه سند رسمی DAB نیست. برای ارائه رسمی، نسخه چاپی باید با آخرین فایل رسمی منتشرشده توسط DAB تطبیق شود.</p>
              <p className="mt-1">منبع: https://www.dab.gov.af/dr/node/1949</p>
            </div>
            {message && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm print:hidden">{message}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
