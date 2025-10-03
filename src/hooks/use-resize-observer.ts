
"use client";

import { useState, useEffect, RefObject } from 'react';

// Define the type for the observed element's size
interface Size {
  width: number | undefined;
  height: number | undefined;
}

export function useResizeObserver(elementRef: RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // We need a ResizeObserver to be available, and an element to observe.
    if (typeof window === 'undefined' || !window.ResizeObserver || !elementRef.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      // We only have one entry to observe.
      if (!entries || entries.length === 0) {
        return;
      }
      
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    // Start observing the element.
    observer.observe(elementRef.current);

    // Cleanup function to disconnect the observer.
    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return size;
}
