import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { CompanyProvider } from '@/lib/companyContext';

export const metadata: Metadata = {
  title: 'Barakatullah Ghafoori Org Chart',
  description: 'Professional organizational chart for Barakatullah Ghafoori Exchange and Financial Services Company.',
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
                  if (win.Window && win.Window.prototype) {
                    patchFetchOn(win.Window.prototype);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </body>
    </html>
  );
}
