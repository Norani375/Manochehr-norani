import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Barakatullah Ghafoori Org Chart',
  description: 'Professional organizational chart for Barakatullah Ghafoori Exchange and Financial Services Company.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
