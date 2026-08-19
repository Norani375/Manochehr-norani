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
  { title: 'بخش اول: مشخصات شرکت صرافی و خدمات پولی', fields: companyFields },
  { title: 'بخش دوم: مشخصات نمایندگی‌های تحت اثر و نمایندگان', fields: [...representativeFields(1), ...representativeFields(2), ...representativeFields(3)] },
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
  if (id === 'agency-renewal') return [common, { title: 'معلومات تمدید نمایندگی', fields: [...representativeFields(1), { key: 'applicationDate', label: 'تاریخ درخواست', type: 'date', required: true }, { key: 'declaration', label: 'تعهد', type: 'textarea', required: true }, { key: 'signatureName', label: 'نام مسئول عملیات', required: true }, { key: 'signatureDate', label: 'تاریخ امضا', type: 'date', required: true }] }];
  if (id === 'shareholder-employee-profile') return [{ title: 'شهرت سهمدار / کارمند', fields: [{ key: 'position', label: 'موقف در شرکت', required: true }, { key: 'fullName', label: 'نام و تخلص', required: true }, { key: 'fatherName', label: 'نام پدر', required: true }, { key: 'grandfatherName', label: 'نام پدرکلان' }, { key: 'identityNo', label: 'شماره تذکره / سند هویت', required: true }, { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' }, { key: 'education', label: 'سویه تحصیلی' }, { key: 'field', label: 'رشته' }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'phone', label: 'شماره تماس' }, { key: 'address', label: 'آدرس', type: 'textarea' }] }];
  if (id === 'shareholder-guarantee') return [{ title: 'معلومات ضمانت سر سهمدار / سهمداران', fields: [{ key: 'shareholderName', label: 'نام سهمدار', required: true }, { key: 'guarantorName', label: 'نام تضمین‌کننده', required: true }, { key: 'guarantorFather', label: 'نام پدر تضمین‌کننده' }, { key: 'guarantorIdentity', label: 'نمبر تذکره تضمین‌کننده' }, { key: 'guarantorBusiness', label: 'تشبث / جواز تضمین‌کننده', type: 'textarea' }, { key: 'guaranteeUndertaking', label: 'تعهد تضمین‌کننده', type: 'textarea', required: true }] }];
  if (id === 'ownership-transfer') return [common, { title: 'انتقال مالکیت', fields: [{ key: 'oldOwner', label: 'سهمدار انتقال‌دهنده', required: true }, { key: 'newOwner', label: 'سهمدار انتقال‌گیرنده', required: true }, { key: 'transferPercent', label: 'فیصدی انتقال', type: 'number', required: true }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date', required: true }, { key: 'reason', label: 'دلیل انتقال', type: 'textarea' }] }];
  if (id === 'name-change') return [common, { title: 'تغییر نام شرکت', fields: [{ key: 'oldName', label: 'نام قبلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' }] }];
  if (id === 'location-change') return [common, { title: 'تغییر موقعیت', fields: [{ key: 'oldAddress', label: 'موقعیت قبلی', type: 'textarea', required: true }, { key: 'newAddress', label: 'موقعیت جدید', type: 'textarea', required: true }, { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true }] }];
  if (id.includes('suspension')) return [common, { title: 'تعلیق جواز', fields: [{ key: 'effectiveDate', label: 'تاریخ اجرا', type: 'date', required: true }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true }] }];
  if (id.includes('closure')) return [common, { title: 'ترک پیشه', fields: [{ key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true }, { key: 'settlement', label: 'تصفیه حساب و اسناد', type: 'textarea' }] }];
  if (id === 'commencement-letter') return [common, { title: 'مکتوب آغاز فعالیت', fields: [{ key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true }, { key: 'authorizedPerson', label: 'شخص مجاز', required: true }, { key: 'authorizedPhone', label: 'شماره تماس' }] }];
  return [common, { title: 'معلومات تکمیلی', fields: [{ key: 'notes', label: 'توضیحات', type: 'textarea' }] }];
}

function validate(sections: Section[], values: Values): string[] {
  return sections.flatMap((section) => section.fields).filter((field) => field.required && !values[field.key]?.trim()).map((field) => field.label);
}

function Input({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  if (field.type === 'textarea') return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full border border-slate-700 bg-white p-2 text-sm outline-none" />;
  return <input type={field.type ?? 'text'} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-slate-700 bg-white p-2 text-sm outline-none" />;
}

function Cell({ field, values, update }: { field: Field; values: Values; update: (key: string, value: string) => void }) {
  return <td className="border border-slate-700 p-1 align-top"><div className="mb-1 text-[11px] font-semibold">{field.label}{field.required ? ' *' : ''}</div><Input field={field} value={values[field.key] ?? ''} onChange={(value) => update(field.key, value)} /></td>;
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
    const missing = validate(sections, values);
    if (missing.length) {
      setMessage(`این فیلدها ضروری است: ${missing.slice(0, 5).join('، ')}${missing.length > 5 ? ' و موارد دیگر.' : '.'}`);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), { formId: form.id, officialTitle: form.title, category: form.category, sourceUrl: form.sourceUrl, values, status: 'draft', updatedAt: new Date().toISOString() }, { merge: true });
      setMessage('فورم با موفقیت ذخیره شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره فورم موفق نشد.');
    } finally {
      setSaving(false);
    }
  };

  const applicationDate = values.applicationDate ? new Date(values.applicationDate) : null;
  const expiryDate = values.currentLicenseExpiryDate ? new Date(values.currentLicenseExpiryDate) : null;
  const daysBeforeExpiry = applicationDate && expiryDate ? Math.ceil((expiryDate.getTime() - applicationDate.getTime()) / 86400000) : null;
  const renewal = form.id === DAB_RENEWAL_FORM_ID;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-xl border bg-white p-4 print:hidden">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="font-bold">مرکز فورم‌های د افغانستان بانک</p><p className="text-xs text-slate-500">فورم دیجیتال برای خانه‌پری و چاپ. نسخه چاپی باید با آخرین سند رسمی DAB تطبیق شود.</p></div>
            <div className="flex gap-2"><button onClick={() => window.print()} className="border px-4 py-2 text-sm">چاپ</button><button disabled={saving} onClick={save} className="bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'در حال ذخیره...' : 'ذخیره Draft'}</button></div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr] print:block">
          <aside className="rounded-xl border bg-white p-3 print:hidden">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی فورم" className="mb-3 w-full border p-2 text-sm" />
            <div className="max-h-[75vh] space-y-1 overflow-auto">{visibleForms.map((item) => <button key={item.id} onClick={() => { setActiveId(item.id); setValues({}); setMessage(''); }} className={`w-full border p-3 text-right text-sm ${item.id === form.id ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}><span className="block font-semibold">{item.title}</span><span className="text-xs opacity-70">{item.category}</span></button>)}</div>
          </aside>

          <article className="form-page bg-white shadow-sm print:shadow-none">
            <header className="border-2 border-slate-800 p-4 text-center">
              <div className="text-sm font-bold">د افغانستان بانک</div>
              <div className="text-xs">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</div>
              <h1 className="mt-2 text-lg font-bold">فورم درخواستی تمدید جواز شرکت صرافی و خدمات پولی</h1>
              <div className="mt-2 text-xs">فورم جوازدهی شرکت‌های صرافی و خدمات پولی</div>
            </header>

            {renewal ? (
              <div className="border-x-2 border-b-2 border-slate-800">
                <section className="border-b-2 border-slate-800 p-3">
                  <h2 className="mb-2 text-sm font-bold">بخش اول: لطفاً مشخصات شرکت صرافی و خدمات پولی را درج نمایید</h2>
                  <table className="w-full border-collapse"><tbody>
                    <tr><Cell field={companyFields[0]} values={values} update={update} /><Cell field={companyFields[1]} values={values} update={update} /><Cell field={companyFields[2]} values={values} update={update} /></tr>
                    <tr><Cell field={companyFields[3]} values={values} update={update} /><Cell field={companyFields[4]} values={values} update={update} /><Cell field={companyFields[5]} values={values} update={update} /></tr>
                    <tr><Cell field={companyFields[6]} values={values} update={update} /><Cell field={companyFields[7]} values={values} update={update} /><Cell field={companyFields[8]} values={values} update={update} /></tr>
                    <tr><Cell field={companyFields[9]} values={values} update={update} /><Cell field={companyFields[10]} values={values} update={update} /><td className="border border-slate-700" /></tr>
                  </tbody></table>
                </section>

                <section className="border-b-2 border-slate-800 p-3">
                  <h2 className="mb-2 text-sm font-bold">بخش دوم: لطفاً مشخصات نمایندگی‌های تحت اثر و نمایندگان را درج نمایید</h2>
                  <div className="overflow-x-auto"><table className="w-full min-w-[1100px] border-collapse text-[11px]"><thead><tr>{['شماره','اسم شرکت و نمایندگی','ولایت سکونت','ولایت فعالیت','ولسوالی / ناحیه','مارکیت','نمبر دکان','شماره نمایندگی','شهرت نماینده باصلاحیت','ولد','نمبر تذکره','شماره تماس'].map((label) => <th key={label} className="border border-slate-700 bg-slate-100 p-1">{label}</th>)}</tr></thead><tbody>{[1, 2, 3].map((index) => <tr key={index}><td className="border border-slate-700 p-2 text-center">{index}</td>{representativeFields(index).map((field) => <Cell key={field.key} field={field} values={values} update={update} />)}</tr>)}</tbody></table></div>
                </section>

                <section className="border-b-2 border-slate-800 p-3">
                  <h2 className="mb-2 text-sm font-bold">بخش سوم: معلومات درخواست تمدید جواز</h2>
                  <table className="w-full border-collapse"><tbody><tr>{renewalSections[2].fields.slice(0, 3).map((field) => <Cell key={field.key} field={field} values={values} update={update} />)}</tr><tr>{renewalSections[2].fields.slice(3).map((field) => <Cell key={field.key} field={field} values={values} update={update} />)}</tr></tbody></table>
                </section>

                <section className="border-b-2 border-slate-800 p-3">
                  <h2 className="mb-2 text-sm font-bold">بخش چهارم: تغییرات و معلومات تکمیلی</h2>
                  <div className="grid grid-cols-2 gap-0">{renewalSections[3].fields.map((field) => <label key={field.key} className="border border-slate-700 p-2"><span className="mb-1 block text-xs font-bold">{field.label}</span><Input field={field} value={values[field.key] ?? ''} onChange={(value) => update(field.key, value)} /></label>)}</div>
                </section>

                <section className="p-3">
                  <h2 className="mb-2 text-sm font-bold">بخش پنجم: اقرار، تعهد و امضا</h2>
                  <div className="border border-slate-700 p-3 text-sm leading-7">اینجانب اقرار می‌نمایم که معلومات این درخواستی و اسناد ضمیمه آن درست و کامل است و در صورت مطالبه، اسناد و معلومات اضافی را به د افغانستان بانک ارائه می‌نمایم.</div>
                  <div className="mt-3 grid grid-cols-3 gap-0">{renewalSections[4].fields.slice(1).map((field) => <label key={field.key} className="border border-slate-700 p-2"><span className="mb-1 block text-xs font-bold">{field.label}</span><Input field={field} value={values[field.key] ?? ''} onChange={(value) => update(field.key, value)} /></label>)}</div>
                  <div className="mt-5 grid grid-cols-3 gap-6 text-center text-sm"><div>امضاء مسئول شرکت: __________________</div><div>مهر شرکت: __________________</div><div>تاریخ: __________________</div></div>
                </section>
              </div>
            ) : (
              <div className="border-x-2 border-b-2 border-slate-800 p-3">{sections.map((section) => <section key={section.title} className="mb-4 border-2 border-slate-800 p-3"><h2 className="mb-3 text-sm font-bold">{section.title}</h2><div className="grid grid-cols-2">{section.fields.map((field) => <label key={field.key} className="border border-slate-700 p-2"><span className="mb-1 block text-xs font-bold">{field.label}{field.required ? ' *' : ''}</span><Input field={field} value={values[field.key] ?? ''} onChange={(value) => update(field.key, value)} /></label>)}</div></section>)}</div>
            )}

            {renewal && <section className="border-x-2 border-b-2 border-slate-800 p-3"><h2 className="mb-2 text-sm font-bold">چک‌لیست اسناد مورد نیاز تمدید</h2><div className="grid grid-cols-2 gap-2 text-xs">{DAB_RENEWAL_REQUIRED_DOCUMENTS.map((item) => <div key={item} className="border border-slate-700 p-2">☐ {item}</div>)}</div>{daysBeforeExpiry !== null && daysBeforeExpiry < 21 && <p className="mt-3 border border-amber-500 bg-amber-50 p-2 text-xs">هشدار: فاصله درخواست تا ختم جواز کمتر از ۲۱ روز است.</p>}</section>}
            {message && <div className="mt-3 rounded border bg-white p-3 text-sm print:hidden">{message}</div>}
          </article>
        </div>
      </div>
      <style jsx global>{`@media print { @page { size: A4; margin: 10mm; } .form-page { width: 100%; } input, textarea { border: 0 !important; background: transparent !important; padding: 0 !important; } .form-page table { page-break-inside: auto; } .form-page tr { page-break-inside: avoid; page-break-after: auto; } }`}</style>
    </main>
  );
}
