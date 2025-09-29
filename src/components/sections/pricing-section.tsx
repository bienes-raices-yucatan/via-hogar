
"use client";

import React from 'react';
import { PricingSectionData, SelectedElement, PricingTier } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { EditableText } from '@/components/editable-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  data: PricingSectionData;
  onUpdate: (data: PricingSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
}) => {
  const handleTitleUpdate = (newTitle: any) => {
    if (data.title) {
        onUpdate({ ...data, title: { ...data.title, ...newTitle } });
    }
  };

  const handleAddTier = () => {
    const newTier: PricingTier = {
        id: `tier-${Date.now()}`,
        name: 'Nuevo Plan',
        price: '0',
        frequency: '/mes',
        features: [{id:'f1', text:'Característica'}],
        buttonText: 'Elegir',
        isFeatured: false,
    };
    onUpdate({ ...data, tiers: [...data.tiers, newTier] });
  };

  const handleDeleteTier = (id: string) => {
    const newTiers = data.tiers.filter(t => t.id !== id);
    onUpdate({ ...data, tiers: newTiers });
  };

  return (
    <section 
        className="py-12 md:py-20 relative group"
        style={{ backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
      <div className="container mx-auto px-4">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'style'}
          />
        )}
        <div className="text-center mb-12">
            {data.title && (
                <EditableText
                    id={`${data.id}-title`}
                    as="h2"
                    isAdminMode={isAdminMode}
                    onUpdate={handleTitleUpdate}
                    className="text-3xl md:text-4xl font-bold text-foreground"
                    value={data.title}
                    onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
                    isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
                />
            )}
        </div>
        
        <div className={cn(
            "grid gap-8",
            // Adjust grid columns based on number of tiers for better layout
            data.tiers.length === 1 && "grid-cols-1 max-w-sm mx-auto",
            data.tiers.length === 2 && "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto",
            data.tiers.length >= 3 && "grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto",
        )}>
          {data.tiers.map((tier) => (
            <Card key={tier.id} className={cn("flex flex-col relative group/tier", tier.isFeatured && "border-primary border-2 shadow-xl")}>
              <CardHeader className="items-center text-center">
                <CardTitle>{tier.name}</CardTitle>
                <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground ml-1">{tier.frequency}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                    {tier.features.map((feature) => (
                        <li key={feature.id} className="flex items-center gap-3">
                            <Icon name="check" className="w-5 h-5 text-primary"/>
                            <span className="text-muted-foreground">{feature.text}</span>
                        </li>
                    ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.isFeatured ? 'default' : 'outline'}>
                  {tier.buttonText}
                </Button>
              </CardFooter>
              {isAdminMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/tier:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => handleDeleteTier(tier.id)}>
                        <Icon name="x-mark" className="h-4 w-4"/>
                    </Button>
                </div>
              )}
            </Card>
          ))}
           {isAdminMode && (
                <button
                    onClick={handleAddTier}
                    className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-8 hover:bg-accent hover:border-primary transition-colors min-h-[300px]"
                >
                    <Icon name="plus" className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="font-semibold text-muted-foreground">Añadir Plan</span>
                </button>
            )}
        </div>
      </div>
    </section>
  );
};
