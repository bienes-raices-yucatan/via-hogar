
'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { PricingSectionData, Property } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import EditableText from '../editable-text';
import { Card, CardContent } from '../ui/card';

type IconName = keyof typeof LucideIcons;

interface PricingSectionProps {
    property: Property;
    data: PricingSectionData;
    updateProperty: (updatedProperty: Property) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
    isDraggingMode: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({ property, data, updateProperty, deleteSection, isAdminMode }) => {
    
    const Icon = data.icon ? LucideIcons[data.icon as IconName] as React.ElementType : null;

    const updateSection = (updatedData: Partial<PricingSectionData>) => {
        const updatedSections = property.sections.map(s => s.id === data.id ? { ...s, ...updatedData } : s);
        updateProperty({ ...property, sections: updatedSections });
    };

    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4 flex justify-center">
                <Card className="w-full max-w-md shadow-2xl relative group/card bg-white/90 backdrop-blur-sm border rounded-2xl">
                    <CardContent className="p-8 text-center flex flex-col items-center">
                        {Icon && 
                           <div className="text-gray-800 mb-4">
                                <Icon size={48} strokeWidth={1.5}/>
                           </div>
                        }
                        
                        <div className="text-2xl font-bold text-gray-800 mb-4">
                           <EditableText value={data.title} onChange={(val) => updateSection({ title: val })} isAdminMode={isAdminMode} />
                        </div>
                        
                        {data.originalPrice &&
                            <div className="text-xl text-red-500 line-through mb-1">
                                <EditableText value={data.originalPrice} onChange={(val) => updateSection({ originalPrice: val })} isAdminMode={isAdminMode} />
                            </div>
                        }

                        <div className="text-4xl font-bold text-gray-900 mb-4">
                            <EditableText value={data.price} onChange={(val) => updateSection({ price: val })} isAdminMode={isAdminMode} />
                        </div>

                        <div className="text-gray-600 mb-6">
                            <EditableText value={data.subtitle} onChange={(val) => updateSection({ subtitle: val })} isAdminMode={isAdminMode} />
                        </div>

                        <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8">
                            <EditableText value={data.buttonText} onChange={(val) => updateSection({ buttonText: val })} isAdminMode={isAdminMode} />
                        </Button>
                    </CardContent>
                </Card>
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

export default PricingSection;
