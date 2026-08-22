import type { Metadata } from 'next';
import './globals.css';
import { CompanyProvider } from '@/lib/companyContext';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'DAB Forms and Company Management',
  description: 'Centralized company management and DAB form workspace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans" suppressHydrationWarning>
        <AuthProvider>
          <CompanyProvider>{children}</CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
