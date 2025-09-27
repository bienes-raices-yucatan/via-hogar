'use client';
import React, { useRef, useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { AmenitiesSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { saveImage, getImage } from '@/lib/db';

type IconName = keyof typeof LucideIcons;

interface AmenitiesSectionProps {
    data: AmenitiesSectionData;
    updateSection: (sectionId: string, updatedData: Partial<AmenitiesSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const loadImageUrls = async () => {
            const urls: {[key: string]: string} = {};
            for (const amenity of data.amenities) {
                if (amenity.imageKey) {
                    const blob = await getImage(amenity.imageKey);
                    if (blob) {
                        urls[amenity.id] = URL.createObjectURL(blob);
                    }
                } else if (amenity.imageUrl) {
                    urls[amenity.id] = amenity.imageUrl;
                }
            }
            setImageUrls(urls);
        };
        loadImageUrls();
        
        return () => {
            Object.values(imageUrls).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            });
        }
    }, [data.amenities]);


    const handleAmenityTextChange = (amenityId: string, newText: string) => {
        const updatedAmenities = data.amenities.map(a => a.id === amenityId ? { ...a, text: newText } : a);
        updateSection(data.id, { amenities: updatedAmenities });
    };

    const handleAddAmenity = () => {
        const newAmenity = { id: uuidv4(), icon: 'PlusCircle' as IconName, text: 'Nueva Comodidad' };
        updateSection(data.id, { amenities: [...data.amenities, newAmenity] });
    };

    const handleDeleteAmenity = (amenityId: string) => {
        const updatedAmenities = data.amenities.filter(a => a.id !== amenityId);
        updateSection(data.id, { amenities: updatedAmenities });
    };

    const handleImageButtonClick = (amenityId: string) => {
        fileInputRefs.current[amenityId]?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, amenityId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const key = `amenity-${amenityId}-${uuidv4()}`;
            await saveImage(key, file);
            
            const localUrl = URL.createObjectURL(file);
            setImageUrls(prev => {
                const newUrls = {...prev};
                if (prev[amenityId] && prev[amenityId].startsWith('blob:')) {
                    URL.revokeObjectURL(prev[amenityId]);
                }
                newUrls[amenityId] = localUrl;
                return newUrls;
            });
            
            const updatedAmenities = data.amenities.map(a => 
                a.id === amenityId ? { ...a, imageKey: key, imageUrl: undefined } : a
            );
            updateSection(data.id, { amenities: updatedAmenities });
        }
    };
    
    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                {data.title && 
                    <EditableText 
                        value={data.title} 
                        onChange={(val) => updateSection(data.id, {title: val})} 
                        isAdminMode={isAdminMode} 
                        as="h2" 
                        className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800"
                    />
                }
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {data.amenities.map(amenity => {
                        const Icon = amenity.icon ? LucideIcons[amenity.icon as IconName] as React.ElementType : null;
                        const amenityImageUrl = imageUrls[amenity.id];
                        return (
                            <div key={amenity.id} className="text-center p-4 rounded-lg transition-colors group/amenity relative">
                                {amenityImageUrl ? (
                                    <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                                        <Image src={amenityImageUrl} alt={amenity.text} layout="fill" objectFit="cover" />
                                    </div>
                                ) : (
                                    Icon && <Icon className="mx-auto h-10 w-10 text-primary mb-3" />
                                )}
                                <EditableText value={amenity.text} onChange={newText => handleAmenityTextChange(amenity.id, newText)} isAdminMode={isAdminMode} className="text-slate-700" />
                                {isAdminMode && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={el => (fileInputRefs.current[amenity.id] = el)}
                                            onChange={e => handleFileChange(e, amenity.id)}
                                        />
                                        <div className="absolute -top-2 -right-2 opacity-0 group-hover/amenity:opacity-100 flex flex-col gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-600 hover:bg-slate-200" onClick={() => handleImageButtonClick(amenity.id)} title="Cambiar imagen">
                                                <ImageIcon size={16} />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAmenity(amenity.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                    {isAdminMode && (
                         <div className="text-center p-4 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                            <Button variant="ghost" className="w-full h-full text-slate-500" onClick={handleAddAmenity}>
                                <PlusCircle className="mr-2"/>Añadir
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

export default AmenitiesSection;
