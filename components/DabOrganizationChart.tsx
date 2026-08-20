'use client';

import { useState } from 'react';
import { barakatullahGhafouriProfile } from '@/lib/barakatullahGhafouriProfile';

type OrgNode = { id: string; title: string; subtitle: string; children?: OrgNode[] };

// Single source of truth: the compliance officer is defined only in the company profile.
const complianceOfficer = barakatullahGhafouriProfile.complianceOfficer;
const complianceOfficerName = `${complianceOfficer.name} ولد ${complianceOfficer.fatherName}`;
const complianceOfficerDetails = `تذکره ${complianceOfficer.identityNo} — ${complianceOfficer.education}`;
const complianceOfficerRole = 'مسئول پیروی از قوانین و مقررات و AML/CFT';

const initialChart: OrgNode = {
  id: 'shareholders',
  title: 'مجمع عمومی سهمداران',
  subtitle: 'مالکیت و تصمیم‌های اساسی',
  children: [
    {
      id: 'board',
      title: 'هیئت نظارتی',
      subtitle: 'نظارت و کنترول',
      children: [
        {
          id: 'manager',
          title: 'مدیر عمومی / مسئول اجرائیه',
          subtitle: 'رهبری و مدیریت عملیات',
          children: [
            {
              id: 'compliance',
              title: 'مسئول پیروی از قوانین و مقررات',
              subtitle: `${complianceOfficerName} — ${complianceOfficer.identityNo}`,
            },
            { id: 'finance', title: 'مدیریت مالی و حسابداری', subtitle: 'حسابدار و امور مالی' },
            { id: 'operations', title: 'مدیریت عملیات و معاملات', subtitle: 'معاملات و خدمات مشتریان' },
            { id: 'admin', title: 'اداری و منابع بشری', subtitle: 'کارکنان، اسناد و امور اداری' },
            { id: 'branches', title: 'نمایندگی‌ها', subtitle: 'نماینده باصلاحیت هر نمایندگی' },
          ],
        },
      ],
    },
  ],
};

function NodeCard({ node, onEdit }: { node: OrgNode; onEdit: (node: OrgNode) => void }) {
  return (
    <li className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={() => onEdit(node)}
        className="w-56 border-2 border-slate-700 bg-white p-4 text-center shadow-sm transition hover:bg-slate-50 print:shadow-none"
      >
        <strong className="block text-sm">{node.title}</strong>
        <span className="mt-1 block text-xs text-slate-600">{node.subtitle}</span>
      </button>
      {node.children?.length ? (
        <>
          <div className="h-6 border-r-2 border-slate-500" />
          <ul className="flex flex-wrap justify-center gap-4 border-t-2 border-slate-500 pt-6">
            {node.children.map((child) => (
              <NodeCard key={child.id} node={child} onEdit={onEdit} />
            ))}
          </ul>
        </>
      ) : null}
    </li>
  );
}

export default function DabOrganizationChart() {
  const [selected, setSelected] = useState<OrgNode | null>(null);
  const [companyName, setCompanyName] = useState<string>(String(barakatullahGhafouriProfile.legalName));
  const [effectiveDate, setEffectiveDate] = useState<string>('');

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 border-2 border-slate-800 bg-white p-5 text-center print:border-x-0 print:border-t-0">
          <p className="font-bold">د افغانستان بانک</p>
          <p className="text-sm">آمریت عمومی نظارت از مؤسسات مالی غیر بانکی</p>
          <h1 className="mt-3 text-xl font-bold">چارت تشکیلاتی شرکت صرافی و خدمات پولی</h1>
          <p className="mt-1 text-sm">{companyName}</p>
        </header>

        <div className="mb-5 grid gap-3 border bg-white p-4 md:grid-cols-3 print:hidden">
          <label className="text-sm">
            نام شرکت
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full border p-2" />
          </label>
          <label className="text-sm">
            تاریخ نافذ شدن
            <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="mt-1 w-full border p-2" />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={() => window.print()} className="border bg-slate-900 px-5 py-2 text-white">
              چاپ چارت
            </button>
          </div>
        </div>

        <section className="mb-5 border-2 border-slate-700 bg-white p-5 print:break-inside-avoid">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">مسئول پیروی از قوانین و مقررات</span>
            <strong className="text-lg">{complianceOfficerName}</strong>
            <span className="text-sm text-slate-600">{complianceOfficerDetails}</span>
            <span className="text-sm text-slate-600">{complianceOfficerRole}</span>
            <span className="mt-2 inline-flex w-fit border px-2 py-1 text-xs font-semibold print:hidden">منبع مرکزی معلومات شرکت</span>
          </div>
        </section>

        <section className="overflow-x-auto border-2 border-slate-700 bg-white p-8 print:border-0">
          <ul className="min-w-max text-center">
            <NodeCard node={initialChart} onEdit={setSelected} />
          </ul>
        </section>

        <section className="mt-5 border-2 border-slate-700 bg-white p-5 print:break-inside-avoid">
          <h2 className="mb-3 font-bold">تأیید و امضا</h2>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            <div className="min-h-24 border p-4 text-sm">رئیس هیئت نظارتی<br /><br />امضا: __________________</div>
            <div className="min-h-24 border p-4 text-sm">مدیر عمومی<br /><br />امضا: __________________</div>
            <div className="min-h-24 border p-4 text-sm">مهر شرکت<br /><br />__________________</div>
          </div>
          <p className="mt-3 text-xs">تاریخ نافذ شدن: {effectiveDate || '__________________'}</p>
        </section>

        {selected ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
            <div className="w-full max-w-md bg-white p-5">
              <h2 className="font-bold">{selected.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{selected.subtitle}</p>
              {selected.id === 'compliance' ? (
                <div className="mt-4 border p-3 text-sm">
                  <p className="font-semibold">{complianceOfficerName}</p>
                  <p className="mt-1 text-slate-600">{complianceOfficerDetails}</p>
                  <p className="mt-2 text-slate-600">{complianceOfficerRole}</p>
                  <p className="mt-2 text-xs font-semibold">این رکورد از پروفایل مرکزی شرکت خوانده می‌شود.</p>
                </div>
              ) : (
                <p className="mt-4 text-sm">این بخش به ساختار تشکیلاتی و معلومات ثبت‌شده شرکت مربوط است.</p>
              )}
              <button type="button" onClick={() => setSelected(null)} className="mt-5 border px-4 py-2">بستن</button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
