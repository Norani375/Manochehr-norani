import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

const storage = getStorage(getApp());

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadRenewalDocument(
  companyId: string,
  requirementKey: string,
  file: File,
  userId: string,
) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('فقط PDF، JPG و PNG قابل قبول است.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `companies/${companyId}/renewal-documents/${requirementKey}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      companyId,
      requirementKey,
      uploadedBy: userId,
    },
  });

  return {
    fileName: file.name,
    storagePath,
    downloadUrl: await getDownloadURL(snapshot.ref),
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
  };
}
