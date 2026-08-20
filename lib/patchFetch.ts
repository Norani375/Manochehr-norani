if (typeof window !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch');
    if (!desc || !desc.set) {
      let currentFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch;
        },
        set(v) {
          currentFetch = v;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (_) {
    // Safe fallback if property definition fails
  }
}
