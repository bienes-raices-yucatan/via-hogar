
"use client";

import React, { useRef } from 'react';
import { PricingSectionData, SelectedElement, PricingTier } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { EditableText } from '@/components/editable-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { saveImage } from '@/lib/storage';

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
  const { tier } = data;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTierUpdate = (updatedTier: Partial<PricingTier>) => {
    onUpdate({ ...data, tier: { ...data.tier, ...updatedTier } });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const savedKey = await saveImage(dataUrl);
          onUpdate({ ...data, backgroundImageUrl: savedKey });
      };
      reader.readAsDataURL(file);
  };


  return (
    <section 
        className="py-12 md:py-20 relative group bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${data.backgroundImageUrl})` }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'backgroundImageUrl' })}
    >
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      <div className="container mx-auto px-4 flex items-center justify-center">
        {isAdminMode && (
          <SectionToolbar
            sectionId={data.id}
            onDelete={onDelete}
            isSectionSelected={selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'style' || selectedElement.elementKey === 'backgroundImageUrl')}
          />
        )}
         {isAdminMode && (
          <Button
            variant="secondary"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100"
            onClick={() => fileInputRef.current?.click()}
          >
              <Icon name="camera" className="mr-2" />
              Cambiar Fondo
          </Button>
        )}
        
        <Card className="max-w-md w-full bg-background/90 backdrop-blur-sm shadow-2xl rounded-2xl">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <Icon name="logo" className="w-12 h-12 text-primary mb-4" />
            
            <EditableText
              as="h2"
              id={`${data.id}-tier-title`}
              isAdminMode={isAdminMode}
              onUpdate={(val) => handleTierUpdate({ title: val.text })}
              className="text-xl font-bold text-foreground mb-4"
              value={{ text: tier.title, color: '', fontFamily: 'Montserrat', fontSize: 1.25 }}
              onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'tiers', subElementId: tier.id })}
              isSelected={selectedElement?.subElementId === tier.id && selectedElement.elementKey === 'tiers'}
            />

            {tier.oldPrice && (
              <div className="relative">
                <EditableText
                  as="p"
                  id={`${data.id}-tier-oldprice`}
                  isAdminMode={isAdminMode}
                  onUpdate={(val) => handleTierUpdate({ oldPrice: val.text })}
                  className="text-2xl text-red-500"
                  value={{ text: tier.oldPrice, color: '', fontFamily: 'Montserrat', fontSize: 1.5 }}
                  onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'tiers', subElementId: tier.id })}
                  isSelected={selectedElement?.subElementId === tier.id && selectedElement.elementKey === 'tiers'}
                />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-6"></div>
              </div>
            )}
            
            <div className="flex items-baseline mb-4">
              <EditableText
                as="p"
                id={`${data.id}-tier-price`}
                isAdminMode={isAdminMode}
                onUpdate={(val) => handleTierUpdate({ price: val.text })}
                className="text-4xl font-bold text-foreground"
                value={{ text: tier.price, color: '', fontFamily: 'Montserrat', fontSize: 2.25 }}
                onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'tiers', subElementId: tier.id })}
                isSelected={selectedElement?.subElementId === tier.id && selectedElement.elementKey === 'tiers'}
              />
               <EditableText
                as="span"
                id={`${data.id}-tier-currency`}
                isAdminMode={isAdminMode}
                onUpdate={(val) => handleTierUpdate({ currency: val.text })}
                className="ml-2 text-3xl font-semibold text-foreground"
                value={{ text: tier.currency, color: '', fontFamily: 'Montserrat', fontSize: 1.875 }}
                onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'tiers', subElementId: tier.id })}
                isSelected={selectedElement?.subElementId === tier.id && selectedElement.elementKey === 'tiers'}
              />
            </div>

            <EditableText
              as="p"
              id={`${data.id}-tier-description`}
              isAdminMode={isAdminMode}
              onUpdate={(val) => handleTierUpdate({ description: val.text })}
              className="text-muted-foreground mb-6"
              value={{ text: tier.description, color: '', fontFamily: 'Roboto', fontSize: 1 }}
              onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'tiers', subElementId: tier.id })}
              isSelected={selectedElement?.subElementId === tier.id && selectedElement.elementKey === 'tiers'}
            />

            <Button size="lg" className="w-full bg-gray-800 text-white hover:bg-gray-700">
                {tier.buttonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
