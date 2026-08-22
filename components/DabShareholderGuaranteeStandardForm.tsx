'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { barakatullahGhafouriProfile as profile } from '@/lib/barakatullahGhafouriProfile';

export type GuaranteeRow = {
  id: string;
  shareholderName: string;
  shareholderFatherName: string;
  shareholderIdentityNo: string;
  guarantorName: string;
  guarantorFatherName: string;
  guarantorIdentityNo: string;
  guarantorPhone: string;
  guarantorAddress: string;
  relationship: string;
};

type FormData = {
  companyName: string;
  licenseNo: string;
  province: string;
  issueDate: string;
  guaranteeAmount: string;
  rows: GuaranteeRow[];
  undertakings: string;
  authorizedName: string;
  authorizedTitle: string;
};

const storageKey = (companyId: string) => `dab_guarantee_form_data_${companyId}`;
const canonicalPath = (companyId: string) => `companies/${companyId}/dabOfficialForms/shareholder-guarantee`;

function defaults(): FormData {
  return {
    companyName: profile.legalName,
    licenseNo: profile.licenseNo,
    province: profile.province,
    issueDate: new Date().toISOString().slice(0, 10),
    guaranteeAmount: '',
    rows: profile.shareholders.map((shareholder, index) => ({
      id: String(index + 1),
      shareholderName: shareholder.name ?? '',
      shareholderFatherName: shareholder.fatherName ?? '',
      shareholderIdentityNo: shareholder.identityNo ?? '',
      guarantorName: profile.guarantors[index]?.name ?? profile.guarantors[0]?.name ?? '',
      guarantorFatherName: profile.guarantors[index]?.fatherName ?? profile.guarantors[0]?.fatherName ?? '',
      guarantorIdentityNo: profile.guarantors[index]?.identityNo ?? profile.guarantors[0]?.identityNo ?? '',
      guarantorPhone: profile.guarantors[index]?.phone ?? profile.guarantors[0]?.phone ?? '',
      guarantorAddress: profile.address,
      relationship: '',
    })),
    undertakings: 'اینجانب/اینجانبان صحت معلومات فوق را تصدیق نموده و مطابق شرایط و مقررات نافذه، مسئولیت تعهدات مربوط را می‌پذیریم.',
    authorizedName: profile.complianceOfficer.name,
    authorizedTitle: 'مسئول پیروی از قوانین و مقررات',
  };
}

export default function DabShareholderGuaranteeStandardForm({ companyId = 'default' }: { companyId?: string }) {
  const initial = useMemo(defaults, []);
  const [data, setData] = useState<FormData>(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const legacy = localStorage.getItem(storageKey(companyId));
      if (legacy) {
        const old = JSON.parse(legacy);
        if (old?.formData) setData((current) => ({ ...current, ...old.formData }));
        else if (old) setData((current) => ({ ...current, ...old }));
      }
    } catch { /* keep safe defaults */ }

    const unsubscribe = onSnapshot(doc(db, canonicalPath(companyId)), (snapshot) => {
      if (snapshot.exists()) {
        const remote = snapshot.data()?.formData;
        if (remote) setData((current) => ({ ...current, ...remote }));
      }
    });
    return () => unsubscribe();
  }, [companyId]);

  const update = (key: keyof Omit<FormData, 'rows'>, value: string) => setData((d) => ({ ...d, [key]: value }));
  const updateRow = (id: string, key: keyof GuaranteeRow, value: string) => setData((d) => ({ ...d, rows: d.rows.map((r) => r.id === id ? { ...r, [key]: value } : r) }));
  const addRow = () => setData((d) => ({ ...d, rows: [...d.rows, { id: crypto.randomUUID(), shareholderName: '', shareholderFatherName: '', shareholderIdentityNo: '', guarantorName: '', guarantorFatherName: '', guarantorIdentityNo: '', guarantorPhone: '', guarantorAddress: '', relationship: '' }] }));
  const removeRow = (id: string) => setData((d) => ({ ...d, rows: d.rows.filter((r) => r.id !== id) }));

  const save = async () => {
    const payload = { formData: data, updatedAt: new Date().toISOString(), formId: 'shareholder-guarantee' };
    localStorage.setItem(storageKey(companyId), JSON.stringify(data));
    await setDoc(doc(db, canonicalPath(companyId)), payload, { merge: true });
    setSaved(true); window.setTimeout(() => setSaved(false), 2500);
  };

  return <main className="mx-auto max-w-6xl p-4 text-slate-900" dir="rtl">
    <section className="mb-4 border-b-2 border-slate-900 pb-4 text-center">
      <h1 className="text-xl font-bold">د افغانستان بانک</h1>
      <p>آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p>
      <h2 className="mt-3 text-lg font-bold">فورم تضمین سر سهمدار / سهمداران شرکت صرافی و خدمات پولی</h2>
      <p className="mt-2 text-xs text-slate-600">فورم دیجیتال بر اساس Registry رسمی پروژه. نسخه چاپی باید با آخرین فورم منتشرشده د افغانستان بانک تطبیق نهایی شود.</p>
    </section>

    <section className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
      {([['companyName','نام شرکت'],['licenseNo','شماره جواز'],['province','ولایت'],['issueDate','تاریخ فورم']] as const).map(([key,label]) => <label key={key} className="text-sm font-medium">{label}<input value={data[key]} onChange={(e)=>update(key,e.target.value)} className="mt-1 w-full border p-2" /></label>)}
      <label className="text-sm font-medium">مبلغ تضمین<input value={data.guaranteeAmount} inputMode="numeric" onChange={(e)=>update('guaranteeAmount',e.target.value)} className="mt-1 w-full border p-2" /></label>
    </section>

    <section className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm"><thead><tr>{['شماره','نام سهمدار','نام پدر','شماره تذکره','نام تضمین‌کننده','نام پدر','شماره تذکره','تماس','آدرس','نسبت / رابطه',''].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{data.rows.map((row,index)=><tr key={row.id}><td className="border p-2 text-center">{index+1}</td>{(['shareholderName','shareholderFatherName','shareholderIdentityNo','guarantorName','guarantorFatherName','guarantorIdentityNo','guarantorPhone','guarantorAddress','relationship'] as (keyof GuaranteeRow)[]).map((key)=><td key={key} className="border p-1"><input value={String(row[key])} onChange={(e)=>updateRow(row.id,key,e.target.value)} className="w-full min-w-28 bg-transparent p-1" /></td>)}<td className="border p-1 print:hidden"><button onClick={()=>removeRow(row.id)} className="px-2">حذف</button></td></tr>)}</tbody></table>
      <button onClick={addRow} className="mt-3 border px-4 py-2 print:hidden">افزودن سهمدار</button>
    </section>

    <section className="mt-6"><label className="text-sm font-bold">تعهد و تضمین<textarea value={data.undertakings} onChange={(e)=>update('undertakings',e.target.value)} rows={5} className="mt-2 w-full border p-3" /></label></section>
    <section className="mt-6 grid gap-3 md:grid-cols-2"><label>نام شخص مجاز<input value={data.authorizedName} onChange={(e)=>update('authorizedName',e.target.value)} className="mt-1 w-full border p-2" /></label><label>عنوان وظیفه<input value={data.authorizedTitle} onChange={(e)=>update('authorizedTitle',e.target.value)} className="mt-1 w-full border p-2" /></label></section>
    <footer className="mt-8 flex gap-3 print:hidden"><button onClick={save} className="border px-5 py-2">{saved ? 'ذخیره شد' : 'ذخیره فورم'}</button><button onClick={()=>window.print()} className="border px-5 py-2">چاپ</button></footer>
  </main>;
}
