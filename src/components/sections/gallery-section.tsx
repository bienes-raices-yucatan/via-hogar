
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GallerySectionData, Property } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Label } from '../ui/label';
import { uploadFile } from '@/firebase/storage';
import { useFirebaseApp } from '@/firebase';
import { getStorage } from 'firebase/storage';

interface GallerySectionProps {
    data: GallerySectionData;
    property: Property;
    updateSection: (sectionId: string, updatedData: Partial<GallerySectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, property, updateSection, deleteSection, isAdminMode }) => {
    const [api, setApi] = useState<CarouselApi>()
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const app = useFirebaseApp();
    const storage = getStorage(app);

    useEffect(() => {
        if (!api) {
            return
        }
        api.on("select", () => {
            // Do something on select.
        })
    }, [api])

    const handleAddImage = () => {
        const newImage = { id: uuidv4(), url: 'https://picsum.photos/seed/new-gallery/1920/1080', title: 'Nueva Imagen' };
        updateSection(data.id, { images: [...data.images, newImage] });
    };
    
    const handleDeleteImage = (imageId: string) => {
        const updatedImages = data.images.filter(img => img.id !== imageId);
        updateSection(data.id, { images: updatedImages });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
        const file = e.target.files?.[0];
        if (file && storage) {
            const filePath = `sections/${data.id}/gallery/${imageId}/${file.name}`;
            const newUrl = await uploadFile(storage, file, filePath);
            const updatedImages = data.images.map(img => 
                img.id === imageId ? { ...img, url: newUrl } : img
            );
            updateSection(data.id, { images: updatedImages });
        }
    };

    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    return (
        <div style={{backgroundColor: data.style.backgroundColor}} className="relative group/section overflow-hidden">
            <div className="container mx-auto px-0">
                <Carousel
                    setApi={setApi}
                    plugins={[plugin.current]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    className="w-full"
                >
                    <CarouselContent>
                        {data.images.map((image) => {
                            const uploadId = `gallery-upload-${image.id}`;
                            return (
                                <CarouselItem key={image.id} className="basis-full">
                                    <div className="relative group/image h-[70vh]">
                                        <Label htmlFor={uploadId} className={isAdminMode ? 'cursor-pointer' : ''}>
                                            <div className="relative w-full h-full" title={isAdminMode ? "Cambiar imagen" : ""}>
                                                {image.url && <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                                                {isAdminMode && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white text-lg font-bold">Hacer clic para cambiar</div>}
                                            </div>
                                        </Label>
                                        
                                        {isAdminMode && (
                                            <>
                                                <input
                                                    type="file"
                                                    id={uploadId}
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={el => (fileInputRefs.current[image.id] = el)}
                                                    onChange={e => handleFileChange(e, image.id)}
                                                />
                                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30 p-2 rounded-md">
                                                    <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50 h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id);}}><Trash2 size={18}/></Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                </Carousel>

                {isAdminMode && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <Button variant="outline" className="text-slate-800 bg-white/80" onClick={handleAddImage}>
                            <PlusCircle className="mr-2"/>Añadir Imagen a la Galería
                        </Button>
                    </div>
                )}
            </div>
            {isAdminMode && !data.title && (
                <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
            
            {data.title && (
                <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
                     <EditableText
                        value={data.title}
                        onChange={(val) => updateSection(data.id, { title: val })}
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
