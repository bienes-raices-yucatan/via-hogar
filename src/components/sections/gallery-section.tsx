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

interface GallerySectionProps {
    data: GallerySectionData;
    property: Property;
    updateProperty: (updatedProperty: Property) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, property, updateProperty, deleteSection, isAdminMode }) => {
    const [api, setApi] = useState<CarouselApi>()

    useEffect(() => {
        if (!api) {
            return
        }
        api.on("select", () => {
            // Do something on select.
        })
    }, [api])

    const handleUpdate = (updates: Partial<GallerySectionData>) => {
        const updatedSections = property.sections.map(s => s.id === data.id ? {...s, ...updates} : s);
        updateProperty({ ...property, sections: updatedSections });
    }

    const handleDeleteImage = (imageId: string) => {
        const updatedImages = data.images.filter(img => img.id !== imageId);
        handleUpdate({ images: updatedImages });
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
                        {data.images.map((image) => (
                            <CarouselItem key={image.id} className="basis-full">
                                <div className="relative group/image h-[70vh]">
                                    <div className="relative w-full h-full">
                                        {image.url && <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                                    </div>
                                    
                                    {isAdminMode && (
                                        <>
                                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30 p-2 rounded-md">
                                                <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50 h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id);}}><Trash2 size={18}/></Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
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
