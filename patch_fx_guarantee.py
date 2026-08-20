with open('components/DabFxGuaranteeForm.tsx', 'r') as f:
    content = f.read()

if "toEnglishDigits" not in content:
    content = content.replace("import React,", "import { toEnglishDigits } from '@/lib/utils';\nimport React,")

old_field = """function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label className={textarea ? 'md:col-span-2' : ''}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-slate-400 p-2" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-b-2 border-slate-400 p-1 text-center font-bold" />
      )}
    </label>
  );
}"""

new_field = """function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  const isTazkira = label.includes('تذکره');
  return (
    <label className={textarea ? 'md:col-span-2' : ''}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-slate-400 p-2" />
      ) : (
        <input dir={isTazkira ? "ltr" : undefined} value={value} onChange={(e) => onChange(isTazkira ? toEnglishDigits(e.target.value) : e.target.value)} className={`w-full border-b-2 border-slate-400 p-1 font-bold ${isTazkira ? 'text-left font-sans' : 'text-center'}`} />
      )}
    </label>
  );
}"""

content = content.replace(old_field, new_field)
with open('components/DabFxGuaranteeForm.tsx', 'w') as f:
    f.write(content)
