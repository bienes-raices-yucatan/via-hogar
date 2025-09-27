'use client';
import React from 'react';
import { GallerySectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, Pencil } from 'lucide-react';
import Image from 'next/image';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';

interface GallerySectionProps {
    data: GallerySectionData;
    updateSection: (sectionId: string, updatedData: Partial<GallerySectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {

    const handleAddImage = () => {
        const newImage = { id: uuidv4(), url: 'https://picsum.photos/seed/new-gallery/800/600', title: 'Nueva Imagen' };
        updateSection(data.id, { images: [...data.images, newImage] });
    };
    
    const handleDeleteImage = (imageId: string) => {
        const updatedImages = data.images.filter(img => img.id !== imageId);
        updateSection(data.id, { images: updatedImages });
    };

    return (
        <div style={{backgroundColor: data.style.backgroundColor}} className="py-16 md:py-24 relative group/section">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800">{data.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {data.images.map((image, idx) => (
                        <div key={image.id} className={`relative rounded-lg overflow-hidden shadow-lg group/image aspect-w-4 aspect-h-3 ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                             <Image src={image.url} alt={image.title} layout="fill" objectFit="cover" className="transform group-hover/image:scale-105 transition-transform duration-300" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                             <div className="absolute bottom-0 left-0 p-4">
                                <EditableText value={image.title} onChange={() => {}} isAdminMode={isAdminMode} className="text-white font-bold text-lg" />
                             </div>
                             {isAdminMode && (
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8"><Pencil size={16}/></Button>
                                    <Button size="icon" variant="destructive" className="bg-transparent hover:bg-red-500/50 h-8 w-8" onClick={() => handleDeleteImage(image.id)}><Trash2 size={16}/></Button>
                                 </div>
                             )}
                        </div>
                    ))}
                    {isAdminMode && (
                         <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg min-h-[200px]">
                            <Button variant="ghost" className="text-slate-500" onClick={handleAddImage}>
                                <PlusCircle className="mr-2"/>Añadir Imagen
                            </Button>
                        </div>
                    )}
                </div>
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
