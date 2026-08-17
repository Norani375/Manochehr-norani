'use client';

import React from 'react';
import OrgChartCanvas from './OrgChartCanvas';
import DabLicenseRenewalLetter from './DabLicenseRenewalLetter';
import MeetingMinutes from './MeetingMinutes';
import DabLicenseRenewalForm from './DabLicenseRenewalForm';
import DabBranchRenewalForm from './DabBranchRenewalForm';
import DabGuaranteeForm from './DabGuaranteeForm';
import CompanyProposal from './CompanyProposal';
import CompanyArticles from './CompanyArticles';
import DabLicenseRenewalChecklist from './DabLicenseRenewalChecklist';
import DabBranchRenewalChecklist from './DabBranchRenewalChecklist';
import DabLicenseChecklist from './DabLicenseChecklist';
import EmployeeManagement from './EmployeeManagement';
import ComplianceReporting from './ComplianceReporting';
import { Building2, ShieldCheck, FileText, CheckCircle2, Calendar, MapPin, Award } from 'lucide-react';

export interface BatchExportStagingProps {
  selectedDocIds: string[];
  customLogo?: string | null;
  companyId?: string;
  includeCoverPage?: boolean;
  companyName?: string;
  licenseNumber?: string;
  issueDate?: string;
  selectedDocsMeta?: { id: string; title: string; category: string }[];
}

export default function BatchExportStaging({
  selectedDocIds,
  customLogo,
  companyId = 'default',
  includeCoverPage = true,
  companyName = 'شرکت صرافی و خدمات پولی برکت‌الله غفوری',
  licenseNumber = 'DAB/7-0965',
  issueDate = '۱۴۰۴/۰۱/۰۱',
  selectedDocsMeta = [],
}: BatchExportStagingProps) {
  if (selectedDocIds.length === 0) return null;

  return (
    <div
      id="batch-export-staging-area"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-99999px',
        top: 0,
        width: '1200px',
        maxWidth: '1200px',
        minWidth: '1150px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        zIndex: -9999,
        pointerEvents: 'none',
        opacity: 1,
      }}
      className="dir-rtl print:hidden font-sans"
    >
      {/* Official Cover Page for the Batch Document Package */}
      {includeCoverPage && (
        <div
          id="batch-cover-page-canvas"
          className="p-12 bg-white text-slate-900 min-h-[1450px] flex flex-col justify-between border-8 border-double border-blue-950 m-4 rounded-xl relative overflow-hidden"
          style={{ width: '1120px', margin: '16px auto', boxSizing: 'border-box' }}
        >
          {/* Top Decorative Corner Elements */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600"></div>
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600"></div>

          {/* Header Block */}
          <div className="text-center space-y-4 pt-6 border-b-2 border-slate-300 pb-8">
            <div className="flex items-center justify-between px-8">
              <div className="text-right space-y-1 text-xs font-bold text-slate-600">
                <p>د افغانستان بانک</p>
                <p>آمریت عمومی نظارت بر موسسات مالی غیربانکی</p>
                <p>مدیریت عمومی جوازدهی صرافان و خدمات پولی</p>
              </div>

              {/* Central Logo */}
              <div className="flex flex-col items-center justify-center">
                {customLogo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={customLogo} alt="Logo" className="w-24 h-24 object-contain rounded-2xl p-1 bg-white border border-slate-200 shadow-md" />
                ) : (
                  <div className="w-24 h-24 bg-blue-950 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-500">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <span className="text-[11px] font-black text-blue-900 mt-1.5 font-mono">DAB REGISTERED</span>
              </div>

              <div className="text-left space-y-1 text-xs font-bold text-slate-600 font-mono">
                <p className="font-sans">شماره مکتوب: <span className="font-mono font-black text-slate-900">BG-DAB/1404-098</span></p>
                <p className="font-sans">تاریخ ثبت: <span className="font-mono font-black text-slate-900">{issueDate}</span></p>
                <p className="font-sans">شماره جواز: <span className="font-mono font-black text-blue-900">{licenseNumber}</span></p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <div className="inline-block bg-blue-950 text-white px-8 py-2.5 rounded-full text-base font-black tracking-wide shadow-md">
                بسته جامع اسناد و مدارک رسمی (Official Document Dossier)
              </div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight pt-2">
                {companyName}
              </h1>
              <p className="text-sm font-bold text-blue-900 font-mono">
                Barakatullah Ghafouri Money Exchange & Payment Services Company (MSP)
              </p>
              <p className="text-xs text-slate-600 font-medium max-w-2xl mx-auto">
                مجموعه پرونده کامل مدارک تمدید جواز فعالیت، چارت تشکیلاتی، اساسنامه، صورت‌جلسات و تأییدیه‌های نظارتی د افغانستان بانک
              </p>
            </div>
          </div>

          {/* Document Summary Info Grid */}
          <div className="grid grid-cols-4 gap-4 my-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">نوعیت شرکت:</span>
              <span className="font-black text-slate-900">سهامی خاص (MSP صرافی)</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">سرمایه ثبت‌شده:</span>
              <span className="font-black text-emerald-800 font-mono">۵۰,۰۰۰,۰۰۰ افغانی</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">آدرس مرکز:</span>
              <span className="font-black text-slate-900">کندز، سرای راسته، مارکت مرکزی</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">تعداد اسناد پیوست:</span>
              <span className="font-black text-blue-900 font-mono text-sm">{selectedDocIds.length} سند رسمی</span>
            </div>
          </div>

          {/* Table of Contents of Included Documents */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 border-b-2 border-blue-900 pb-2">
              <FileText className="w-5 h-5 text-blue-900" />
              <h3 className="font-black text-base text-slate-900">
                فهرست محتویات و اسناد مندرج در این بسته (Table of Contents)
              </h3>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-blue-950 text-white font-bold">
                    <th className="p-3 w-12 text-center">ردیف</th>
                    <th className="p-3">عنوان سند رسمی</th>
                    <th className="p-3 w-56">دسته‌بندی و مرجع</th>
                    <th className="p-3 w-32 text-center">وضعیت انطباق</th>
                    <th className="p-3 w-24 text-center">تأییدیه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedDocsMeta.map((doc, idx) => (
                    <tr key={doc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                      <td className="p-3 text-center font-bold font-mono text-slate-600">{idx + 1}</td>
                      <td className="p-3 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-semibold">{doc.category}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                          تأیید شده
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 font-bold">DAB-OK</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="pt-8 mt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
            {/* Box 1: Chairman */}
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-600">رئیس هیئت مدیره و سهمدار اصلی</p>
              <p className="font-black text-sm text-slate-900 pt-1">برکت‌الله غفوری</p>
              <div className="pt-8 border-t border-dashed border-slate-300 text-[10px] text-slate-400 font-semibold">
                امضاء و شصت
              </div>
            </div>

            {/* Box 2: Board of Supervisors */}
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-600">رئیس هیئت نظار مستقل</p>
              <p className="font-black text-sm text-slate-900 pt-1">بسم‌الله شیرزی</p>
              <div className="pt-8 border-t border-dashed border-slate-300 text-[10px] text-slate-400 font-semibold">
                امضاء و تأییدیه نظارتی
              </div>
            </div>

            {/* Box 3: Official Seal */}
            <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between">
              <p className="font-bold text-slate-600">محل مهر رسمی شرکت</p>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-900 flex items-center justify-center text-[9px] font-bold text-blue-900 text-center p-1">
                مهر رسمی صرافی غفوری
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{licenseNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Staged Document Containers (rendered when selected) */}
      <div className="space-y-12">
        {selectedDocIds.includes('org-chart') && (
          <div id="staging-org-chart" className="batch-staged-doc">
            <OrgChartCanvas customLogo={customLogo} />
          </div>
        )}

        {selectedDocIds.includes('license-renewal-letter') && (
          <div id="staging-license-renewal-letter" className="batch-staged-doc">
            <DabLicenseRenewalLetter isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('meeting-minutes') && (
          <div id="staging-meeting-minutes" className="batch-staged-doc">
            <MeetingMinutes isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('license-renewal') && (
          <div id="staging-license-renewal" className="batch-staged-doc">
            <DabLicenseRenewalForm isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('branch-renewal') && (
          <div id="staging-branch-renewal" className="batch-staged-doc">
            <DabBranchRenewalForm isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('guarantee-form') && (
          <div id="staging-guarantee-form" className="batch-staged-doc">
            <DabGuaranteeForm isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('company-proposal') && (
          <div id="staging-company-proposal" className="batch-staged-doc">
            <CompanyProposal customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('company-articles') && (
          <div id="staging-company-articles" className="batch-staged-doc">
            <CompanyArticles customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('license-renewal-checklist') && (
          <div id="staging-license-renewal-checklist" className="batch-staged-doc">
            <DabLicenseRenewalChecklist isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('branch-renewal-checklist') && (
          <div id="staging-branch-renewal-checklist" className="batch-staged-doc">
            <DabBranchRenewalChecklist isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('license-checklist') && (
          <div id="staging-license-checklist" className="batch-staged-doc">
            <DabLicenseChecklist isEditMode={false} customLogo={customLogo} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('employees') && (
          <div id="staging-employees" className="batch-staged-doc">
            <EmployeeManagement customLogo={customLogo} isEditMode={false} companyId={companyId} />
          </div>
        )}

        {selectedDocIds.includes('compliance-reporting') && (
          <div id="staging-compliance-reporting" className="batch-staged-doc">
            <ComplianceReporting customLogo={customLogo} companyId={companyId} isEditMode={false} />
          </div>
        )}
      </div>
    </div>
  );
}
