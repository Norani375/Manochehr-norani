'use client';

import { useMemo, useState } from 'react';

type OrgNode = {
  id: string;
  title: string;
  name: string;
};

const DEFAULT_NODES: OrgNode[] = [
  { id: 'shareholders', title: 'سهمداران', name: 'نام سهمدار / سهمداران' },
  { id: 'board', title: 'هیأت نظار', name: 'بسم‌الله شیرزی' },
  { id: 'executive', title: 'مسئول عملیاتی / مدیریت اجرائی', name: 'نام مسئول عملیاتی' },
  { id: 'finance', title: 'مالی و حسابداری', name: 'نام مسئول مالی / حسابدار' },
  { id: 'compliance', title: 'نظارت و مطابقت / AML', name: 'نام مسئول مطابقت / AML' },
  { id: 'operations', title: 'عملیات و نمایندگی‌ها', name: 'نام مسئول عملیات' },
  { id: 'branches', title: 'نمایندگی‌ها / شعبات', name: 'نام مسئول نمایندگی / شعبه' },
];

const cloneNodes = () => DEFAULT_NODES.map((node) => ({ ...node }));

export default function DabOrganizationChartStandardForm({ companyId = 'default' }: { companyId?: string }) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return cloneNodes();
    try {
      const saved = window.localStorage.getItem(`dab-org-chart:${companyId}`);
      if (saved) return JSON.parse(saved) as OrgNode[];
    } catch {
      return cloneNodes();
    }
    return cloneNodes();
  }, [companyId]);

  const [nodes, setNodes] = useState<OrgNode[]>(initial);
  const [saved, setSaved] = useState(false);

  const updateNode = (id: string, field: 'title' | 'name', value: string) => {
    setNodes((current) => current.map((node) => (node.id === id ? { ...node, [field]: value } : node)));
    setSaved(false);
  };

  const save = () => {
    window.localStorage.setItem(`dab-org-chart:${companyId}`, JSON.stringify(nodes));
    setSaved(true);
  };

  const node = (id: string) => nodes.find((item) => item.id === id);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 text-slate-900 print:bg-white print:p-0">
      <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 px-6 py-5 print:border-b-2 print:px-0">
          <h1 className="text-center text-2xl font-bold">چارت تشکیلات شرکت صرافی و خدمات پولی</h1>
        </header>

        <div className="overflow-x-auto px-6 py-8 print:px-0">
          <div className="mx-auto min-w-[760px] max-w-5xl">
            <div className="mx-auto max-w-sm">
              <OrgCard node={node('shareholders')} onChange={updateNode} emphasized />
            </div>
            <Connector />
            <div className="mx-auto max-w-sm">
              <OrgCard node={node('board')} onChange={updateNode} emphasized />
            </div>
            <Connector />
            <div className="mx-auto max-w-sm">
              <OrgCard node={node('executive')} onChange={updateNode} emphasized />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-5">
              <OrgCard node={node('finance')} onChange={updateNode} />
              <OrgCard node={node('compliance')} onChange={updateNode} />
              <OrgCard node={node('operations')} onChange={updateNode} />
            </div>

            <Connector />
            <div className="mx-auto max-w-sm">
              <OrgCard node={node('branches')} onChange={updateNode} />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-center gap-3 border-t border-slate-200 px-6 py-4 print:hidden">
          <button type="button" onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">ذخیره</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">چاپ</button>
          {saved && <span className="text-sm text-emerald-700">ذخیره شد.</span>}
        </footer>
      </section>
    </main>
  );
}

function Connector() {
  return <div className="mx-auto my-3 h-7 w-px bg-slate-300" aria-hidden="true" />;
}

function OrgCard({ node, onChange, emphasized = false }: { node?: OrgNode; onChange: (id: string, field: 'title' | 'name', value: string) => void; emphasized?: boolean }) {
  if (!node) return null;
  return (
    <article className={`rounded-xl border bg-white p-4 text-center shadow-sm ${emphasized ? 'border-slate-400 shadow-md' : 'border-slate-200'}`}>
      <input aria-label="وظیفه" value={node.title} onChange={(event) => onChange(node.id, 'title', event.target.value)} className="w-full border-0 bg-transparent text-center text-sm font-bold outline-none" />
      <input aria-label="نام" value={node.name} onChange={(event) => onChange(node.id, 'name', event.target.value)} className="mt-2 w-full border-0 bg-transparent text-center text-sm text-slate-700 outline-none" />
    </article>
  );
}
