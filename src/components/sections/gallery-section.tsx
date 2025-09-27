'use client';
import React from 'react';
import { GallerySectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, Sparkles, Pencil } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from 'next/image';
import EditableText from '../editable-text';

interface GallerySectionProps {
    data: GallerySectionData;
    updateSection: (sectionId: string, updatedData: Partial<GallerySectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {

    const handleImageTitleChange = (imageId: string, newTitle: string) => {
        const updatedImages = data.images.map(img => img.id === imageId ? { ...img, title: newTitle } : img);
        updateSection(data.id, { images: updatedImages });
    };
    
    if (isAdminMode) {
        return (
            <div className="p-4 rounded-lg border-2 border-dashed relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
                <h3 className="text-xl font-bold mb-4">Galería (Admin)</h3>
                <div className="flex overflow-x-auto gap-4 p-2">
                    {data.images.map(image => (
                        <div key={image.id} className="flex-shrink-0 w-64 group relative">
                             <Image src={image.url} alt={image.title} width={256} height={192} className="w-full h-48 object-cover rounded-md" />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20"><Sparkles/></Button>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20"><Pencil/></Button>
                                <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50"><Trash2/></Button>
                             </div>
                             <div className="p-1 bg-background rounded-b-md">
                                <EditableText value={image.title} onChange={newTitle => handleImageTitleChange(image.id, newTitle)} isAdminMode={isAdminMode} className="w-full text-sm text-center" />
                             </div>
                        </div>
                    ))}
                     <div className="flex-shrink-0 w-64 h-48 flex items-center justify-center">
                        <Button variant="outline" className="h-full w-full border-dashed"><PlusCircle className="mr-2"/>Añadir Imagen</Button>
                    </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div style={{backgroundColor: data.style.backgroundColor}} className="py-12">
            <Carousel className="w-full max-w-4xl mx-auto" opts={{loop: true}}>
                <CarouselContent>
                    {data.images.map(image => (
                        <CarouselItem key={image.id}>
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                                        <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" className="rounded-lg"/>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-center">
                                            <p className="font-bold text-lg">{image.title}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
};
import { Card, CardContent } from "@/components/ui/card"


export default GallerySection;
