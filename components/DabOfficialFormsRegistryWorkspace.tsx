'use client';

import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DAB_OFFICIAL_FORMS, DAB_RENEWAL_FORM_ID, DAB_RENEWAL_REQUIRED_DOCUMENTS } from '@/lib/dabOfficialFormRegistry';

type Field = { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea'; required?: boolean };
type Section = { title: string; fields: Field[] };
type Values = Record<string, string>;

const company: Field[] = [
  { key: 'companyName', label: 'نام شرکت', required: true }, { key: 'licenseNo', label: 'شماره جواز' },
  { key: 'tin', label: 'شماره تشخیصیه مالیاتی (TIN)' }, { key: 'province', label: 'ولایت', required: true },
  { key: 'district', label: 'ولسوالی / ناحیه' }, { key: 'address', label: 'آدرس مکمل', type: 'textarea' },
  { key: 'phone', label: 'شماره تماس' }, { key: 'email', label: 'ایمیل' },
];

const person = (prefix: string, title: string): Section => ({ title, fields: [
  { key: `${prefix}FullName`, label: 'نام و تخلص', required: true }, { key: `${prefix}FatherName`, label: 'نام پدر', required: true },
  { key: `${prefix}GrandfatherName`, label: 'نام پدرکلان' }, { key: `${prefix}IdentityNo`, label: 'نمبر تذکره / سند هویت', required: true },
  { key: `${prefix}BirthDate`, label: 'تاریخ تولد', type: 'date' }, { key: `${prefix}Education`, label: 'سویه تحصیلی' },
  { key: `${prefix}Phone`, label: 'شماره تماس' }, { key: `${prefix}Address`, label: 'آدرس', type: 'textarea' },
] });

const declarationFields = (): Field[] => [
  { key: 'declaration', label: 'اقرار و تعهد', type: 'textarea', required: true },
  { key: 'signatoryName', label: 'نام و تخلص امضاکننده', required: true },
  { key: 'signatoryPosition', label: 'موقف', required: true }, { key: 'signatureDate', label: 'تاریخ', type: 'date', required: true },
];
const common = (): Section[] => [{ title: '۱. مشخصات شرکت', fields: company }];

function sectionsFor(id: string): Section[] {
  if (id === 'license-application') return [...common(), person('applicant', '۲. مشخصات درخواست‌دهنده'), { title: '۳. مشخصات فعالیت درخواستی', fields: [
    { key: 'businessType', label: 'نوع فعالیت', required: true }, { key: 'capital', label: 'سرمایه', type: 'number' },
    { key: 'services', label: 'خدمات مورد درخواست', type: 'textarea', required: true }, { key: 'businessAddress', label: 'محل فعالیت', type: 'textarea', required: true },
  ] }, { title: '۴. تعهد و امضا', fields: declarationFields() }];
  if (id === 'shareholder-employee-profile') return [person('profile', '۱. شهرت سهمدار / کارمند'), { title: '۲. معلومات وظیفه و سهم', fields: [
    { key: 'position', label: 'موقف', required: true }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'employmentDate', label: 'تاریخ استخدام', type: 'date' },
  ] }, { title: '۳. آدرس و سابقه', fields: [{ key: 'experience', label: 'سابقه کاری', type: 'textarea' }, { key: 'address', label: 'آدرس', type: 'textarea' }] }];
  if (id === 'articles') return [{ title: '۱. مشخصات شرکت', fields: company }, { title: '۲. اساسنامه شرکت', fields: [
    { key: 'companyPurpose', label: 'هدف و موضوع فعالیت', type: 'textarea', required: true }, { key: 'capital', label: 'سرمایه', type: 'number', required: true },
    { key: 'shareStructure', label: 'ساختار سهمداران', type: 'textarea', required: true }, { key: 'management', label: 'ساختار مدیریت', type: 'textarea', required: true },
    { key: 'registeredAddress', label: 'آدرس ثبت‌شده', type: 'textarea', required: true },
  ] }, { title: '۳. تصویب و امضا', fields: declarationFields() }];
  if (id === 'agency-establishment' || id === 'agency-renewal' || id === 'agency-change') return [...common(), { title: id === 'agency-change' ? '۲. تغییرات نمایندگی' : '۲. مشخصات نمایندگی', fields: [
    { key: 'agencyNo', label: 'شماره نمایندگی' }, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'province', label: 'ولایت محل فعالیت', required: true },
    { key: 'district', label: 'ولسوالی / ناحیه' }, { key: 'market', label: 'مارکیت' }, { key: 'shopNo', label: 'نمبر دکان' }, { key: 'address', label: 'آدرس', type: 'textarea' },
    { key: 'changeDetails', label: 'شرح تغییرات / دلیل درخواست', type: 'textarea' },
  ] }, person('representative', '۳. نماینده باصلاحیت'), { title: '۴. تعهد و امضا', fields: declarationFields() }];
  if (id === 'shareholder-guarantee') return [...common(), person('shareholder', '۲. معلومات سهمدار'), person('guarantor', '۳. معلومات تضمین‌کننده'), { title: '۴. ضمانت و امضا', fields: [
    { key: 'guaranteeAmount', label: 'مبلغ / ارزش ضمانت', type: 'number' }, { key: 'undertaking', label: 'متن تعهد ضمانت', type: 'textarea', required: true }, ...declarationFields(),
  ] }];
  if (id === 'license-renewal') return [...common(), { title: '۲. معلومات جواز و تمدید', fields: [
    { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date' }, { key: 'expiryDate', label: 'تاریخ ختم جواز', type: 'date', required: true },
    { key: 'applicationDate', label: 'تاریخ درخواست تمدید', type: 'date', required: true }, { key: 'authorizedName', label: 'مسئول باصلاحیت', required: true },
  ] }, { title: '۳. تغییرات نسبت به درخواست قبلی', fields: [{ key: 'changes', label: 'شرح تغییرات', type: 'textarea' }, { key: 'updatedDocuments', label: 'معلومات و اسناد به‌روزشده', type: 'textarea' }] }, { title: '۴. تعهد و امضا', fields: declarationFields() }];
  if (id === 'aml-cft-policy') return [...common(), { title: '۲. پالیسی مبارزه با پولشویی و تمویل تروریزم', fields: [
    { key: 'policyVersion', label: 'نسخه پالیسی', required: true }, { key: 'approvalDate', label: 'تاریخ تصویب', type: 'date', required: true },
    { key: 'complianceOfficer', label: 'مسئول تطبیق', required: true }, { key: 'riskAssessment', label: 'ارزیابی خطر', type: 'textarea', required: true },
    { key: 'kyc', label: 'مقررات KYC و شناسایی مشتری', type: 'textarea', required: true }, { key: 'monitoring', label: 'نظارت و گزارش‌دهی', type: 'textarea', required: true },
    { key: 'training', label: 'آموزش کارکنان', type: 'textarea' },
  ] }, { title: '۳. تصویب و امضا', fields: declarationFields() }];
  if (id === 'ownership-transfer') return [...common(), { title: '۲. انتقال مالکیت', fields: [
    { key: 'transferor', label: 'سهمدار انتقال‌دهنده', required: true }, { key: 'transferee', label: 'سهمدار انتقال‌گیرنده', required: true },
    { key: 'sharePercent', label: 'فیصدی سهم انتقال‌شده', type: 'number', required: true }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date', required: true },
    { key: 'reason', label: 'دلیل انتقال', type: 'textarea' },
  ] }, person('newOwner', '۳. شهرت مالک جدید'), { title: '۴. تعهد و امضا', fields: declarationFields() }];
  if (id === 'name-change') return [...common(), { title: '۲. تغییر نام', fields: [
    { key: 'oldName', label: 'نام فعلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea', required: true },
  ] }, { title: '۳. تعهد و امضا', fields: declarationFields() }];
  if (id === 'location-change') return [...common(), { title: '۲. تغییر موقعیت', fields: [
    { key: 'oldLocation', label: 'موقعیت فعلی', type: 'textarea', required: true }, { key: 'newLocation', label: 'موقعیت جدید', type: 'textarea', required: true },
    { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' },
  ] }, { title: '۳. تعهد و امضا', fields: declarationFields() }];
  if (id === 'license-suspension' || id === 'agency-suspension') return [...common(), { title: '۲. معلومات تعلیق جواز', fields: [
    { key: 'effectiveDate', label: 'تاریخ آغاز تعلیق', type: 'date', required: true }, { key: 'duration', label: 'مدت تعلیق' }, { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true },
    { key: 'settlement', label: 'وضعیت تصفیه و اسناد', type: 'textarea' },
  ] }, { title: '۳. تعهد و امضا', fields: declarationFields() }];
  if (id === 'license-closure' || id === 'agency-closure' || id === 'agency-closure-permit') return [...common(), { title: '۲. ترک پیشه', fields: [
    { key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true },
    { key: 'financialSettlement', label: 'وضعیت تصفیه مالی', type: 'textarea' }, { key: 'documentsReturned', label: 'وضعیت جواز و اسناد', type: 'textarea' },
  ] }, { title: '۳. تعهد و امضا', fields: declarationFields() }];
  if (id === 'commencement-letter') return [...common(), { title: '۲. مکتوب آغاز فعالیت', fields: [
    { key: 'commencementDate', label: 'تاریخ آغاز فعالیت', type: 'date', required: true }, { key: 'approvedLicenseNo', label: 'شماره جواز', required: true },
    { key: 'authorizedPerson', label: 'شخص مسئول', required: true }, { key: 'operatingAddress', label: 'محل فعالیت', type: 'textarea', required: true },
  ] }, { title: '۳. امضا و مهر', fields: declarationFields() }];
  return [...common(), { title: '۲. معلومات درخواست', fields: [{ key: 'details', label: 'معلومات مکمل', type: 'textarea', required: true }] }, { title: '۳. تعهد و امضا', fields: declarationFields() }];
}

function requiredNames(sections: Section[], values: Values) {
  return sections.flatMap((s) => s.fields).filter((f) => f.required && !values[f.key]?.trim()).map((f) => f.label);
}

export default function DabOfficialFormsRegistryWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [activeId, setActiveId] = useState(DAB_RENEWAL_FORM_ID);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const form = DAB_OFFICIAL_FORMS.find((x) => x.id === activeId) ?? DAB_OFFICIAL_FORMS[0];
  const sections = useMemo(() => sectionsFor(form.id), [form.id]);
  const visibleForms = DAB_OFFICIAL_FORMS.filter((x) => `${x.title} ${x.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const update = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const select = (id: string) => { setActiveId(id); setValues({}); setMessage(''); };
  const save = async () => {
    const missing = requiredNames(sections, values);
    if (missing.length) { setMessage(`فیلدهای ضروری: ${missing.slice(0, 6).join('، ')}${missing.length > 6 ? ' و موارد دیگر.' : '.'}`); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), { formId: form.id, officialTitle: form.title, values, status: 'draft', updatedAt: new Date().toISOString() }, { merge: true });
      setMessage('پیش‌نویس فورم ذخیره شد.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'ذخیره موفق نشد.'); } finally { setSaving(false); }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 border-2 border-slate-800 bg-white p-5 print:mb-0 print:border-x-0 print:border-t-0">
          <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-3 text-center">
            <div className="text-right text-xs">شماره فورم: __________<br />تاریخ: __________</div>
            <div><p className="font-bold">د افغانستان بانک</p><p className="text-xs">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p><h1 className="mt-2 text-lg font-bold">{form.title}</h1></div>
            <div className="text-left text-xs">مهر و امضا: __________</div>
          </div>
          <div className="mt-4 flex justify-end gap-2 print:hidden"><button onClick={() => window.print()} className="border px-4 py-2">چاپ فورم</button><button onClick={save} disabled={saving} className="bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{saving ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}</button></div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[310px_1fr] print:block">
          <aside className="border bg-white p-3 print:hidden">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی فورم" className="mb-3 w-full border p-2" />
            <div className="max-h-[72vh] space-y-1 overflow-auto">{visibleForms.map((x) => <button key={x.id} onClick={() => select(x.id)} className={`w-full border-b p-3 text-right text-sm ${x.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}><b>{x.title}</b><span className="mt-1 block text-xs opacity-70">{x.category}</span></button>)}</div>
          </aside>

          <section className="space-y-4">
            {sections.map((section, si) => (
              <section key={section.title} className="border-2 border-slate-700 bg-white print:break-inside-avoid">
                <h2 className="border-b-2 border-slate-700 bg-slate-50 px-4 py-3 text-sm font-bold">{section.title}</h2>
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.key} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} border-b border-l border-slate-300 p-3`}>
                      <span className="mb-1 block text-xs font-bold">{field.label}{field.required ? ' *' : ''}</span>
                      {field.type === 'textarea' ? <textarea rows={4} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} className="w-full border p-2" /> : <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} className="w-full border p-2" />}
                    </label>
                  ))}
                </div>
                {si === sections.length - 1 && <div className="grid grid-cols-3 border-t-2 border-slate-700 text-center text-xs"><div className="min-h-20 border-l p-3">نام و امضا<br />________________</div><div className="min-h-20 border-l p-3">موقف<br />________________</div><div className="min-h-20 p-3">مهر شرکت<br />________________</div></div>}
              </section>
            ))}

            {form.id === DAB_RENEWAL_FORM_ID && <section className="border-2 border-slate-700 bg-white p-4 print:break-inside-avoid"><h2 className="mb-3 font-bold">ضمیمه: اسناد مورد نیاز تمدید</h2><table className="w-full border-collapse text-sm"><thead><tr><th className="border p-2">ردیف</th><th className="border p-2 text-right">سند</th><th className="border p-2">الزام</th><th className="border p-2">وضعیت</th></tr></thead><tbody>{DAB_RENEWAL_REQUIRED_DOCUMENTS.map((d, i) => <tr key={d.key}><td className="border p-2 text-center">{i + 1}</td><td className="border p-2">{d.title}</td><td className="border p-2 text-center">{d.required ? 'بلی' : 'در صورت مطالبه'}</td><td className="border p-2">□ دریافت شد　 □ تکمیل شود</td></tr>)}</tbody></table></section>}
            {message && <div className="border bg-white p-3 text-sm print:hidden">{message}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
