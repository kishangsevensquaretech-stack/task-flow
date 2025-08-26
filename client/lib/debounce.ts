// Debounce utility to prevent rapid function calls that could trigger ResizeObserver issues

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean,
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  }) as T;
}

// Throttle utility for limiting function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T {
  let inThrottle: boolean = false;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

// RAF (RequestAnimationFrame) based throttle for smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(func: T): T {
  let rafId: number | null = null;

  return ((...args: Parameters<T>) => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  }) as T;
}
