'use client';
import React from 'react';
import { PricingSectionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import EditableText from '../editable-text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
    data: PricingSectionData;
    updateSection: (sectionId: string, updatedData: Partial<PricingSectionData>) => void;
    deleteSection: (sectionId: string) => void;
    isAdminMode: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({ data, updateSection, deleteSection, isAdminMode }) => {
    
    const handleTierUpdate = (tierId: string, field: keyof PricingSectionData['tiers'][0], value: any) => {
        const updatedTiers = data.tiers.map(t => t.id === tierId ? { ...t, [field]: value } : t);
        updateSection(data.id, { tiers: updatedTiers });
    };

    const handleFeatureUpdate = (tierId: string, featureIndex: number, value: string) => {
        const updatedTiers = data.tiers.map(t => {
            if (t.id === tierId) {
                const updatedFeatures = [...t.features];
                updatedFeatures[featureIndex] = value;
                return { ...t, features: updatedFeatures };
            }
            return t;
        });
        updateSection(data.id, { tiers: updatedTiers });
    };
    
    const handleAddFeature = (tierId: string) => {
        const updatedTiers = data.tiers.map(t => {
            if (t.id === tierId) {
                return { ...t, features: [...t.features, 'Nueva Característica'] };
            }
            return t;
        });
        updateSection(data.id, { tiers: updatedTiers });
    };

    const handleDeleteFeature = (tierId: string, featureIndex: number) => {
        const updatedTiers = data.tiers.map(t => {
            if (t.id === tierId) {
                const updatedFeatures = t.features.filter((_, i) => i !== featureIndex);
                return { ...t, features: updatedFeatures };
            }
            return t;
        });
        updateSection(data.id, { tiers: updatedTiers });
    };
    
    const handleAddTier = () => {
        const newTier = {
            id: uuidv4(),
            name: 'Nuevo Plan',
            price: '$0',
            frequency: '/mes',
            features: ['Característica 1'],
            buttonText: 'Empezar',
            isFeatured: false,
        };
        updateSection(data.id, { tiers: [...data.tiers, newTier] });
    };

    const handleDeleteTier = (tierId: string) => {
        const updatedTiers = data.tiers.filter(t => t.id !== tierId);
        updateSection(data.id, { tiers: updatedTiers });
    };

    return (
        <div className="py-16 md:py-24 relative group/section" style={{backgroundColor: data.style.backgroundColor}}>
            <div className="container mx-auto px-4">
                {data.title &&
                    <EditableText
                        value={data.title}
                        onChange={(val) => updateSection(data.id, { title: val })}
                        isAdminMode={isAdminMode}
                        as="h2"
                        className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-slate-800"
                    />
                }
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {data.tiers.map(tier => (
                        <Card key={tier.id} className={cn("relative group/tier", tier.isFeatured ? "border-primary border-2 shadow-lg" : "shadow-md")}>
                           {isAdminMode && (
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover/tier:opacity-100 bg-white p-1 rounded-md">
                                    <Label htmlFor={`featured-${tier.id}`} className="text-xs">Destacado</Label>
                                    <Switch id={`featured-${tier.id}`} checked={tier.isFeatured} onCheckedChange={(val) => handleTierUpdate(tier.id, 'isFeatured', val)} />
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDeleteTier(tier.id)}><Trash2 size={16} /></Button>
                                </div>
                           )}
                            <CardHeader className="text-center">
                                <CardTitle>
                                    <EditableText value={tier.name} onChange={(val) => handleTierUpdate(tier.id, 'name', val)} isAdminMode={isAdminMode} className="text-xl font-bold font-headline" />
                                </CardTitle>
                                <div className="flex items-baseline justify-center">
                                    <EditableText value={tier.price} onChange={(val) => handleTierUpdate(tier.id, 'price', val)} isAdminMode={isAdminMode} className="text-4xl font-bold" as="span" />
                                    <EditableText value={tier.frequency} onChange={(val) => handleTierUpdate(tier.id, 'frequency', val)} isAdminMode={isAdminMode} className="text-slate-500" as="span" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col h-full">
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 group/feature relative">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                            <EditableText value={feature} onChange={(val) => handleFeatureUpdate(tier.id, index, val)} isAdminMode={isAdminMode} className="text-slate-600" />
                                            {isAdminMode &&
                                                <Button size="icon" variant="ghost" className="h-5 w-5 absolute -right-1 top-0 text-destructive opacity-0 group-hover/feature:opacity-100" onClick={() => handleDeleteFeature(tier.id, index)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            }
                                        </li>
                                    ))}
                                </ul>
                                {isAdminMode &&
                                    <Button size="sm" variant="ghost" className="text-slate-500 mb-6" onClick={() => handleAddFeature(tier.id)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir característica
                                    </Button>
                                }
                                <Button className={cn("w-full mt-auto", tier.isFeatured ? "bg-primary" : "bg-slate-800")}>
                                    <EditableText value={tier.buttonText} onChange={(val) => handleTierUpdate(tier.id, 'buttonText', val)} isAdminMode={isAdminMode} />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                     {isAdminMode && (
                        <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg">
                            <Button variant="ghost" className="text-slate-500" onClick={handleAddTier}>
                                <PlusCircle className="mr-2" /> Añadir Plan
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

export default PricingSection;
