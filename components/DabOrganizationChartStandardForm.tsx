'use client';

import { useMemo, useState } from 'react';

type OrgNode = {
  id: string;
  role: string;
  name: string;
};

const DEFAULT_NODES: OrgNode[] = [
  { id: 'shareholders', role: 'سهمدار', name: 'نام سهمدار' },
  { id: 'board', role: 'رئیس هیأت نظار', name: 'بسم‌الله شیرزی' },
  { id: 'management', role: 'مدیر اجرائی', name: 'نام مدیر اجرائی' },
  { id: 'finance', role: 'مسئول مالی و حسابداری', name: 'نام مسئول مالی' },
  { id: 'compliance', role: 'مسئول مطابقت و AML', name: 'نام مسئول مطابقت' },
  { id: 'operations', role: 'مسئول عملیات', name: 'نام مسئول عملیات' },
  { id: 'branches', role: 'مسئول نمایندگی‌ها و شعبات', name: 'نام مسئول' },
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

  const updateNode = (id: string, field: 'role' | 'name', value: string) => {
    setNodes((current) => {
      const next = current.map((item) => item.id === id ? { ...item, [field]: value } : item);
      window.localStorage.setItem(`dab-org-chart:${companyId}`, JSON.stringify(next));
      return next;
    });
  };

  const get = (id: string) => nodes.find((item) => item.id === id);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-3 py-5 text-slate-900 sm:px-5 print:bg-white print:p-0">
      <section className="mx-auto w-full max-w-6xl print:w-full print:max-w-none">
        <div className="mx-auto max-w-5xl">
          <ChartCard node={get('shareholders')} onChange={updateNode} />
          <VerticalLine />
          <ChartCard node={get('board')} onChange={updateNode} />
          <VerticalLine />
          <ChartCard node={get('management')} onChange={updateNode} />

          <div className="relative mt-7 pt-6 sm:mt-8 print:mt-5 print:pt-5">
            <div className="absolute left-1/2 top-0 h-6 w-px bg-slate-300 print:h-5" aria-hidden="true" />
            <div className="absolute left-[16.666%] right-[16.666%] top-6 h-px bg-slate-300 print:top-5" aria-hidden="true" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 print:grid-cols-3 print:gap-3">
              <ChartCard node={get('finance')} onChange={updateNode} />
              <ChartCard node={get('compliance')} onChange={updateNode} />
              <ChartCard node={get('operations')} onChange={updateNode} />
            </div>
          </div>

          <div className="mx-auto h-5 w-px bg-slate-300 print:h-4" aria-hidden="true" />
          <ChartCard node={get('branches')} onChange={updateNode} />
        </div>
      </section>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { width: 210mm; margin: 0; background: white !important; }
          *, *::before, *::after { break-inside: avoid !important; page-break-inside: avoid !important; }
          input { border: 0 !important; outline: none !important; box-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}

function VerticalLine() {
  return <div className="mx-auto h-6 w-px bg-slate-300 print:h-5" aria-hidden="true" />;
}

function ChartCard({ node, onChange }: { node?: OrgNode; onChange: (id: string, field: 'role' | 'name', value: string) => void }) {
  if (!node) return null;

  return (
    <article className="mx-auto flex min-h-[82px] w-full max-w-sm flex-col justify-center rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-3 text-center shadow-sm transition-colors hover:bg-slate-100 hover:shadow-md sm:min-h-[88px] print:min-h-0 print:rounded-none print:border-slate-300 print:bg-white print:px-3 print:py-2 print:shadow-none">
      <input
        value={node.name}
        aria-label="نام و تخلص"
        onChange={(event) => onChange(node.id, 'name', event.target.value)}
        className="block w-full truncate border-0 bg-transparent text-center text-sm font-bold leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-base print:text-[11px] print:leading-4"
      />
      <input
        value={node.role}
        aria-label="وظیفه"
        onChange={(event) => onChange(node.id, 'role', event.target.value)}
        className="mt-0.5 block w-full truncate border-0 bg-transparent text-center text-xs font-medium leading-5 text-slate-600 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-sm print:text-[10px] print:leading-4"
      />
    </article>
  );
}
