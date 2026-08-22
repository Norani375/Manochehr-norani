'use client';

import { useMemo, useState } from 'react';

type OrgNode = { id: string; title: string; name: string };

const DEFAULT_NODES: OrgNode[] = [
  { id: 'shareholders', title: 'سهمدار', name: 'نام سهمدار' },
  { id: 'board', title: 'رئیس هیأت نظار', name: 'بسم‌الله شیرزی' },
  { id: 'executive', title: 'مسئول عملیاتی', name: 'نام مسئول عملیاتی' },
  { id: 'finance', title: 'مسئول مالی و حسابداری', name: 'نام مسئول مالی' },
  { id: 'compliance', title: 'مسئول مطابقت و AML', name: 'نام مسئول مطابقت' },
  { id: 'operations', title: 'مسئول عملیات', name: 'نام مسئول عملیات' },
  { id: 'branches', title: 'مسئول نمایندگی‌ها و شعبات', name: 'نام مسئول' },
];

export default function DabOrganizationChartStandardForm({ companyId = 'default' }: { companyId?: string }) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT_NODES;
    try {
      const saved = window.localStorage.getItem(`dab-org-chart:${companyId}`);
      return saved ? (JSON.parse(saved) as OrgNode[]) : DEFAULT_NODES;
    } catch {
      return DEFAULT_NODES;
    }
  }, [companyId]);

  const [nodes, setNodes] = useState<OrgNode[]>(initial);
  const [saved, setSaved] = useState(false);
  const node = (id: string) => nodes.find((item) => item.id === id);
  const updateNode = (id: string, field: 'title' | 'name', value: string) => {
    setNodes((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
    setSaved(false);
  };
  const save = () => {
    window.localStorage.setItem(`dab-org-chart:${companyId}`, JSON.stringify(nodes));
    setSaved(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 text-slate-900 print:min-h-0 print:bg-white print:p-0">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm print:m-0 print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 px-6 py-4 print:px-0 print:py-2">
          <h1 className="text-center text-xl font-bold print:text-base">چارت تشکیلات شرکت صرافی و خدمات پولی</h1>
        </header>

        <div className="px-6 py-6 print:px-0 print:py-2">
          <div className="mx-auto max-w-4xl">
            <ChartCard node={node('shareholders')} onChange={updateNode} primary />
            <Connector />
            <ChartCard node={node('board')} onChange={updateNode} primary />
            <Connector />
            <ChartCard node={node('executive')} onChange={updateNode} primary />

            <div className="relative mt-8 border-t border-slate-300 pt-6 print:mt-4 print:pt-4">
              <div className="absolute right-1/2 top-0 h-4 w-px -translate-y-4 bg-slate-300 print:h-3 print:-translate-y-3" />
              <div className="grid grid-cols-3 gap-5 print:gap-3">
                <ChartCard node={node('finance')} onChange={updateNode} />
                <ChartCard node={node('compliance')} onChange={updateNode} />
                <ChartCard node={node('operations')} onChange={updateNode} />
              </div>
            </div>

            <Connector />
            <ChartCard node={node('branches')} onChange={updateNode} />
          </div>
        </div>

        <footer className="flex justify-center gap-3 border-t border-slate-200 px-6 py-3 print:hidden">
          <button type="button" onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">ذخیره</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">چاپ</button>
          {saved && <span className="self-center text-sm text-emerald-700">ذخیره شد.</span>}
        </footer>
      </section>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body { width: 210mm; margin: 0; background: #fff !important; }
          * { break-inside: avoid !important; page-break-inside: avoid !important; }
          input { border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}

function Connector() {
  return <div className="mx-auto my-2 h-6 w-px bg-slate-300 print:my-1 print:h-3" aria-hidden="true" />;
}

function ChartCard({ node, onChange, primary = false }: { node?: OrgNode; onChange: (id: string, field: 'title' | 'name', value: string) => void; primary?: boolean }) {
  if (!node) return null;
  return (
    <article className={`mx-auto w-full max-w-sm rounded-lg border bg-white px-4 py-3 text-center print:max-w-none print:px-2 print:py-1.5 ${primary ? 'border-slate-400' : 'border-slate-300'}`}>
      <input aria-label="وظیفه" value={node.title} onChange={(event) => onChange(node.id, 'title', event.target.value)} className="w-full border-0 bg-transparent text-center text-sm font-bold outline-none print:text-[11px]" />
      <input aria-label="نام" value={node.name} onChange={(event) => onChange(node.id, 'name', event.target.value)} className="mt-1 w-full border-0 bg-transparent text-center text-sm text-slate-700 outline-none print:text-[10px]" />
    </article>
  );
}
