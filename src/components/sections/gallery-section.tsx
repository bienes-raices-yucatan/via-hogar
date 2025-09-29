'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GallerySectionData, Property } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useStorage } from '@/firebase/storage';
import { uploadFile } from '@/lib/storage';
import { Label } from '../ui/label';

interface GallerySectionProps {
    data: GallerySectionData;
    property: Property;
    updateProperty: (updatedProperty: Property) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, property, updateProperty, deleteSection, isAdminMode }) => {
    const [api, setApi] = useState<CarouselApi>()
    const storage = useStorage();
    const addImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!api) { return }
        api.on("select", () => { /* Do something on select. */ })
    }, [api])

    const handleUpdate = (updates: Partial<GallerySectionData>) => {
        const updatedSections = property.sections.map(s => s.id === data.id ? {...s, ...updates} : s);
        updateProperty({ ...property, sections: updatedSections });
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageIdToUpdate?: string) => {
        const file = e.target.files?.[0];
        if (file && storage) {
            const newImageId = imageIdToUpdate || uuidv4();
            const filePath = `sections/${data.id}/gallery/${newImageId}/${file.name}`;
            const newUrl = await uploadFile(storage, file, filePath);

            if (imageIdToUpdate) {
                // Update existing image
                const updatedImages = data.images.map(img => img.id === imageIdToUpdate ? { ...img, url: newUrl } : img);
                handleUpdate({ images: updatedImages });
            } else {
                // Add new image
                const newImage = { id: newImageId, url: newUrl, title: 'Nueva Imagen' };
                const updatedImages = [...data.images, newImage];
                handleUpdate({ images: updatedImages });
            }
        }
    };

    const handleDeleteImage = (imageId: string) => {
        const updatedImages = data.images.filter(img => img.id !== imageId);
        handleUpdate({ images: updatedImages });
    };

    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    return (
        <div style={{backgroundColor: data.style.backgroundColor}} className="relative group/section overflow-hidden">
             {isAdminMode && (
                <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity z-20 flex gap-2">
                    <Label htmlFor={`add-image-${data.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 cursor-pointer">
                        <PlusCircle size={20} />
                    </Label>
                    <input id={`add-image-${data.id}`} type="file" ref={addImageInputRef} onChange={(e) => handleFileChange(e)} className="hidden" accept="image/*" />

                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
            <div className="container mx-auto px-0">
                <Carousel
                    setApi={setApi}
                    plugins={[plugin.current]}
                    opts={{ align: "start", loop: data.images.length > 1 }}
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    className="w-full"
                >
                    <CarouselContent>
                        {data.images.map((image) => {
                            const uploadId = `gallery-image-upload-${image.id}`;
                            return (
                            <CarouselItem key={image.id} className="basis-full">
                                <div className="relative group/image h-[70vh]">
                                    <div className="relative w-full h-full">
                                        {image.url && <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                                    </div>
                                    
                                    {isAdminMode && (
                                        <>
                                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30 p-2 rounded-md">
                                                <Label htmlFor={uploadId} className="cursor-pointer">
                                                    <div className="p-2 text-white hover:bg-white/20 rounded-full" title="Cambiar imagen">
                                                        <ImageIcon size={18}/>
                                                    </div>
                                                </Label>
                                                <input id={uploadId} type="file" onChange={(e) => handleFileChange(e, image.id)} className="hidden" accept="image/*"/>

                                                <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50 h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id);}}><Trash2 size={18}/></Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CarouselItem>
                        )})}
                    </CarouselContent>
                </Carousel>
            </div>
            {data.title && (
                <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
                     <EditableText
                        value={data.title}
                        onChange={(val) => handleUpdate({ title: val })}
                        isAdminMode={isAdminMode}
                        as="h2"
                        className="text-3xl md:text-4xl font-headline font-bold text-center text-white"
                    />
                </div>
            )}
        </div>
    );
};

export default GallerySection;
