
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

  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };

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
      <div className="container mx-auto px-4">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style'}
          />
        )}
        <div className="flex justify-center items-center mb-10">
          {data.title && (
             <EditableText
                as="h2"
                id={`${data.id}-title`}
                value={data.title}
                onUpdate={handleTitleUpdate}
                className="text-3xl md:text-4xl font-bold text-center text-foreground"
                isAdminMode={isAdminMode}
                onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
                isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
            />
          )}
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
            <CarouselContent>
              {data.images.map((image) => (
                <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-lg group/image">
                      <Image
                        src={image.url}
                        alt={image.title}
                        fill
                        className="object-cover"
                      />
                      {isAdminMode && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteImage(image.id)}
                            >
                                <Icon name="trash" />
                            </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div 
            onClick={() => isAdminMode && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 hover:bg-accent hover:border-primary transition-colors cursor-pointer"
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
