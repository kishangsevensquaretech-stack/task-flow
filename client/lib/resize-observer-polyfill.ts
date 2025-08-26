// ResizeObserver error handler and polyfill
// This fixes the "ResizeObserver loop completed with undelivered notifications" error

// Global error handler for ResizeObserver
const resizeObserverErrorHandler = (event: ErrorEvent) => {
  if (
    event.message ===
      "ResizeObserver loop completed with undelivered notifications." ||
    event.message === "ResizeObserver loop limit exceeded"
  ) {
    event.stopImmediatePropagation();
    return false;
  }
  return true;
};

// Patch ResizeObserver to handle errors gracefully
const originalResizeObserver = window.ResizeObserver;

class SafeResizeObserver extends originalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
      try {
        // Use requestAnimationFrame to prevent sync layout thrashing
        requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            // Silently handle ResizeObserver errors
            console.debug("ResizeObserver callback error (handled):", error);
          }
        });
      } catch (error) {
        console.debug("ResizeObserver error (handled):", error);
      }
    };

    super(wrappedCallback);
  }
}

// Apply the patches
export const initResizeObserverPolyfill = () => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  // Add global error handler
  window.addEventListener("error", resizeObserverErrorHandler);

  // Replace ResizeObserver with our safe version
  window.ResizeObserver = SafeResizeObserver;

  // Handle unhandled promise rejections that might be related
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.includes("ResizeObserver")) {
      event.preventDefault();
    }
  });
};

// Clean up function
export const cleanupResizeObserverPolyfill = () => {
  if (typeof window === "undefined") return;

  window.removeEventListener("error", resizeObserverErrorHandler);
  window.ResizeObserver = originalResizeObserver;
};
