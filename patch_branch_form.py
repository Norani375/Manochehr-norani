import re

with open('components/DabBranchRenewalForm.tsx', 'r') as f:
    content = f.read()

import_statement = "import { db } from '@/lib/firebase';\nimport { doc, setDoc, onSnapshot } from 'firebase/firestore';"
content = content.replace("import { Building,", import_statement + "\nimport { Building,")

use_effect = """  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'branch_renewal_form_v1');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData?.formData) {
            setData(prev => ({ ...prev, ...remoteData.formData }));
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
      localStorage.setItem('dab_branch_renewal_data', JSON.stringify(data));
      const docRef = doc(db, 'settings', 'branch_renewal_form_v1');
      await setDoc(docRef, { formData: data, updatedAt: new Date().toISOString() }, { merge: true });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save', e);
    }
  };"""

content = re.sub(r"  const handleSave = \(\) => \{.*?\n  \};", save_func, content, flags=re.DOTALL)

with open('components/DabBranchRenewalForm.tsx', 'w') as f:
    f.write(content)
