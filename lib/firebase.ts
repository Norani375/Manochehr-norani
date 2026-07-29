import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore is offline or uninitialized.');
    }
  }
}

export interface PersonnelNode {
  id: string;
  name: string;
  title: string;
  category: 'president' | 'board' | 'operations' | 'compliance' | 'branch';
  key: string;
}

export interface CompanySettings {
  issueDate: string;
  customLogo?: string | null;
}

// Sync all personnel to Firestore
export async function savePersonnelToFirestore(personnelList: PersonnelNode[]) {
  const path = 'personnel';
  try {
    for (const p of personnelList) {
      await setDoc(doc(db, path, p.key), {
        id: p.id,
        name: p.name,
        title: p.title,
        category: p.category,
        key: p.key
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save single node update
export async function saveSinglePersonnelToFirestore(p: PersonnelNode) {
  const path = `personnel/${p.key}`;
  try {
    await setDoc(doc(db, 'personnel', p.key), {
      id: p.id,
      name: p.name,
      title: p.title,
      category: p.category,
      key: p.key
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete single node
export async function deletePersonnelFromFirestore(key: string) {
  const path = `personnel/${key}`;
  try {
    await deleteDoc(doc(db, 'personnel', key));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save company settings
export async function saveSettingsToFirestore(settings: CompanySettings) {
  const path = 'settings/company';
  try {
    await setDoc(doc(db, 'settings', 'company'), {
      issueDate: settings.issueDate,
      customLogo: settings.customLogo || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to real-time personnel updates
export function subscribePersonnel(callback: (list: PersonnelNode[]) => void) {
  const path = 'personnel';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PersonnelNode[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.key && data.id && data.name && data.title && data.category) {
          list.push({
            id: data.id,
            name: data.name,
            title: data.title,
            category: data.category,
            key: data.key
          });
        }
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Subscribe to real-time settings updates
export function subscribeSettings(callback: (settings: CompanySettings) => void) {
  const path = 'settings/company';
  return onSnapshot(
    doc(db, 'settings', 'company'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          issueDate: data.issueDate || '۱۴۰۴/۰۱/۰۱',
          customLogo: data.customLogo || null
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
