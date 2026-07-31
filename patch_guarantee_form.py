import re

with open('components/DabGuaranteeForm.tsx', 'r') as f:
    content = f.read()

import_statement = "import { db } from '@/lib/firebase';\nimport { doc, setDoc, onSnapshot } from 'firebase/firestore';"
content = content.replace("import { UserCheck,", import_statement + "\nimport { UserCheck,")

use_effect = """  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'guarantee_form_v1');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData?.formData) {
            setFormData(prev => ({ ...prev, ...remoteData.formData }));
          }
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase load error:", error);
    }
  }, []);

  useEffect(() => {"""

content = content.replace("  useEffect(() => {", use_effect, 1)

save_func = """  const handleSave = async () => {
    try {
      localStorage.setItem('dab_guarantee_form_data', JSON.stringify(formData));
      const docRef = doc(db, 'settings', 'guarantee_form_v1');
      await setDoc(docRef, { formData, updatedAt: new Date().toISOString() }, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save DAB form', e);
    }
  };"""

content = re.sub(r"  const handleSave = \(\) => \{.*?\n  \};", save_func, content, flags=re.DOTALL)

with open('components/DabGuaranteeForm.tsx', 'w') as f:
    f.write(content)
