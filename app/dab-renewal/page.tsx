'use client';

import DabAllFormsOperationalWorkspace from '@/components/DabAllFormsOperationalWorkspace';
import { useCompany } from '@/lib/companyContext';

export default function DabRenewalPage() {
  const { activeCompanyId } = useCompany();
  return <DabAllFormsOperationalWorkspace companyId={activeCompanyId} />;
}
