
"use client";

import React, { useRef, useCallback } from 'react';
import Image from 'next/image';
import { GallerySectionData, SelectedElement, GalleryImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { SectionToolbar } from '../section-toolbar';
import { EditableText } from '../editable-text';
import { deleteImage, saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';


const GalleryCarouselItem: React.FC<{ image: GalleryImage; isAdminMode: boolean; onDelete: (id: string) => void; }> = ({ image, isAdminMode, onDelete }) => {
    const { imageUrl, isLoading } = useImageLoader(image.url);

    return (
        <CarouselItem className="md:basis-1/2 lg:basis-1/2">
            <div className="p-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg group/image">
                {isLoading ? <Skeleton className="w-full h-full" /> : 
                 imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={image.title}
                        fill
                        className="object-cover"
                    />
                 ) : <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Error</div>}
                
                {isAdminMode && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(image.id)}
                    >
                        <Icon name="trash" />
                    </Button>
                </div>
                )}
            </div>
            </div>
        </CarouselItem>
    );
}

interface GallerySectionProps {
  data: GallerySectionData;
  onUpdate: (data: GallerySectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImagesPromises = Array.from(files).map(file => {
      return new Promise<GalleryImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            const savedKey = await saveImage(dataUrl);
            resolve({
              id: `img-${Date.now()}-${Math.random()}`,
              url: savedKey,
              title: file.name,
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(newImagesPromises);
    onUpdate({ ...data, images: [...data.images, ...newImages] });
  }, [data, onUpdate]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    const imageToDelete = data.images.find(img => img.id === imageId);
    if (imageToDelete) {
        await deleteImage(imageToDelete.url);
    }
    const newImages = data.images.filter(img => img.id !== imageId);
    onUpdate({ ...data, images: newImages });
  }, [data, onUpdate]);

  return (
    <section 
        className="py-12 md:py-20 relative group"
        style={{ backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <div className="w-full">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style'}
          />
        )}
        <div className={cn("text-center", data.images.length > 0 && "mb-10")}>
          {isAdminMode && (
            <div className="ml-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Icon name="plus" className="mr-2" />
                Añadir Imágenes
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>

        {data.images.length > 0 ? (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1">
              {data.images.map((image) => (
                <GalleryCarouselItem
                    key={image.id}
                    image={image}
                    isAdminMode={isAdminMode}
                    onDelete={handleDeleteImage}
                />
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
        ) : (
          <div 
            onClick={() => isAdminMode && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 hover:bg-accent hover:border-primary transition-colors cursor-pointer container mx-auto"
          >
             <Icon name="area" className="w-12 h-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-semibold text-foreground">Galería Vacía</h3>
             <p className="text-muted-foreground mt-2">
                {isAdminMode ? "Haz clic aquí o en el botón 'Añadir Imágenes' para empezar." : "Pronto se añadirán imágenes a esta galería."}
             </p>
          </div>
        )}
      </div>
    </section>
  );
};
