
"use client";

import React, { useRef, useState } from 'react';
import { ContactSectionData, SelectedElement, ContactSubmission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable-text';
import { SectionToolbar } from '../section-toolbar';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';
import { saveImage } from '@/lib/storage';
import { useImageLoader } from '@/hooks/use-image-loader';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ContactSectionProps {
  data: ContactSectionData;
  onUpdate: (data: Partial<ContactSectionData>) => void;
  onDelete: (sectionId: string) => void;
  onSubmit: (formData: Omit<ContactSubmission, 'id' | 'propertyId' | 'propertyName' | 'submittedAt'>) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (element: SelectedElement | null) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  data,
  onUpdate,
  onDelete,
  onSubmit,
  isAdminMode,
  selectedElement,
  onSelectElement,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { imageUrl, isLoading } = useImageLoader(data.backgroundImageUrl);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [userType, setUserType] = useState<'buyer' | 'broker'>('buyer');
    const [error, setError] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        setError('');
        onSubmit({ name, phone, userType });
        setName('');
        setPhone('');
    };
    
    const isSelected = selectedElement?.sectionId === data.id && (selectedElement.elementKey === 'backgroundImageUrl' || selectedElement.elementKey === 'style');

  return (
    <section 
        className="relative group h-screen min-h-[700px] text-foreground flex items-center justify-center"
        onClick={() => isAdminMode && onSelectElement({ sectionId: data.id, elementKey: 'style' })}
        data-section-type="contact"
    >
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      
      {isLoading ? <Skeleton className="absolute inset-0 h-full w-full" /> : (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', backgroundColor: !imageUrl ? '#f1f5f9' : undefined }}
        >
         <div className="absolute inset-0 bg-black/10"></div>
        </div>
      )}

      {isAdminMode && <SectionToolbar sectionId={data.id} onDelete={onDelete} isSectionSelected={isSelected} />}
      {isAdminMode && (
          <Button
            variant="secondary"
            className="absolute top-2 right-14 z-20"
            onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click()
            }}
            size="sm"
          >
              <Icon name="camera" className="mr-2 h-4 w-4" />
              Cambiar Fondo
          </Button>
      )}

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
            {data.title && (data.title.text || isAdminMode) && (
                 <EditableText
                    as="h2"
                    id={`${data.id}-title`}
                    value={data.title}
                    onUpdate={handleTitleUpdate}
                    className="font-bold text-center text-white"
                    isAdminMode={isAdminMode}
                    onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
                    isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'title'}
                />
            )}
           
            {data.subtitle && (data.subtitle.text || isAdminMode) && (
                 <EditableText
                    as="p"
                    id={`${data.id}-subtitle`}
                    value={data.subtitle}
                    onUpdate={handleSubtitleUpdate}
                    className="max-w-2xl mx-auto text-center text-gray-200 mt-4 mb-8"
                    isAdminMode={isAdminMode}
                    onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'subtitle' })}
                    isSelected={selectedElement?.sectionId === data.id && selectedElement.elementKey === 'subtitle'}
                />
            )}
          
          <Card className="w-full max-w-lg bg-background/90 backdrop-blur-sm shadow-2xl rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input 
                            id="name" 
                            placeholder="Tu nombre completo" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="Tu número de teléfono"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                      </div>
                      <div className="space-y-3">
                          <Label>Soy</Label>
                          <RadioGroup
                            defaultValue="buyer"
                            className="flex gap-4"
                            onValueChange={(value: 'buyer' | 'broker') => setUserType(value)}
                            value={userType}
                          >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="buyer" id="r-buyer" />
                                <Label htmlFor="r-buyer" className="font-normal">Comprador</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="broker" id="r-broker" />
                                <Label htmlFor="r-broker" className="font-normal">Bróker</Label>
                            </div>
                         </RadioGroup>
                      </div>

                      {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                      )}
                      <Button type="submit" className="w-full" size="lg">
                          Enviar
                      </Button>
                  </form>
              </CardContent>
          </Card>
      </div>
    </section>
  );
};

    