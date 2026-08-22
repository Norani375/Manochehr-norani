'use client';

import React from 'react';
import DabGuaranteeForm from './DabGuaranteeForm';

export default function DabShareholderGuaranteeForm() {
  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 py-6">
      <DabGuaranteeForm isEditMode={true} />
    </div>
  );
}

