
"use client";

import React, { useRef } from 'react';
import { ContactSectionData, SelectedElement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable-text';
import { SectionToolbar } from '../section-toolbar';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';
import { saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';

interface ContactSectionProps {
  data: ContactSectionData;
  onUpdate: (data: ContactSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
  onOpenContactForm: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  isAdminMode,
  selectedElement,
  onSelectElement,
  onOpenContactForm,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

    const handleTitleUpdate = (newTitle: any) => {
        if (data.title) {
            onUpdate({ ...data, title: { ...data.title, ...newTitle } });
        }
    };
    
    const handleSubtitleUpdate = (newSubtitle: any) => {
        if (data.subtitle) {
            onUpdate({ ...data, subtitle: { ...data.subtitle, ...newSubtitle } });
        }
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
        className="relative group text-white"
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'backgroundImageUrl' })}
    >
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'backgroundImageUrl'} />}
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
      {isLoading ? <Skeleton className="absolute inset-0" /> : (
        <div 
          className={cn(
              "py-24 md:py-32 bg-cover bg-center bg-no-repeat",
              isAdminMode && "group-hover:brightness-50 transition-all",
              selectedElement?.sectionId === data.id && selectedElement.elementKey === 'backgroundImageUrl' && "brightness-50"
          )}
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${imageUrl})` }}
        >
          <div className="container mx-auto px-4 text-center">
              {data.title && (
                   <EditableText
                      as="h2"
                      id={`${data.id}-title`}
                      value={data.title}
                      onUpdate={handleTitleUpdate}
                      className="font-bold mb-4"
                      isAdminMode={isAdminMode}
                      onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
                      isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
                  />
              )}
             
              {data.subtitle && (
                   <EditableText
                      as="p"
                      id={`${data.id}-subtitle`}
                      value={data.subtitle}
                      onUpdate={handleSubtitleUpdate}
                      className="max-w-2xl mx-auto mb-8"
                      isAdminMode={isAdminMode}
                      onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'subtitle' })}
                      isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'subtitle'}
                  />
              )}
            
            <Button size="lg" onClick={onOpenContactForm}>
              <Icon name="whatsapp" className="mr-2" />
              Contactar Ahora
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
