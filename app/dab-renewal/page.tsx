'use client';

import DabLicenseRenewalForm from '@/components/DabLicenseRenewalForm';
import DabRenewalCompliancePanel from '@/components/DabRenewalCompliancePanel';
import DabRenewalApplicationWorkflow from '@/components/DabRenewalApplicationWorkflow';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <DabLicenseRenewalForm companyId={activeCompanyId} />
        <DabRenewalCompliancePanel companyId={activeCompanyId} />
        <DabRenewalApplicationWorkflow companyId={activeCompanyId} />
      </div>
    </main>
  );
}
