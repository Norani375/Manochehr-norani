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
  const initial = useMemo(() => defaults(), []);
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
    await setDoc(doc(db, canonicalPath(companyId)), { formData: data, updatedAt: new Date().toISOString() }, { merge: true });
    localStorage.setItem(storageKey(companyId), JSON.stringify({ formData: data }));
    setSaved(true);
  };

  return null;
}
