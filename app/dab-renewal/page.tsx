'use client';

import DabOfficialCompanyRenewalForm from '@/components/DabOfficialCompanyRenewalForm';
import DabRenewalCompliancePanel from '@/components/DabRenewalCompliancePanel';
import DabRenewalApplicationWorkflow from '@/components/DabRenewalApplicationWorkflow';
import DabRenewalCommandCenter from '@/components/DabRenewalCommandCenter';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <DabRenewalCommandCenter companyId={activeCompanyId} />
        <DabOfficialCompanyRenewalForm companyId={activeCompanyId} />
        <DabRenewalCompliancePanel companyId={activeCompanyId} />
        <DabRenewalApplicationWorkflow companyId={activeCompanyId} />
      </div>
    </main>
  );
}
