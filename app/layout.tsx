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
                  var win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : self);
                  if (!win) return;
                  
                  var _fetch = win.fetch;
                  var target = win;
                  var desc = Object.getOwnPropertyDescriptor(win, 'fetch');
                  
                  if (!desc && Object.getPrototypeOf(win)) {
                    var proto = Object.getPrototypeOf(win);
                    var protoDesc = Object.getOwnPropertyDescriptor(proto, 'fetch');
                    if (protoDesc) {
                      target = proto;
                      desc = protoDesc;
                    }
                  }
                  
                  if (desc && desc.configurable) {
                    Object.defineProperty(target, 'fetch', {
                      get: function() { return _fetch; },
                      set: function(v) { _fetch = v; },
                      configurable: true,
                      enumerable: true
                    });
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
