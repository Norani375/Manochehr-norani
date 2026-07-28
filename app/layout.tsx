import type {Metadata} from 'next';
import './globals.css'; // Global styles

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
                  var originalFetch = window.fetch;
                  var currentFetch = originalFetch;
                  var desc = Object.getOwnPropertyDescriptor(window, 'fetch') || 
                             (window.constructor && Object.getOwnPropertyDescriptor(window.constructor.prototype, 'fetch'));
                  if (!desc || !desc.set) {
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return currentFetch; },
                      set: function(val) { currentFetch = val; },
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
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
