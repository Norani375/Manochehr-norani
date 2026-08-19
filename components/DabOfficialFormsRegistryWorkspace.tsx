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
  { key: 'licenseNo', label: 'شماره جواز شرکت', required: true },
  { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date', required: true },
  { key: 'centralOfficeLocation', label: 'موقعیت دفتر مرکزی', required: true },
  { key: 'province', label: 'ولایت', required: true },
  { key: 'district', label: 'ولسوالی / ناحیه', required: true },
  { key: 'market', label: 'مارکیت', required: true },
  { key: 'shopNo', label: 'نمبر دکان', required: true },
  { key: 'companyPhone', label: 'شماره تیلیفون شرکت', required: true },
  { key: 'companyContactPhone', label: 'شماره تماس با شرکت', required: true },
  { key: 'email', label: 'آدرس ایمیل شرکت' },
];

const representativeFields = (index: number): Field[] => [
  { key: `rep${index}CompanyName`, label: 'اسم شرکت صرافی و خدمات پولی نمایندگی' },
  { key: `rep${index}ResidenceProvince`, label: 'ولایت سکونت نماینده' },
  { key: `rep${index}ActivityProvince`, label: 'ولایت محل فعالیت' },
  { key: `rep${index}District`, label: 'ولسوالی / ناحیه' },
  { key: `rep${index}Market`, label: 'اسم مارکیت' },
  { key: `rep${index}ShopNo`, label: 'نمبر دکان' },
  { key: `rep${index}AgencyNo`, label: 'شماره نمایندگی' },
  { key: `rep${index}FullName`, label: 'شهرت مکمل نماینده باصلاحیت' },
  { key: `rep${index}FatherName`, label: 'ولد' },
  { key: `rep${index}TazkiraNo`, label: 'نمبر تذکره' },
  { key: `rep${index}Phone`, label: 'شماره تماس نماینده' },
];

const renewalSections: Section[] = [
  {
    title: 'بخش اول: مشخصات شرکت صرافی و خدمات پولی',
    fields: companyFields,
  },
  {
    title: 'بخش دوم: مشخصات نمایندگی‌های تحت اثر و نمایندگان',
    fields: [...representativeFields(1), ...representativeFields(2), ...representativeFields(3)],
  },
  {
    title: 'بخش سوم: معلومات تمدید جواز',
    fields: [
      { key: 'applicationDate', label: 'تاریخ درخواست تمدید جواز', type: 'date', required: true },
      { key: 'currentLicenseExpiryDate', label: 'تاریخ ختم جواز فعلی', type: 'date', required: true },
      { key: 'authorizedName', label: 'شهرت مسئول باصلاحیت شرکت', required: true },
      { key: 'authorizedPosition', label: 'موقف مسئول باصلاحیت', required: true },
      { key: 'authorizedPhone', label: 'شماره تماس مسئول باصلاحیت', required: true },
      { key: 'operationManager', label: 'نام مسئول عملیات', required: true },
      { key: 'operationManagerPhone', label: 'شماره تماس مسئول عملیات', required: true },
    ],
  },
  {
    title: 'بخش چهارم: تغییرات و معلومات تکمیلی',
    fields: [
      { key: 'servicesProvided', label: 'انواع خدماتی که شرکت عرضه می‌کند', type: 'textarea' },
      { key: 'majorChanges', label: 'تغییرات نسبت به معلومات قبلی', type: 'textarea' },
      { key: 'updatedInformation', label: 'معلومات و مدارک به‌روزشده', type: 'textarea' },
      { key: 'taxClearanceInfo', label: 'معلومات تصفیه مالیاتی و TIN', type: 'textarea' },
      { key: 'otherDabInformation', label: 'سایر معلومات مورد مطالبه د افغانستان بانک', type: 'textarea' },
    ],
  },
  {
    title: 'بخش پنجم: اقرار، تعهد و امضا',
    fields: [
      { key: 'declaration', label: 'اقرار و تعهد متقاضی', type: 'textarea', required: true },
      { key: 'signatureName', label: 'نام و تخلص امضاکننده', required: true },
      { key: 'signaturePosition', label: 'موقف امضاکننده', required: true },
      { key: 'signatureDate', label: 'تاریخ امضا', type: 'date', required: true },
    ],
  },
];

function sectionsFor(id: string): Section[] {
  if (id === DAB_RENEWAL_FORM_ID) return renewalSections;

  const common: Section = { title: 'معلومات اساسی شرکت', fields: companyFields };

  if (id === 'agency-renewal') {
    return [common, {
      title: 'معلومات تمدید نمایندگی',
      fields: [
        ...representativeFields(1),
        { key: 'applicationDate', label: 'تاریخ درخواست', type: 'date', required: true },
        { key: 'declaration', label: 'تعهد', type: 'textarea', required: true },
        { key: 'signatureName', label: 'نام مسئول عملیات', required: true },
        { key: 'signatureDate', label: 'تاریخ امضا', type: 'date', required: true },
      ],
    }];
  }

  if (id === 'shareholder-employee-profile') return [{
    title: 'شهرت سهمدار / کارمند',
    fields: [
      { key: 'position', label: 'موقف در شرکت', required: true },
      { key: 'fullName', label: 'نام و تخلص', required: true },
      { key: 'fatherName', label: 'نام پدر', required: true },
      { key: 'grandfatherName', label: 'نام پدرکلان' },
      { key: 'identityNo', label: 'شماره تذکره / سند هویت', required: true },
      { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' },
      { key: 'education', label: 'سویه تحصیلی' },
      { key: 'field', label: 'رشته' },
      { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' },
      { key: 'phone', label: 'شماره تماس' },
      { key: 'address', label: 'آدرس', type: 'textarea' },
    ],
  }];

  if (id === 'shareholder-guarantee') return [{
    title: 'معلومات ضمانت سر سهمدار / سهمداران',
    fields: [
      { key: 'shareholderName', label: 'نام سهمدار', required: true },
      { key: 'guarantorName', label: 'نام تضمین‌کننده', required: true },
      { key: 'guarantorFather', label: 'نام پدر تضمین‌کننده' },
      { key: 'guarantorIdentity', label: 'نمبر تذکره تضمین‌کننده' },
      { key: 'guarantorBusiness', label: 'تشبث / جواز تضمین‌کننده', type: 'textarea' },
      { key: 'guaranteeUndertaking', label: 'تعهد تضمین‌کننده', type: 'textarea', required: true },
    ],
  }];

  if (id === 'ownership-transfer') return [common, {
    title: 'انتقال مالکیت',
    fields: [
      { key: 'oldOwner', label: 'سهمدار انتقال‌دهنده', required: true },
      { key: 'newOwner', label: 'سهمدار انتقال‌گیرنده', required: true },
      { key: 'transferPercent', label: 'فیصدی انتقال', type: 'number', required: true },
      { key: 'transferDate', label: 'تاریخ انتقال', type: 'date', required: true },
      { key: 'reason', label: 'دلیل انتقال', type: 'textarea' },
    ],
  }];

  if (id === 'name-change') return [common, {
    title: 'تغییر نام شرکت',
    fields: [
      { key: 'oldName', label: 'نام قبلی', required: true },
      { key: 'newName', label: 'نام جدید', required: true },
      { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true },
      { key: 'reason', label: 'دلیل تغییر', type: 'textarea' },
    ],
  }];

  if (id === 'location-change') return [common, {
    title: 'تغییر موقعیت',
    fields: [
      { key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true },
      { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true },
      { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true },
    ],
  }];

  if (id.includes('suspension')) return [common, {
    title: 'تعلیق جواز',
    fields: [
      { key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date', required: true },
      { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true },
    ],
  }];

  if (id.includes('closure')) return [common, {
    title: 'ترک پیشه',
    fields: [
      { key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true },
      { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true },
      { key: 'settlement', label: 'تصفیه حساب و اسناد', type: 'textarea' },
    ],
  }];

  if (id === 'commencement-letter') return [common, {
    title: 'مکتوب آغاز فعالیت',
    fields: [
      { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true },
      { key: 'authorizedPerson', label: 'شخص مجاز', required: true },
      { key: 'authorizedPhone', label: 'شماره تماس' },
    ],
  }];

  return [common, { title: 'معلومات تکمیلی', fields: [{ key: 'notes', label: 'توضیحات', type: 'textarea' }] }];
}

function validate(sections: Section[], values: Values): string[] {
  return sections.flatMap((section) => section.fields)
    .filter((field) => field.required && !values[field.key]?.trim())
    .map((field) => field.label);
}

export default function DabOfficialFormsRegistryWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [activeId, setActiveId] = useState(DAB_RENEWAL_FORM_ID);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const form = DAB_OFFICIAL_FORMS.find((item) => item.id === activeId) ?? DAB_OFFICIAL_FORMS[0];
  const sections = useMemo(() => sectionsFor(form.id), [form.id]);
  const visibleForms = DAB_OFFICIAL_FORMS.filter((item) =>
    `${item.title} ${item.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    const missing = validate(sections, values);
    if (missing.length > 0) {
      setMessage(`این فیلدها ضروری است: ${missing.slice(0, 5).join('، ')}${missing.length > 5 ? ' و موارد دیگر.' : '.'}`);
      return;
    }

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
      setMessage('فورم با موفقیت ذخیره شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره فورم موفق نشد.');
    } finally {
      setSaving(false);
    }
  };

  const renewal = form.id === DAB_RENEWAL_FORM_ID;
  const applicationDate = values.applicationDate ? new Date(values.applicationDate) : null;
  const expiryDate = values.currentLicenseExpiryDate ? new Date(values.currentLicenseExpiryDate) : null;
  const daysBeforeExpiry = applicationDate && expiryDate
    ? Math.ceil((expiryDate.getTime() - applicationDate.getTime()) / 86400000)
    : null;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border bg-white p-5 shadow-sm print:rounded-none print:border-b-2 print:shadow-none">
          <div className="text-center">
            <p className="text-sm font-semibold">د افغانستان بانک</p>
            <p className="text-xs text-slate-500">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p>
            <h1 className="mt-2 text-xl font-bold">{form.title}</h1>
            <p className="mt-1 text-xs text-slate-500">نسخه دیجیتال بر اساس فورم و اسناد منتشرشده د افغانستان بانک.</p>
          </div>
          <div className="mt-4 flex justify-end gap-2 print:hidden">
            <button onClick={() => window.print()} className="rounded-lg border px-4 py-2 text-sm">چاپ</button>
            <button disabled={saving} onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
              {saving ? 'در حال ذخیره...' : 'ذخیره فورم'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] print:block">
          <aside className="rounded-2xl border bg-white p-4 shadow-sm print:hidden">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی فورم" className="mb-3 w-full rounded-lg border p-2" />
            <div className="max-h-[70vh] space-y-1 overflow-auto">
              {visibleForms.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveId(item.id); setValues({}); setMessage(''); }}
                  className={`w-full rounded-lg p-3 text-right text-sm ${item.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                >
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block opacity-70">{item.category}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            {renewal && daysBeforeExpiry !== null && daysBeforeExpiry < 21 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
                هشدار: فاصله درخواست تا ختم جواز کمتر از ۲۱ روز است. تاریخ و اسناد را بررسی کنید.
              </div>
            )}

            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border bg-white p-5 shadow-sm print:rounded-none print:shadow-none">
                <h2 className="mb-4 border-b pb-3 text-base font-bold">{section.title}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <span className="mb-1 block text-sm font-medium">
                        {field.label}{field.required ? ' *' : ''}
                      </span>
                      {field.type === 'textarea' ? (
                        <textarea value={values[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} rows={4} className="w-full rounded-lg border p-2" />
                      ) : (
                        <input type={field.type ?? 'text'} value={values[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} className="w-full rounded-lg border p-2" />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ))}

            {renewal && (
              <section className="rounded-2xl border bg-white p-5 shadow-sm print:rounded-none print:shadow-none">
                <h2 className="mb-4 border-b pb-3 text-base font-bold">اسناد مورد نیاز تمدید</h2>
                <ul className="list-disc space-y-2 pr-5 text-sm">
                  {DAB_RENEWAL_REQUIRED_DOCUMENTS.map((document) => <li key={document}>{document}</li>)}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  این چک‌لیست از مقررات و منابع رسمی DAB گرفته شده است. سند نهایی باید با آخرین نسخه منتشرشده DAB تطبیق شود.
                </p>
              </section>
            )}

            {message && <div className="rounded-xl border bg-white p-4 text-sm print:hidden">{message}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
