'use client';
import React from 'react';
import { LocationSectionData } from '@/lib/types';
import Map from '../map';
import { Button } from '../ui/button';
import { Trash2, BrainCircuit } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import EditableText from '../editable-text';

type IconName = keyof typeof LucideIcons;

interface LocationSectionProps {
    data: LocationSectionData;
    updateSection: (sectionId: string, updatedData: Partial<LocationSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const LocationSection: React.FC<LocationSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {

    const handlePlaceUpdate = (placeId: string, field: 'name' | 'type' | 'distance', value: string) => {
        const updatedPlaces = data.nearbyPlaces.map(p => p.id === placeId ? { ...p, [field]: value } : p);
        updateSection(data.id, { nearbyPlaces: updatedPlaces });
    }

    return (
        <div className="py-12 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline font-bold text-center mb-8">Ubicación y Alrededores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="rounded-lg overflow-hidden shadow-lg h-96">
                        <Map lat={data.coordinates.lat} lng={data.coordinates.lng} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Puntos de Interés Cercanos</h3>
                        {isAdminMode && <Button size="sm" className="mb-4"><BrainCircuit className="mr-2 h-4 w-4" /> Generar con IA</Button>}
                        <ul className="space-y-4">
                            {data.nearbyPlaces.map(place => {
                                const Icon = LucideIcons[place.icon as IconName] as React.ElementType;
                                return (
                                <li key={place.id} className="flex items-center gap-4 p-2 hover:bg-slate-100 rounded-md">
                                    {Icon && <Icon className="h-6 w-6 text-primary flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <EditableText value={place.name} onChange={val => handlePlaceUpdate(place.id, 'name', val)} isAdminMode={isAdminMode} className="font-semibold text-slate-800" />
                                        <EditableText value={place.type} onChange={val => handlePlaceUpdate(place.id, 'type', val)} isAdminMode={isAdminMode} className="text-sm text-slate-500" />
                                    </div>
                                    <EditableText value={place.distance} onChange={val => handlePlaceUpdate(place.id, 'distance', val)} isAdminMode={isAdminMode} className="text-sm font-medium text-slate-600" />
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>
            </div>
            {isAdminMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                        <Trash2 />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LocationSection;
