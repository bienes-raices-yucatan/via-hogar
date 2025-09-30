
"use client";

import React, { useRef } from 'react';
import { PricingSectionData, SelectedElement, PricingTier, StyledText } from '@/lib/types';
import { SectionToolbar } from '@/components/section-toolbar';
import { EditableText } from '@/components/editable-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';

const PricingIconDisplay: React.FC<{ tier: PricingTier }> = ({ tier }) => {
    const { imageUrl, isLoading } = useImageLoader(tier.iconUrl);

    if (imageUrl) {
        return (
             <div className="relative w-12 h-12">
                <Image 
                    src={imageUrl} 
                    alt={tier.title.text} 
                    fill 
                    className="object-contain rounded-md"
                />
            </div>
        );
    }
    
    return <Icon name="logo" className="w-12 h-12 text-primary mb-4" />;
}


interface PricingSectionProps {
  data: PricingSectionData;
  onUpdate: (data: Partial<PricingSectionData>) => void;
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
  const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

  const handleTierUpdate = (property: keyof PricingTier, value: StyledText) => {
      onUpdate({ tier: { ...tier, [property]: value }})
  }

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

  const handleSelectTierElement = (property: keyof Omit<PricingTier, 'id' | 'buttonText' | 'iconUrl'>) => {
      if(!isAdminMode) return;
      onSelectElement({ sectionId: data.id, elementKey: 'tier', subElementId: tier.id, property });
  }

  const handleSelectTierIcon = () => {
    if (!isAdminMode) return;
    onSelectElement({ sectionId: data.id, elementKey: 'tier' });
  }

  return (
    <section 
        className="py-12 md:py-20 relative group bg-cover bg-center"
        style={!isLoading && imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundColor: data.style?.backgroundColor }}
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
    >
        {isLoading && <Skeleton className="absolute inset-0" />}
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
            className="absolute top-2 right-14 z-20"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
              <Icon name="camera" className="mr-2" />
              Cambiar Fondo
          </Button>
        )}
        
        <Card className="max-w-md w-full bg-background/90 backdrop-blur-sm shadow-2xl rounded-2xl">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div 
                className={cn("mb-4", isAdminMode && "cursor-pointer rounded-lg p-2 hover:bg-accent/50", selectedElement?.elementKey === 'tier' && selectedElement?.subElementId === undefined && "bg-accent/50 ring-2 ring-primary")}
                onClick={(e) => { e.stopPropagation(); handleSelectTierIcon(); }}
            >
                <PricingIconDisplay tier={tier} />
            </div>
            
             {(tier.title.text || isAdminMode) && <EditableText
              as="h2"
              id={`${data.id}-tier-title`}
              isAdminMode={isAdminMode}
              onUpdate={(val) => handleTierUpdate('title', {...tier.title, ...val})}
              className="text-xl font-bold text-foreground mb-4"
              value={tier.title}
              onSelect={() => handleSelectTierElement('title')}
              isSelected={selectedElement?.subElementId === tier.id && selectedElement.property === 'title'}
            />}

            {tier.oldPrice && (tier.oldPrice.text || isAdminMode) && (
              <div className="relative">
                <EditableText
                  as="p"
                  id={`${data.id}-tier-oldprice`}
                  isAdminMode={isAdminMode}
                  onUpdate={(val) => handleTierUpdate('oldPrice', {...tier.oldPrice, ...val})}
                  className="text-2xl text-red-500"
                  value={tier.oldPrice}
                  onSelect={() => handleSelectTierElement('oldPrice')}
                  isSelected={selectedElement?.subElementId === tier.id && selectedElement.property === 'oldPrice'}
                />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-6"></div>
              </div>
            )}
            
            <div className="flex items-baseline mb-4">
              {(tier.price.text || isAdminMode) && <EditableText
                as="p"
                id={`${data.id}-tier-price`}
                isAdminMode={isAdminMode}
                onUpdate={(val) => handleTierUpdate('price', {...tier.price, ...val})}
                className="text-4xl font-bold text-foreground"
                value={tier.price}
                onSelect={() => handleSelectTierElement('price')}
                isSelected={selectedElement?.subElementId === tier.id && selectedElement.property === 'price'}
              />}
               {(tier.currency.text || isAdminMode) && <EditableText
                as="span"
                id={`${data.id}-tier-currency`}
                isAdminMode={isAdminMode}
                onUpdate={(val) => handleTierUpdate('currency', {...tier.currency, ...val})}
                className="ml-2 text-3xl font-semibold text-foreground"
                value={tier.currency}
                onSelect={() => handleSelectTierElement('currency')}
                isSelected={selectedElement?.subElementId === tier.id && selectedElement.property === 'currency'}
              />}
            </div>

            {(tier.description.text || isAdminMode) && <EditableText
              as="p"
              id={`${data.id}-tier-description`}
              isAdminMode={isAdminMode}
              onUpdate={(val) => handleTierUpdate('description', {...tier.description, ...val})}
              className="text-muted-foreground mb-6"
              value={tier.description}
              onSelect={() => handleSelectTierElement('description')}
              isSelected={selectedElement?.subElementId === tier.id && selectedElement.property === 'description'}
            />}

            <Button size="lg" className="w-full bg-gray-800 text-white hover:bg-gray-700">
                {tier.buttonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

    