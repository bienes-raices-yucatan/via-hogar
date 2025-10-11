
"use client";

import React, { useRef, useCallback } from 'react';
import Image from 'next/image';
import { GallerySectionData, SelectedElement, GalleryImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { SectionToolbar } from '../section-toolbar';
import { deleteImage, saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';


const GalleryCarouselItem: React.FC<{ 
    image: GalleryImage; 
    isAdminMode: boolean; 
    onDelete: (id: string) => void; 
    onMoveLeft: () => void;
    onMoveRight: () => void;
    isFirst: boolean;
    isLast: boolean;
}> = ({ image, isAdminMode, onDelete, onMoveLeft, onMoveRight, isFirst, isLast }) => {
    const { imageUrl, isLoading } = useImageLoader(image.url);

    return (
        <CarouselItem className="basis-full md:basis-1/2">
            <div className="p-1">
            <div className="relative aspect-video overflow-hidden rounded-lg group/image">
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
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onMoveLeft}
                        disabled={isFirst}
                    >
                        <Icon name="chevron-left" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(image.id)}
                    >
                        <Icon name="trash" />
                    </Button>
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onMoveRight}
                        disabled={isLast}
                    >
                        <Icon name="chevron-right" />
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
  const autoplay = useRef(
      Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImagesPromises = Array.from(files).map(async (file) => {
        const savedKey = await saveImage(file);
        return {
            id: `img-${Date.now()}-${Math.random()}`,
            url: savedKey,
            title: file.name,
        };
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

  const moveImage = (fromIndex: number, toIndex: number) => {
      const newImages = [...data.images];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      onUpdate({ ...data, images: newImages });
  };
  
  const handleMoveImageLeft = (index: number) => {
    if (index > 0) {
      moveImage(index, index - 1);
    }
  };

  const handleMoveImageRight = (index: number) => {
    if (index < data.images.length - 1) {
      moveImage(index, index + 1);
    }
  };

  const isSelected = selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style';

  return (
    <section 
        className="relative group py-12"
        style={{ backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <div className="container mx-auto px-4">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={isSelected}
          />
        )}
        <div className="mb-8 flex justify-between items-center">
             <div className="max-w-xl">
                 <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Galería</h2>
                 <p className="mt-4 text-lg text-muted-foreground">Explora cada rincón de la propiedad a través de nuestra galería de imágenes.</p>
            </div>
          {isAdminMode && (
            <div className="flex-shrink-0">
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
            plugins={[autoplay.current]}
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
            onMouseEnter={() => autoplay.current.stop()}
            onMouseLeave={() => autoplay.current.reset()}
          >
            <CarouselContent className="-ml-1">
              {data.images.map((image, index) => (
                <GalleryCarouselItem
                    key={image.id}
                    image={image}
                    isAdminMode={isAdminMode}
                    onDelete={handleDeleteImage}
                    onMoveLeft={() => handleMoveImageLeft(index)}
                    onMoveRight={() => handleMoveImageRight(index)}
                    isFirst={index === 0}
                    isLast={index === data.images.length - 1}
                />
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
        ) : (
          <div 
            onClick={() => isAdminMode && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 hover:bg-accent hover:border-primary transition-colors cursor-pointer"
          >
             <Icon name="camera" className="w-12 h-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-semibold text-foreground">Galería Vacía</h3>
             <p className="text-muted-foreground mt-2">
                {isAdminMode ? "Haz clic aquí o en el botón 'Añadir' para empezar a subir imágenes." : "Pronto se añadirán imágenes a esta galería."}
             </p>
          </div>
        )}
      </div>
    </section>
  );
};
