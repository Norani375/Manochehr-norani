import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { DABRenewalAuditEvent, DABRenewalCase } from './dabRenewalDomain';

export function renewalCaseRef(companyId: string, applicationId: string) {
  return doc(db, 'companies', companyId, 'dabRenewalApplications', applicationId);
}

export async function saveRenewalCase(caseFile: DABRenewalCase) {
  const user = auth.currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  await setDoc(renewalCaseRef(caseFile.companyId, caseFile.applicationId), {
    ...caseFile,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  }, { merge: true });
}

export async function getRenewalCase(companyId: string, applicationId: string) {
  const snapshot = await getDoc(renewalCaseRef(companyId, applicationId));
  return snapshot.exists() ? snapshot.data() as DABRenewalCase : null;
}

export async function appendRenewalAudit(event: Omit<DABRenewalAuditEvent, 'id' | 'actorId' | 'createdAt'>) {
  const user = auth.currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  const auditRef = collection(db, 'companies', event.companyId, 'dabRenewalAudit');
  await addDoc(auditRef, { ...event, actorId: user.uid, createdAt: serverTimestamp() });
}
