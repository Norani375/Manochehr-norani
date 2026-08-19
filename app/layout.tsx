import type {Metadata} from 'next';
import Link from 'next/link';
import './globals.css';
import { CompanyProvider } from '@/lib/companyContext';
import { AuthProvider } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'سیستم مدیریت جواز و تمدید جواز',
  description: 'مرکز مدیریت پرونده، فورم‌ها، اسناد، Compliance و گزارش تمدید جواز.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : self);
                  if (!win) return;
                  var _currentFetch = win.fetch;
                  function patchFetchOn(obj) {
                    if (!obj) return;
                    try {
                      var desc = Object.getOwnPropertyDescriptor(obj, 'fetch');
                      if (desc && !desc.configurable) return;
                      Object.defineProperty(obj, 'fetch', {
                        get: function() { return _currentFetch; },
                        set: function(v) { _currentFetch = v; },
                        configurable: true,
                        enumerable: true
                      });
                    } catch (e) {}
                  }
                  patchFetchOn(win);
                  if (win.Window && win.Window.prototype) patchFetchOn(win.Window.prototype);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <CompanyProvider>
              <div className="sticky top-0 z-50 border-b border-blue-200 bg-blue-950 px-4 py-2 text-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                  <span className="text-xs font-bold">مرکز مدیریت جواز و تمدید جواز</span>
                  <Link href="/dab-renewal" className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-blue-950 hover:bg-blue-50">
                    باز کردن مرکز تمدید DAB
                  </Link>
                </div>
              </div>
              {children}
            </CompanyProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
