'use client';

import { useMemo, useState } from 'react';

type OrgNode = {
  id: string;
  title: string;
  name: string;
  children?: string[];
};

const DEFAULT_NODES: OrgNode[] = [
  { id: 'shareholders', title: 'سهمداران', name: 'نام سهمدار / سهمداران', children: ['board'] },
  { id: 'board', title: 'هیأت نظار', name: 'بسم‌الله شیرزی', children: ['executive'] },
  { id: 'executive', title: 'مسئول عملیاتی / مدیریت اجرائی', name: 'نام مسئول عملیاتی', children: ['finance', 'compliance', 'operations'] },
  { id: 'finance', title: 'مالی و حسابداری', name: 'مسئول مالی / حسابدار', children: [] },
  { id: 'compliance', title: 'نظارت و مطابقت', name: 'مسئول مطابقت / AML', children: [] },
  { id: 'operations', title: 'عملیات و نمایندگی‌ها', name: 'مسئول عملیات', children: ['branches'] },
  { id: 'branches', title: 'نمایندگی‌ها / شعبات', name: 'فهرست نمایندگی‌ها', children: [] },
];

const cloneNodes = () => DEFAULT_NODES.map((node) => ({ ...node, children: [...(node.children ?? [])] }));

export default function DabOrganizationChartStandardForm({ companyId = 'default' }: { companyId?: string }) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return cloneNodes();
    try {
      const saved = window.localStorage.getItem(`dab-org-chart:${companyId}`);
      if (saved) return JSON.parse(saved) as OrgNode[];
    } catch {
      // Use the official default structure when saved data is not readable.
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

  const print = () => window.print();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const root = byId.get('shareholders');

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 text-slate-900 print:bg-white print:p-0">
      <section className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 px-6 py-5 print:px-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">د افغانستان بانک</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">چارت تشکیلات شرکت صرافی و خدمات پولی</h1>
              <p className="mt-1 text-sm text-slate-500">نسخه استاندارد دیجیتال — قابل ویرایش، ذخیره و چاپ</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button type="button" onClick={save} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">ذخیره</button>
              <button type="button" onClick={print} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">چاپ</button>
            </div>
          </div>
          {saved && <p className="mt-3 text-sm font-medium text-emerald-700">معلومات چارت ذخیره شد.</p>}
        </header>

        <div className="overflow-x-auto px-6 py-8 print:px-0">
          <div className="min-w-[900px]">
            <OrgCard node={root} onChange={updateNode} />
            <div className="mx-auto h-8 w-px bg-slate-300" aria-hidden="true" />
            <div className="flex justify-center">
              <div className="h-px w-[70%] bg-slate-300" aria-hidden="true" />
            </div>
            <div className="relative grid grid-cols-3 gap-6 pt-8">
              <Branch node={byId.get('finance')} onChange={updateNode} />
              <Branch node={byId.get('compliance')} onChange={updateNode} />
              <Branch node={byId.get('operations')} onChange={updateNode} />
            </div>
            <div className="mx-auto mt-8 h-8 w-px bg-slate-300" aria-hidden="true" />
            <div className="flex justify-center">
              <Branch node={byId.get('branches')} onChange={updateNode} />
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500 print:px-0">
          <div className="flex flex-wrap justify-between gap-3">
            <span>شماره سند: DAB-ORG-CHART</span>
            <span>تاریخ: __________________</span>
            <span>مهر و امضاء: __________________</span>
          </div>
        </footer>
      </section>
    </main>
  );
}

function OrgCard({ node, onChange }: { node?: OrgNode; onChange: (id: string, field: 'title' | 'name', value: string) => void }) {
  if (!node) return null;
  return <div className="mx-auto max-w-md"><EditableCard node={node} onChange={onChange} emphasized /></div>;
}

function Branch({ node, onChange }: { node?: OrgNode; onChange: (id: string, field: 'title' | 'name', value: string) => void }) {
  if (!node) return null;
  return <EditableCard node={node} onChange={onChange} />;
}

function EditableCard({ node, onChange, emphasized = false }: { node: OrgNode; onChange: (id: string, field: 'title' | 'name', value: string) => void; emphasized?: boolean }) {
  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm ${emphasized ? 'border-slate-400 shadow-md' : 'border-slate-200'}`}>
      <input aria-label="عنوان بست" value={node.title} onChange={(event) => onChange(node.id, 'title', event.target.value)} className="w-full border-0 bg-transparent text-center text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200" />
      <input aria-label="نام مسئول" value={node.name} onChange={(event) => onChange(node.id, 'name', event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-center text-sm outline-none focus:border-slate-400" />
    </article>
  );
}
