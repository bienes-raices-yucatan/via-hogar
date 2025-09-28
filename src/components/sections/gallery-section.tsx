'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GallerySectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Label } from '../ui/label';
import { uploadFile } from '@/firebase/storage';
import { useStorage } from '@/firebase';

interface GallerySectionProps {
    data: GallerySectionData;
    updateSection: (sectionId: string, updatedData: Partial<GallerySectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
    isDraggingMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const storage = useStorage();
    
    useEffect(() => {
        if (!api) {
            return
        }
        setCurrent(api.selectedScrollSnap())
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    const handleAddImage = () => {
        const newImage = { id: uuidv4(), url: 'https://picsum.photos/seed/new-gallery/800/600', title: 'Nueva Imagen' };
        updateSection(data.id, { images: [...data.images, newImage] });
    };
    
    const handleDeleteImage = (imageId: string) => {
        const updatedImages = data.images.filter(img => img.id !== imageId);
        updateSection(data.id, { images: updatedImages });
    };

    const handleImageTitleChange = (imageId: string, newTitle: string) => {
        const updatedImages = data.images.map(img => img.id === imageId ? { ...img, title: newTitle } : img);
        updateSection(data.id, { images: updatedImages });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const path = `galleries/${data.id}/${imageId}/${file.name}`;
            const url = await uploadFile(storage, file, path);
            const updatedImages = data.images.map(img => 
                img.id === imageId ? { ...img, url: url } : img
            );
            updateSection(data.id, { images: updatedImages });
        }
    };


    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );

    return (
        <div style={{backgroundColor: data.style.backgroundColor}} className="py-16 md:py-24 relative group/section overflow-hidden">
            <div className="container mx-auto px-4">
                <EditableText
                    value={data.title}
                    onChange={(val) => updateSection(data.id, { title: val })}
                    isAdminMode={isAdminMode}
                    as="h2"
                    className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800"
                />
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
                        {data.images.map((image, index) => {
                            const uploadId = `gallery-upload-${image.id}`;
                            return (
                                <CarouselItem key={image.id} className="basis-1/2 md:basis-1/4">
                                    <div className="p-1">
                                        <div className={`relative rounded-lg overflow-hidden shadow-lg group/image aspect-w-4 aspect-h-3 transition-transform duration-500 ease-in-out ${index === current ? 'scale-110' : 'scale-90 opacity-60'}`}>
                                            {image.url && <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" className="transform group-hover/image:scale-105 transition-transform duration-300" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                                            <div className="absolute bottom-0 left-0 p-4">
                                                <EditableText value={image.title} onChange={(newTitle) => handleImageTitleChange(image.id, newTitle)} isAdminMode={isAdminMode} className="text-white font-bold text-lg" />
                                            </div>
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
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30 p-1 rounded-md">
                                                        <Label htmlFor={uploadId} className="cursor-pointer">
                                                            <Button as="span" size="icon" variant="ghost" className="text-white hover:bg-white/20 h-7 w-7" title="Change image"><ImageIcon size={16}/></Button>
                                                        </Label>
                                                        <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50 h-7 w-7" onClick={() => handleDeleteImage(image.id)}><Trash2 size={16}/></Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                </Carousel>

                {isAdminMode && (
                    <div className="flex items-center justify-center mt-8">
                        <Button variant="outline" className="text-slate-500" onClick={handleAddImage}>
                            <PlusCircle className="mr-2"/>Añadir Imagen
                        </Button>
                    </div>
                )}
            </div>
            {isAdminMode && (
                <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default GallerySection;
