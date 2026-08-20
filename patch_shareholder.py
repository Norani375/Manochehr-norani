with open('components/DabShareholderGuaranteeForm.tsx', 'r') as f:
    content = f.read()

old_input = '''function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-right"><span className="mb-1 block text-sm font-semibold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-none border border-slate-700 bg-white px-2 text-right outline-none focus:ring-2 focus:ring-slate-400" /></label>;
}'''

new_input = '''function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const isTazkira = label.includes('تذکره');
  return <label className="block text-right"><span className="mb-1 block text-sm font-semibold">{label}</span><input dir={isTazkira ? "ltr" : undefined} value={value} onChange={(e) => onChange(isTazkira ? toEnglishDigits(e.target.value) : e.target.value)} className={`h-10 w-full rounded-none border border-slate-700 bg-white px-2 outline-none focus:ring-2 focus:ring-slate-400 ${isTazkira ? 'text-left font-sans' : 'text-right'}`} /></label>;
}'''

content = content.replace(old_input, new_input)
with open('components/DabShareholderGuaranteeForm.tsx', 'w') as f:
    f.write(content)
