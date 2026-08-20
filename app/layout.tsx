import type {Metadata} from 'next';
import '@/lib/patchFetch';
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
                  if (typeof window !== 'undefined' && window.fetch) {
                    var _currentFetch = window.fetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() {
                        return _currentFetch;
                      },
                      set: function(v) {
                        _currentFetch = v;
                      },
                      configurable: true,
                      enumerable: true
                    });
                  }
                } catch(e) {}
              })();
            `,
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

