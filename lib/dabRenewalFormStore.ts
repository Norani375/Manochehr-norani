/**
 * DAB renewal form persistence helpers.
 * Keep renewal form data separate from the general settings collection.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type DabRenewalFormData = Record<string, unknown>;

export function dabRenewalFormRef(companyId: string, formId: string) {
  return doc(db, `companies/${companyId}/dabOfficialForms/${formId}`);
}

export async function saveDabRenewalForm(
  companyId: string,
  formId: string,
  data: DabRenewalFormData,
) {
  const ref = dabRenewalFormRef(companyId, formId);
  await setDoc(
    ref,
    {
      formId,
      values: data,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function loadDabRenewalForm(companyId: string, formId: string) {
  const snapshot = await getDoc(dabRenewalFormRef(companyId, formId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as {
    formId: string;
    values?: DabRenewalFormData;
    status?: string;
    updatedAt?: string;
  };
}
