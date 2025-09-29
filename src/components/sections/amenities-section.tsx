
'use client';
import React, { useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { AmenitiesSectionData, Property } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Label } from '../ui/label';
import { useStorage, uploadFile } from '@/firebase/storage';

type IconName = keyof typeof LucideIcons;

interface AmenitiesSectionProps {
    property: Property;
    data: AmenitiesSectionData;
    updateProperty: (updatedProperty: Property) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ property, data, updateProperty, deleteSection, isAdminMode }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const storage = useStorage();

    const updateSection = (updatedData: Partial<AmenitiesSectionData>) => {
        const updatedSections = property.sections.map(s => s.id === data.id ? { ...s, ...updatedData } : s);
        updateProperty({ ...property, sections: updatedSections });
    };

    const handleAmenityTextChange = (amenityId: string, newText: string) => {
        const updatedAmenities = data.amenities.map(a => a.id === amenityId ? { ...a, text: newText } : a);
        updateSection({ amenities: updatedAmenities });
    };

    const handleAddAmenity = () => {
        const newAmenity = { id: uuidv4(), icon: 'PlusCircle' as IconName, text: 'Nueva Comodidad' };
        updateSection({ amenities: [...data.amenities, newAmenity] });
    };

    const handleDeleteAmenity = (amenityId: string) => {
        const updatedAmenities = data.amenities.filter(a => a.id !== amenityId);
        updateSection({ amenities: updatedAmenities });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, amenityId: string) => {
        const file = e.target.files?.[0];
        if (file && storage) {
            const filePath = `sections/${data.id}/amenities/${amenityId}/${file.name}`;
            const newUrl = await uploadFile(storage, file, filePath);
            const updatedAmenities = data.amenities.map(a => 
                a.id === amenityId ? { ...a, imageUrl: newUrl } : a
            );
            updateSection({ amenities: updatedAmenities });
        }
    };
    
    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                {data.title && 
                    <EditableText 
                        value={data.title} 
                        onChange={(val) => updateSection({title: val})} 
                        isAdminMode={isAdminMode} 
                        as="h2" 
                        className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800"
                    />
                }
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {data.amenities.map(amenity => {
                        const Icon = amenity.icon ? LucideIcons[amenity.icon as IconName] as React.ElementType : null;
                        const uploadId = `amenity-upload-${amenity.id}`;
                        return (
                            <div key={amenity.id} className="text-center p-4 rounded-lg transition-colors group/amenity relative">
                                <div className="relative w-16 h-16 mx-auto mb-3">
                                    <Label htmlFor={uploadId} className={isAdminMode ? 'cursor-pointer' : ''}>
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden group/image" title={isAdminMode ? "Cambiar imagen" : ""}>
                                            {amenity.imageUrl ? (
                                                <Image src={amenity.imageUrl} alt={amenity.text} layout="fill" objectFit="cover" />
                                            ) : (
                                                Icon && <div className="w-full h-full flex items-center justify-center bg-slate-100"><Icon className="h-10 w-10 text-primary" /></div>
                                            )}
                                            {isAdminMode && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity"></div>}
                                        </div>
                                    </Label>
                                    {isAdminMode && <input type="file" id={uploadId} accept="image/*" className="hidden" ref={el => (fileInputRefs.current[amenity.id] = el)} onChange={e => handleFileChange(e, amenity.id)} />}
                                </div>
                                
                                <EditableText value={amenity.text} onChange={newText => handleAmenityTextChange(amenity.id, newText)} isAdminMode={isAdminMode} className="text-slate-700" />
                                
                                {isAdminMode && (
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover/amenity:opacity-100">
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => {e.stopPropagation(); handleDeleteAmenity(amenity.id)}}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
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
