'use client';

import DabAllOfficialFormsWorkspace from '@/components/DabAllOfficialFormsWorkspace';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();
  return <DabAllOfficialFormsWorkspace companyId={activeCompanyId} />;
}
