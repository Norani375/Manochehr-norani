'use client';

import DabCompleteRenewalWorkspace from '@/components/DabCompleteRenewalWorkspace';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();
  return <DabCompleteRenewalWorkspace companyId={activeCompanyId} />;
}
