'use client';

import DabOfficialFormsRegistryWorkspace from '@/components/DabOfficialFormsRegistryWorkspace';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();
  return <DabOfficialFormsRegistryWorkspace companyId={activeCompanyId} />;
}
