'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, FileCheck2, Save, ShieldCheck } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DAB_LICENSE_RENEWAL_REQUIREMENTS,
  DabRenewalDocumentRecord,
  RenewalDocumentStatus,
  canSubmitDabRenewal,
} from '@/lib/dabLicenseRenewalRequirements';

interface Props {
  companyId?: string;
  initialMajorChanges?: boolean;
}

const emptyRecords = (): DabRenewalDocumentRecord[] =>
  DAB_LICENSE_RENEWAL_REQUIREMENTS.map((requirement) => ({
    requirementKey: requirement.key,
    status: 'missing',
  }));

const statusLabels: Record<RenewalDocumentStatus, string> = {
  missing: 'ناقص',
  uploaded: 'آپلود شده',
  verified: 'تأیید شده',
  rejected: 'رد شده',
};

export default function DabRenewalCompliancePanel({ companyId = 'default', initialMajorChanges = false }: Props) {
  const [majorChanges, setMajorChanges] = useState(initialMajorChanges);
  const [documents, setDocuments] = useState<DabRenewalDocumentRecord[]>(emptyRecords);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'settings', `dab_renewal_compliance_v1_${companyId}`);
    return onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) return;
      const value = snapshot.data();
      if (Array.isArray(value?.documents)) setDocuments(value.documents);
      if (typeof value?.majorChanges === 'boolean') setMajorChanges(value.majorChanges);
    });
  }, [companyId]);

  const readiness = useMemo(
    () => canSubmitDabRenewal(documents, majorChanges),
    [documents, majorChanges],
  );

  const updateStatus = (key: DabRenewalDocumentRecord['requirementKey'], status: RenewalDocumentStatus) => {
    setDocuments((current) => current.map((item) =>
      item.requirementKey === key ? { ...item, status } : item,
    ));
  };

  const save = async () => {
    await setDoc(doc(db, 'settings', `dab_renewal_compliance_v1_${companyId}`), {
      companyId,
      majorChanges,
      documents,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="dir-rtl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-900 p-2.5 text-white"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h2 className="font-black text-slate-900">کنترول الزامات تمدید جواز DAB</h2>
            <p className="text-xs text-slate-500">این بخش بر اساس الزامات ثبت‌شده در موتور تمدید جواز کار می‌کند.</p>
          </div>
        </div>
        <button type="button" onClick={save} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
          <Save className="h-4 w-4" />
          {saved ? 'ذخیره شد' : 'ذخیره کنترول'}
        </button>
      </div>

      <label className="mb-5 flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
        <input type="checkbox" checked={majorChanges} onChange={(event) => setMajorChanges(event.target.checked)} />
        در معلومات اولیه شرکت تغییر عمده ایجاد شده است.
      </label>

      <div className={`mb-5 flex items-center gap-2 rounded-xl p-3 text-sm font-black ${readiness.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
        {readiness.ok ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
        {readiness.ok ? 'پرونده از نگاه اسناد اجباری آماده ارسال است.' : `پرونده هنوز ${readiness.missing.length} مورد ناقص دارد.`}
      </div>

      <div className="space-y-3">
        {DAB_LICENSE_RENEWAL_REQUIREMENTS.map((requirement) => {
          const record = documents.find((item) => item.requirementKey === requirement.key);
          const conditional = requirement.key === 'updatedInitialApplicationInformation';
          const required = requirement.required || (conditional && majorChanges);
          return (
            <div key={requirement.key} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-blue-700" />
                  <span className="font-bold text-slate-900">{requirement.titleFa}</span>
                  {required ? <span className="text-xs font-bold text-red-600">الزامی</span> : <span className="text-xs text-slate-500">شرطی</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">{requirement.legalBasis} — {requirement.descriptionFa}</p>
              </div>
              <select
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold"
                value={record?.status ?? 'missing'}
                onChange={(event) => updateStatus(requirement.key, event.target.value as RenewalDocumentStatus)}
              >
                {(Object.keys(statusLabels) as RenewalDocumentStatus[]).map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </section>
  );
}
