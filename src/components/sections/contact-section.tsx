
"use client";

import React from 'react';
import { ContactSectionData, SelectedElement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable-text';
import { SectionToolbar } from '../section-toolbar';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';

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

  return (
    <section className="relative group text-white">
      {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={false} />}
      <div 
        className="py-24 md:py-32 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.backgroundImageUrl})` }}
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
    </section>
  );
};
