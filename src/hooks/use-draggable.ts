
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseDraggableOptions {
    initialPosition: { x: number; y: number };
    onStop: (position: { x: number; y: number }) => void;
    bounds: 'parent' | HTMLElement;
    enabled?: boolean;
}

export const useDraggable = ({ initialPosition, onStop, bounds, enabled = true }: UseDraggableOptions) => {
    const [position, setPosition] = useState(initialPosition);
    const elementRef = useRef<HTMLElement | null>(null);
    const isDraggingRef = useRef(false);

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!enabled) return;
        isDraggingRef.current = true;
        // Find the parent element to attach listeners to, which might be the window
        const parentNode = (e.currentTarget as HTMLElement)?.parentElement;
        if(parentNode) {
            elementRef.current = parentNode;
        }

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
    }, [enabled]);

    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current || !elementRef.current || !enabled) return;
        e.preventDefault();

        const parentRect = elementRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        let x = ((clientX - parentRect.left) / parentRect.width) * 100;
        let y = ((clientY - parentRect.top) / parentRect.height) * 100;
        
        // Clamp values between 0 and 100
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setPosition({ x, y });

    }, [enabled]);

    const handleEnd = useCallback(() => {
        if (!enabled) return;
        isDraggingRef.current = false;
        
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        
        // Use a function to get the latest position state
        setPosition(currentPosition => {
            onStop(currentPosition);
            return currentPosition;
        });

    }, [enabled, onStop]);
    
    // Reset position if initialPosition changes from outside
    useEffect(() => {
      setPosition(initialPosition);
    }, [initialPosition.x, initialPosition.y]);


    return { position, handleStart };
};
