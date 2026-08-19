'use client';

import { useMemo, useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FieldType = 'text' | 'date' | 'number' | 'textarea' | 'file';
type Field = { key: string; label: string; type?: FieldType };
type FormDef = { id: string; title: string; category: string; fields: Field[] };
type FormValues = Record<string, string>;

const commonCompany: Field[] = [
  { key: 'companyName', label: 'نام رسمی شرکت' },
  { key: 'licenseNo', label: 'شماره جواز' },
  { key: 'licenseIssueDate', label: 'تاریخ صدور جواز', type: 'date' },
  { key: 'licenseExpiryDate', label: 'تاریخ ختم جواز', type: 'date' },
  { key: 'tin', label: 'نمبر تشخیصیه مالیاتی (TIN)' },
  { key: 'province', label: 'ولایت' },
  { key: 'district', label: 'ولسوالی / ناحیه' },
  { key: 'address', label: 'آدرس مکمل', type: 'textarea' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'email', label: 'ایمیل' },
];

const person: Field[] = [
  { key: 'fullName', label: 'نام و تخلص' },
  { key: 'fatherName', label: 'نام پدر' },
  { key: 'grandfatherName', label: 'نام پدرکلان' },
  { key: 'tazkira', label: 'شماره تذکره / سند هویت' },
  { key: 'dateOfBirth', label: 'تاریخ تولد', type: 'date' },
  { key: 'nationality', label: 'تابعیت' },
  { key: 'occupation', label: 'وظیفه / پیشه' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'address', label: 'آدرس', type: 'textarea' },
  { key: 'photo', label: 'عکس', type: 'file' },
  { key: 'identityDocument', label: 'سند هویت', type: 'file' },
];

const forms: FormDef[] = [
  { id: 'license-application', title: 'درخواست اخذ جواز فعالیت شرکت صرافی و خدمات پولی', category: 'جوازدهی', fields: [...commonCompany, { key: 'capital', label: 'سرمایه' }, { key: 'businessScope', label: 'نوع و ساحه فعالیت', type: 'textarea' }, { key: 'representative', label: 'نماینده باصلاحیت' }] },
  { id: 'license-renewal', title: 'درخواست تمدید جواز فعالیت شرکت صرافی و خدمات پولی', category: 'تمدید', fields: [...commonCompany, { key: 'renewalReason', label: 'درخواست / توضیحات تمدید', type: 'textarea' }, { key: 'taxClearance', label: 'تصفیه / عدم باقیداری مالیاتی', type: 'file' }, { key: 'criminalClearance', label: 'تصدیق عدم مسئولیت جنایی، در صورت مطالبه', type: 'file' }] },
  { id: 'shareholder-employee-profile', title: 'شهرت سهمدار / کارمند شرکت صرافی و خدمات پولی', category: 'اشخاص', fields: person },
  { id: 'articles', title: 'اساسنامه شرکت صرافی و خدمات پولی', category: 'شرکت', fields: [...commonCompany, { key: 'articlesFile', label: 'فایل اساسنامه', type: 'file' }, { key: 'notes', label: 'توضیحات', type: 'textarea' }] },
  { id: 'agency-establishment', title: 'ایجاد نمایندگی و معرفی نماینده باصلاحیت', category: 'نمایندگی', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'agencyProvince', label: 'ولایت نمایندگی' }, { key: 'agencyDistrict', label: 'ولسوالی / ناحیه نمایندگی' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }] },
  { id: 'agency-renewal', title: 'تمدید نمایندگی شرکت صرافی و خدمات پولی', category: 'تمدید نمایندگی', fields: [...commonCompany, { key: 'agencyName', label: 'نام نمایندگی' }, { key: 'agencyLicenseNo', label: 'شماره اجازه‌نامه نمایندگی' }, { key: 'agencyExpiryDate', label: 'تاریخ ختم اجازه‌نامه', type: 'date' }, { key: 'agencyAddress', label: 'آدرس نمایندگی', type: 'textarea' }, { key: 'agencyManager', label: 'نماینده باصلاحیت' }, { key: 'supportingDocuments', label: 'اسناد حمایوی', type: 'file' }] },
  { id: 'shareholder-guarantee', title: 'تضمین سر سهمدار / سهمداران', category: 'تضمین', fields: [...commonCompany, { key: 'shareholderName', label: 'نام سهمدار' }, { key: 'share', label: 'فیصدی سهم', type: 'number' }, { key: 'guaranteeAmount', label: 'مبلغ تضمین', type: 'number' }, { key: 'guaranteeDocument', label: 'سند تضمین', type: 'file' }] },
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

function blankValues(form: FormDef): FormValues {
  return Object.fromEntries(form.fields.map(field => [field.key, '']));
}

export default function DabAllOfficialFormsWorkspace({ companyId = 'default' }: { companyId?: string }) {
  const [active, setActive] = useState('license-renewal');
  const [valuesByForm, setValuesByForm] = useState<Record<string, FormValues>>({});
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const form = forms.find(item => item.id === active) ?? forms[1];
  const values = valuesByForm[form.id] ?? blankValues(form);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? forms.filter(item => `${item.title} ${item.category}`.toLocaleLowerCase().includes(term)) : forms;
  }, [query]);

  const update = (key: string, value: string) => {
    setValuesByForm(current => ({ ...current, [form.id]: { ...(current[form.id] ?? blankValues(form)), [key]: value } }));
  };

  const save = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, `companies/${companyId}/dabOfficialForms/${form.id}`), {
        formId: form.id,
        title: form.title,
        category: form.category,
        values,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setMessage('فورم با موفقیت ذخیره شد.');
    } catch (error) {
      setMessage(error instanceof Error ? `ذخیره ناموفق بود: ${error.message}` : 'ذخیره ناموفق بود.');
    } finally {
      setBusy(false);
      window.setTimeout(() => setMessage(''), 3000);
    }
  };

  const upload = async (key: string, file: File) => {
    setBusy(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `companies/${companyId}/dabOfficialForms/${form.id}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      update(key, JSON.stringify({ fileName: file.name, storagePath: snapshot.ref.fullPath, downloadUrl: url }));
      setMessage('فایل آپلود شد. برای ثبت نهایی روی ذخیره بزنید.');
    } catch (error) {
      setMessage(error instanceof Error ? `آپلود ناموفق بود: ${error.message}` : 'آپلود ناموفق بود.');
    } finally {
      setBusy(false);
      window.setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <header className="border-b bg-white px-4 py-5 print:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="text-xs font-black text-blue-700">DA AFGHANISTAN BANK • LICENSING FORMS</div>
          <h1 className="mt-1 text-2xl font-black">مرکز فورم‌های جوازدهی صرافی و خدمات پولی</h1>
          <p className="mt-1 text-sm text-slate-500">فورم‌ها، اسناد، ذخیره پرونده و چاپ در یک مسیر واحد</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border bg-white p-3 print:hidden">
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="جستجوی فورم..." className="mb-3 w-full rounded-lg border px-3 py-2 text-sm" />
          <div className="space-y-1">
            {filtered.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)} className={`w-full rounded-lg p-3 text-right text-sm font-bold ${active === item.id ? 'bg-blue-700 text-white' : 'hover:bg-slate-100'}`}>
                <span className="block">{item.title}</span>
                <span className={`text-[10px] ${active === item.id ? 'text-blue-100' : 'text-slate-400'}`}>{item.category}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-xl border bg-white p-5 shadow-sm print:border-0 print:shadow-none">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500">فورم {forms.findIndex(item => item.id === form.id) + 1} از {forms.length}</div>
              <h2 className="mt-1 text-xl font-black">{form.title}</h2>
              <p className="mt-1 text-xs text-slate-500">دسته: {form.category}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button type="button" onClick={() => window.print()} className="rounded-lg border px-4 py-2 text-sm font-bold">چاپ</button>
              <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'در حال اجرا...' : 'ذخیره'}</button>
            </div>
          </div>

          {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-900 print:hidden">{message}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            {form.fields.map(field => (
              <label key={field.key} className={`space-y-1 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                <span className="block text-xs font-bold text-slate-700">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea className="min-h-24 w-full rounded-lg border px-3 py-2" value={values[field.key] ?? ''} onChange={event => update(field.key, event.target.value)} />
                ) : field.type === 'file' ? (
                  <div className="space-y-1">
                    <input type="file" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(field.key, file); }} />
                    {values[field.key] && <div className="text-[11px] text-slate-500">فایل ثبت‌شده است.</div>}
                  </div>
                ) : (
                  <input className="w-full rounded-lg border px-3 py-2" type={field.type ?? 'text'} value={values[field.key] ?? ''} onChange={event => update(field.key, event.target.value)} />
                )}
              </label>
            ))}
          </div>

          <div className="mt-8 grid gap-8 border-t pt-6 sm:grid-cols-2">
            <div><div className="text-sm font-bold">نام و امضای درخواست‌کننده</div><div className="mt-10 border-b" /></div>
            <div><div className="text-sm font-bold">مهر و امضای شرکت</div><div className="mt-10 border-b" /></div>
          </div>

          <p className="mt-6 text-[10px] leading-5 text-slate-500">این صفحه برای مدیریت دیجیتال پرونده ساخته شده است. متن، ترتیب و نسخه چاپی فورم‌های رسمی باید قبل از ارائه رسمی با آخرین نسخه منتشرشده توسط د افغانستان بانک تطبیق شود.</p>
        </section>
      </div>
    </main>
  );
}
