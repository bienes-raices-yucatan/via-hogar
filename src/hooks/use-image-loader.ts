
"use client";

import { useState, useEffect } from 'react';
import { getImageBlob } from '@/lib/storage';

export const useImageLoader = (imageKey: string | null | undefined) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | null = null;

        const loadImage = async () => {
            if (!imageKey) {
                setIsLoading(false);
                setImageUrl(null);
                return;
            }

            // If it's already a URL, use it directly
            if (imageKey.startsWith('http') || imageKey.startsWith('data:') || imageKey.startsWith('blob:')) {
                 if (isMounted) {
                    setImageUrl(imageKey);
                    setIsLoading(false);
                }
                return;
            }
            
            // Otherwise, it's a key for IndexedDB
            setIsLoading(true);
            try {
                const blob = await getImageBlob(imageKey);
                if (blob && isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageUrl(objectUrl);
                } else if (isMounted) {
                    // Handle case where key exists but blob doesn't
                    setImageUrl(null); 
                }
            } catch (error) {
                console.error("Failed to load image from IndexedDB", error);
                if (isMounted) setImageUrl(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [imageKey]);

    return { imageUrl, isLoading };
};
