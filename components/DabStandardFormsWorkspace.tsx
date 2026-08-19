'use client';

import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DAB_OFFICIAL_FORMS, DAB_RENEWAL_FORM_ID, DAB_RENEWAL_REQUIRED_DOCUMENTS } from '@/lib/dabOfficialFormRegistry';

type FieldType = 'text' | 'date' | 'number' | 'textarea';
type Field = { key: string; label: string; type?: FieldType; required?: boolean };
type Section = { title: string; fields: Field[] };
type Values = Record<string, string>;

const company: Field[] = [
  { key: 'companyName', label: 'نام شرکت', required: true },
  { key: 'licenseNo', label: 'شماره جواز' },
  { key: 'tin', label: 'شماره تشخیصیه مالیاتی' },
  { key: 'province', label: 'ولایت', required: true },
  { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'address', label: 'آدرس مکمل', type: 'textarea', required: true },
  { key: 'phone', label: 'شماره تماس' },
];

const person = (prefix: string, title: string): Section => ({
  title,
  fields: [
    { key: `${prefix}FullName`, label: 'نام و تخلص', required: true },
    { key: `${prefix}FatherName`, label: 'نام پدر', required: true },
    { key: `${prefix}GrandfatherName`, label: 'نام پدرکلان' },
    { key: `${prefix}IdentityNo`, label: 'نمبر تذکره / سند هویت', required: true },
    { key: `${prefix}BirthDate`, label: 'تاریخ تولد', type: 'date' },
    { key: `${prefix}Education`, label: 'سویه تحصیلی' },
    { key: `${prefix}Phone`, label: 'شماره تماس' },
    { key: `${prefix}Address`, label: 'آدرس', type: 'textarea' },
  ],
});

const signature: Field[] = [
  { key: 'declaration', label: 'اقرار و تعهد', type: 'textarea', required: true },
  { key: 'signatoryName', label: 'نام امضاکننده', required: true },
  { key: 'signatoryPosition', label: 'موقف', required: true },
  { key: 'signatureDate', label: 'تاریخ', type: 'date', required: true },
];
const common = (): Section[] => [{ title: '۱. مشخصات شرکت', fields: company }];
const closing = (title = 'تعهد و امضا'): Section[] => [{ title: `امضا — ${title}`, fields: signature }];

function schemas(id: string): Section[] {
  if (id === 'license-application') return [...common(), person('applicant', '۲. مشخصات درخواست‌دهنده'), { title: '۳. نوع و ساحه فعالیت', fields: [
    { key: 'businessType', label: 'نوع فعالیت', required: true }, { key: 'services', label: 'خدمات مورد درخواست', type: 'textarea', required: true },
    { key: 'capital', label: 'سرمایه', type: 'number', required: true }, { key: 'businessAddress', label: 'محل فعالیت', type: 'textarea', required: true },
  ] }, ...closing()];
  if (id === 'shareholder-employee-profile') return [person('person', '۱. شهرت سهمدار / کارمند'), { title: '۲. معلومات سهم و وظیفه', fields: [
    { key: 'position', label: 'موقف' }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' }, { key: 'employmentDate', label: 'تاریخ استخدام', type: 'date' },
    { key: 'experience', label: 'سابقه کاری', type: 'textarea' },
  ] }];
  if (id === 'articles') return [{ title: '۱. مشخصات شرکت', fields: company }, { title: '۲. اساسنامه', fields: [
    { key: 'companyPurpose', label: 'هدف و موضوع فعالیت', type: 'textarea', required: true }, { key: 'capital', label: 'سرمایه', type: 'number', required: true },
    { key: 'shareStructure', label: 'ساختار سهمداران', type: 'textarea', required: true }, { key: 'management', label: 'ساختار مدیریت', type: 'textarea', required: true },
    { key: 'registeredAddress', label: 'آدرس ثبت‌شده', type: 'textarea', required: true },
  ] }, ...closing('تصویب اساسنامه')];
  if (['agency-establishment', 'agency-renewal', 'agency-change'].includes(id)) return [...common(), { title: id === 'agency-change' ? '۲. تغییرات نمایندگی' : '۲. معلومات نمایندگی', fields: [
    { key: 'agencyNo', label: 'شماره نمایندگی' }, { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'province', label: 'ولایت', required: true },
    { key: 'district', label: 'ولسوالی / ناحیه' }, { key: 'market', label: 'مارکیت' }, { key: 'shopNo', label: 'نمبر دکان' },
    { key: 'address', label: 'آدرس', type: 'textarea', required: true }, { key: 'changeDetails', label: 'شرح تغییرات', type: 'textarea' },
  ] }, person('representative', '۳. نماینده باصلاحیت'), ...closing()];
  if (id === 'shareholder-guarantee') return [...common(), person('shareholder', '۲. معلومات سهمدار'), { title: '۳. ضمانت', fields: [
    { key: 'guaranteeAmount', label: 'مبلغ / ارزش ضمانت', type: 'number', required: true }, { key: 'guaranteeDetails', label: 'تفصیل ضمانت', type: 'textarea', required: true },
  ] }, ...closing()];
  if (id === 'license-renewal') return [...common(), { title: '۲. معلومات جواز', fields: [
    { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date' }, { key: 'expiryDate', label: 'تاریخ ختم جواز', type: 'date', required: true },
    { key: 'applicationDate', label: 'تاریخ درخواست تمدید', type: 'date', required: true }, { key: 'authorizedName', label: 'مسئول باصلاحیت', required: true },
  ] }, { title: '۳. تغییرات و معلومات به‌روزشده', fields: [
    { key: 'changes', label: 'شرح تغییرات عمده', type: 'textarea' }, { key: 'updatedInformation', label: 'معلومات و اسناد به‌روزشده', type: 'textarea' },
  ] }, ...closing()];
  if (id === 'aml-cft-policy') return [...common(), { title: '۲. پالیسی مبارزه با پولشویی و تمویل تروریزم', fields: [
    { key: 'policyVersion', label: 'نسخه پالیسی', required: true }, { key: 'approvalDate', label: 'تاریخ تصویب', type: 'date', required: true },
    { key: 'complianceOfficer', label: 'مسئول تطبیق', required: true }, { key: 'riskAssessment', label: 'ارزیابی خطر', type: 'textarea', required: true },
    { key: 'kyc', label: 'KYC و شناسایی مشتری', type: 'textarea', required: true }, { key: 'monitoring', label: 'نظارت و گزارش‌دهی', type: 'textarea', required: true },
    { key: 'training', label: 'آموزش کارکنان', type: 'textarea' },
  ] }, ...closing('تصویب پالیسی')];
  if (id === 'ownership-transfer') return [...common(), { title: '۲. انتقال مالکیت', fields: [
    { key: 'transferor', label: 'سهمدار انتقال‌دهنده', required: true }, { key: 'transferee', label: 'سهمدار انتقال‌گیرنده', required: true },
    { key: 'sharePercent', label: 'فیصدی سهم انتقال‌شده', type: 'number', required: true }, { key: 'transferDate', label: 'تاریخ انتقال', type: 'date', required: true },
    { key: 'reason', label: 'دلیل انتقال', type: 'textarea' },
  ] }, person('newOwner', '۳. شهرت مالک جدید'), ...closing()];
  if (id === 'name-change') return [...common(), { title: '۲. تغییر نام', fields: [
    { key: 'oldName', label: 'نام فعلی', required: true }, { key: 'newName', label: 'نام پیشنهادی', required: true }, { key: 'reason', label: 'دلیل تغییر نام', type: 'textarea', required: true },
  ] }, ...closing()];
  if (id === 'location-change') return [...common(), { title: '۲. تغییر موقعیت', fields: [
    { key: 'oldLocation', label: 'موقعیت فعلی', type: 'textarea', required: true }, { key: 'newLocation', label: 'موقعیت جدید', type: 'textarea', required: true },
    { key: 'changeDate', label: 'تاریخ تغییر', type: 'date', required: true }, { key: 'reason', label: 'دلیل تغییر', type: 'textarea' },
  ] }, ...closing()];
  if (['license-suspension', 'agency-suspension', 'ms-license-suspension'].includes(id)) return [...common(), { title: '۲. تعلیق', fields: [
    { key: 'effectiveDate', label: 'تاریخ آغاز تعلیق', type: 'date', required: true }, { key: 'duration', label: 'مدت تعلیق' },
    { key: 'reason', label: 'دلیل تعلیق', type: 'textarea', required: true }, { key: 'settlement', label: 'وضعیت تصفیه و اسناد', type: 'textarea' },
  ] }, ...closing()];
  if (['license-closure', 'agency-closure', 'agency-closure-permit', 'fx-closure', 'ms-closure'].includes(id)) return [...common(), { title: '۲. ترک پیشه', fields: [
    { key: 'effectiveDate', label: 'تاریخ ترک پیشه', type: 'date', required: true }, { key: 'reason', label: 'دلیل ترک پیشه', type: 'textarea', required: true },
    { key: 'financialSettlement', label: 'وضعیت تصفیه مالی', type: 'textarea' }, { key: 'documentsReturned', label: 'وضعیت جواز و اسناد', type: 'textarea' },
  ] }, ...closing()];
  if (['commencement-letter', 'employee-introduction-letter'].includes(id)) return [...common(), { title: '۲. مکتوب', fields: [
    { key: 'documentDate', label: 'تاریخ', type: 'date', required: true }, { key: 'subject', label: 'موضوع', required: true },
    { key: 'details', label: 'متن مکتوب', type: 'textarea', required: true }, { key: 'authorizedPerson', label: 'شخص مسئول', required: true },
  ] }, ...closing('مکتوب')];
  if (id === 'organization-chart') return [{ title: '۱. مشخصات شرکت', fields: company }, { title: '۲. ساختار تشکیلاتی', fields: [
    { key: 'chartTitle', label: 'عنوان چارت', required: true }, { key: 'governingBody', label: 'مجمع عمومی / سهمداران', required: true },
    { key: 'supervisoryBody', label: 'هیئت نظارتی', required: true }, { key: 'executiveHead', label: 'مدیر عمومی / مسئول اجرائیه', required: true },
    { key: 'departments', label: 'ادارات و بخش‌ها', type: 'textarea', required: true }, { key: 'branches', label: 'نمایندگی‌ها', type: 'textarea' },
  ] }, ...closing('چارت تشکیلاتی')];
  if (id === 'employee-signature-samples') return [...common(), { title: '۲. جدول نمونه امضا', fields: [
    { key: 'employee1', label: 'کارمند ۱ — نام، موقف و نمونه امضا', type: 'textarea', required: true }, { key: 'employee2', label: 'کارمند ۲ — نام، موقف و نمونه امضا', type: 'textarea' },
    { key: 'employee3', label: 'کارمند ۳ — نام، موقف و نمونه امضا', type: 'textarea' },
  ] }, ...closing('نمونه امضا')];
  if (id === 'hr-policy') return [...common(), { title: '۲. پالیسی منابع بشری', fields: [
    { key: 'policyVersion', label: 'نسخه پالیسی', required: true }, { key: 'recruitment', label: 'استخدام و گزینش', type: 'textarea', required: true },
    { key: 'training', label: 'آموزش و ارتقای ظرفیت', type: 'textarea', required: true }, { key: 'conduct', label: 'سلوک و انضباط کاری', type: 'textarea', required: true },
    { key: 'leave', label: 'رخصتی و حضور', type: 'textarea' },
  ] }, ...closing('پالیسی منابع بشری')];
  if (id === 'fx-responsible-employee' || id === 'ms-responsible-employee') return [person('responsible', '۱. شهرت کارمند مسئول'), { title: '۲. وظیفه و معرفی', fields: [
    { key: 'position', label: 'موقف', required: true }, { key: 'appointmentDate', label: 'تاریخ تقرر', type: 'date', required: true },
    { key: 'duties', label: 'وظایف و صلاحیت‌ها', type: 'textarea', required: true },
  ] }, ...closing('معرفی کارمند مسئول')];
  if (id === 'fx-guarantee' || id === 'ms-guarantee' || id === 'ms-guarantee-1' || id === 'ms-guarantee-2') return [...common(), person('guarantor', '۲. شهرت تضمین‌کننده'), { title: '۳. ضمانت', fields: [
    { key: 'amount', label: 'مبلغ ضمانت', type: 'number', required: true }, { key: 'guaranteeType', label: 'نوع ضمانت', required: true }, { key: 'details', label: 'تفصیل ضمانت', type: 'textarea', required: true },
  ] }, ...closing('ضمانت')];
  if (id === 'fx-license-application' || id === 'ms-license-application') return [...common(), person('applicant', '۲. شهرت درخواست‌دهنده'), { title: '۳. معلومات فعالیت', fields: [
    { key: 'businessLocation', label: 'محل فعالیت', type: 'textarea', required: true }, { key: 'capital', label: 'سرمایه', type: 'number' }, { key: 'services', label: 'خدمات', type: 'textarea', required: true },
  ] }, ...closing()];
  if (id === 'fx-name-change' || id === 'ms-name-change') return [...common(), { title: '۲. تغییر نام', fields: [
    { key: 'oldName', label: 'نام فعلی', required: true }, { key: 'newName', label: 'نام جدید', required: true }, { key: 'reason', label: 'دلیل', type: 'textarea', required: true },
  ] }, ...closing()];
  if (id === 'fx-agency-establishment' || id === 'ms-agency-establishment') return [...common(), { title: '۲. نمایندگی', fields: [
    { key: 'agencyName', label: 'نام نمایندگی', required: true }, { key: 'province', label: 'ولایت', required: true }, { key: 'district', label: 'ولسوالی / ناحیه' },
    { key: 'address', label: 'آدرس', type: 'textarea', required: true },
  ] }, person('representative', '۳. نماینده باصلاحیت'), ...closing()];
  if (id === 'fx-commitment' || id === 'ms-commitment') return [...common(), { title: '۲. تعهدنامه', fields: [
    { key: 'commitment', label: 'متن تعهدنامه', type: 'textarea', required: true }, { key: 'date', label: 'تاریخ', type: 'date', required: true },
  ] }, ...closing('تعهدنامه')];
  if (id === 'ms-license-renewal') return [...common(), { title: '۲. تمدید جواز خدمات پولی', fields: [
    { key: 'licenseNo', label: 'شماره جواز', required: true }, { key: 'expiryDate', label: 'تاریخ ختم جواز', type: 'date', required: true },
    { key: 'changes', label: 'تغییرات نسبت به معلومات قبلی', type: 'textarea' },
  ] }, ...closing()];
  if (id === 'ms-ownership-transfer') return [...common(), { title: '۲. انتقال مالکیت خدمات پولی', fields: [
    { key: 'transferor', label: 'انتقال‌دهنده', required: true }, { key: 'transferee', label: 'انتقال‌گیرنده', required: true }, { key: 'sharePercent', label: 'فیصدی سهم', type: 'number' },
    { key: 'reason', label: 'دلیل', type: 'textarea' },
  ] }, ...closing()];
  return [...common(), { title: '۲. معلومات سند', fields: [{ key: 'details', label: 'معلومات مکمل', type: 'textarea', required: true }] }, ...closing()];
}

function requiredNames(sections: Section[], values: Values) {
  return sections.flatMap((s) => s.fields).filter((f) => f.required && !values[f.key]?.trim()).map((f) => f.label);
}

export default function DabStandardFormsWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [activeId, setActiveId] = useState(DAB_RENEWAL_FORM_ID);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<'all' | 'company-licensing' | 'exchange' | 'money-services'>('all');
  const [values, setValues] = useState<Values>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const form = DAB_OFFICIAL_FORMS.find((x) => x.id === activeId) ?? DAB_OFFICIAL_FORMS[0];
  const sections = useMemo(() => schemas(form.id), [form.id]);
  const visibleForms = DAB_OFFICIAL_FORMS.filter((x) => (group === 'all' || x.sourceGroup === group) && `${x.title} ${x.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const update = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const select = (id: string) => { setActiveId(id); setValues({}); setMessage(''); };
  const save = async () => {
    const missing = requiredNames(sections, values);
    if (missing.length) { setMessage(`فیلدهای ضروری تکمیل نشده: ${missing.slice(0, 6).join('، ')}${missing.length > 6 ? ' و موارد دیگر.' : '.'}`); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), { formId: form.id, officialTitle: form.title, sourceGroup: form.sourceGroup, sourceUrl: form.sourceUrl, values, status: 'draft', updatedAt: new Date().toISOString() }, { merge: true });
      setMessage('پیش‌نویس ذخیره شد.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'ذخیره موفق نشد.'); } finally { setSaving(false); }
  };

  return <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
    <div className="mx-auto max-w-7xl">
      <header className="mb-5 border-2 border-slate-800 bg-white p-5 print:mb-0 print:border-x-0 print:border-t-0">
        <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-3 text-center">
          <div className="text-right text-xs">شماره فورم: __________<br />تاریخ: __________</div>
          <div><p className="font-bold">د افغانستان بانک</p><p className="text-xs">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p><h1 className="mt-2 text-lg font-bold">{form.title}</h1></div>
          <div className="text-left text-xs">مهر و امضا: __________</div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 print:hidden">
          <a href={form.sourceUrl} target="_blank" rel="noreferrer" className="border px-4 py-2">مشاهده منبع رسمی DAB</a>
          <button onClick={() => window.print()} className="border px-4 py-2">چاپ A4</button>
          <button onClick={save} disabled={saving} className="bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{saving ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}</button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[330px_1fr] print:block">
        <aside className="border bg-white p-3 print:hidden">
          <div className="mb-2 grid grid-cols-3 gap-1"><button onClick={() => setGroup('company-licensing')} className="border p-2 text-xs">شرکت</button><button onClick={() => setGroup('exchange')} className="border p-2 text-xs">صرافی</button><button onClick={() => setGroup('money-services')} className="border p-2 text-xs">خدمات پولی</button></div>
          <button onClick={() => setGroup('all')} className="mb-2 w-full border p-2 text-xs">همه فورم‌ها</button>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی فورم" className="mb-3 w-full border p-2" />
          <div className="max-h-[72vh] space-y-1 overflow-auto">{visibleForms.map((x) => <button key={x.id} onClick={() => select(x.id)} className={`w-full border-b p-3 text-right text-sm ${x.id === form.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}><b>{x.title}</b><span className="mt-1 block text-xs opacity-70">{x.sourceGroup} / {x.category}</span></button>)}</div>
        </aside>

        <section className="space-y-4">
          {sections.map((section) => <section key={section.title} className="border-2 border-slate-700 bg-white print:break-inside-avoid"><h2 className="border-b-2 border-slate-700 bg-slate-50 px-4 py-3 text-sm font-bold">{section.title}</h2><div className="grid grid-cols-1 gap-0 md:grid-cols-2">{section.fields.map((field) => <label key={field.key} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} border-b border-l border-slate-300 p-3`}><span className="mb-1 block text-xs font-bold">{field.label}{field.required ? ' *' : ''}</span>{field.type === 'textarea' ? <textarea rows={4} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} className="w-full border p-2" /> : <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={values[field.key] ?? ''} onChange={(e) => update(field.key, e.target.value)} className="w-full border p-2" />}</label>)}</div></section>)}
          {form.id === DAB_RENEWAL_FORM_ID && <section className="border-2 border-slate-700 bg-white p-4 print:break-inside-avoid"><h2 className="mb-3 font-bold">ضمیمه اسناد تمدید جواز</h2><table className="w-full border-collapse text-sm"><thead><tr><th className="border p-2">ردیف</th><th className="border p-2 text-right">سند</th><th className="border p-2">الزام</th><th className="border p-2">مبنای مقرراتی</th></tr></thead><tbody>{DAB_RENEWAL_REQUIRED_DOCUMENTS.map((d, i) => <tr key={d.key}><td className="border p-2 text-center">{i + 1}</td><td className="border p-2">{d.title}</td><td className="border p-2 text-center">{d.required ? 'بلی' : 'در صورت مطالبه'}</td><td className="border p-2">{d.legalBasis}</td></tr>)}</tbody></table></section>}
          <div className="border bg-white p-3 text-xs">منبع: {form.sourceTitle}. این صفحه یک محیط دیجیتال است و جایگزین سند رسمی DAB نیست.</div>
          {message && <div className="border bg-white p-3 text-sm print:hidden">{message}</div>}
        </section>
      </div>
    </div>
  </main>;
}
