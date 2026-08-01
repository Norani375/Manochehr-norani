import re

with open('app/layout.tsx', 'r') as f:
    content = f.read()

# Remove the <head> block entirely. The fetch polyfill can just be placed at the top of <body>.
# Wait, this polyfill is for window.fetch. Placing it at the top of body is fine.
content = re.sub(r'<head>.*?</head>', '', content, flags=re.DOTALL)

# Insert the script inside body
script = """
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
"""
content = content.replace('<body className="font-sans" suppressHydrationWarning>', '<body className="font-sans" suppressHydrationWarning>\n' + script)

with open('app/layout.tsx', 'w') as f:
    f.write(content)
