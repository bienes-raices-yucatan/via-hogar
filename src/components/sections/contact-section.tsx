'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ContactSectionData, ContactSubmission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import { Switch } from '../ui/switch';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';
import { saveImage, getImage } from '@/lib/db';

interface ContactSectionProps {
  data: ContactSectionData;
  propertyId: string;
  onContactSubmit: (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => void;
  updateSection: (sectionId: string, updatedData: Partial<ContactSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ data, propertyId, onContactSubmit, updateSection, deleteSection, isAdminMode }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'broker'>('buyer');
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundPosition, setBackgroundPosition] = useState('center');
  const [imageUrl, setImageUrl] = useState(data.imageUrl);

  useEffect(() => {
    const loadImage = async () => {
        if (data.imageKey) {
            const blob = await getImage(data.imageKey);
            if (blob) {
                setImageUrl(URL.createObjectURL(blob));
            }
        } else if (data.imageUrl) {
            setImageUrl(data.imageUrl);
        }
    };
    loadImage();

    return () => {
        if (imageUrl && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
    };
  }, [data.imageKey, data.imageUrl]);

  useEffect(() => {
    if (!data.parallaxEnabled || isAdminMode) {
      setBackgroundPosition('center');
      return;
    }

    let animationFrameId: number;
    const handleScroll = () => {
       if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top;
        const speed = 0.3; // Slower speed for a more subtle effect
        const newY = -(top * speed);
        
        animationFrameId = requestAnimationFrame(() => {
          setBackgroundPosition(`50% ${newY}px`);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [data.parallaxEnabled, isAdminMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContactSubmit({ propertyId, name, phone, userType });
    setName('');
    setPhone('');
    setUserType('buyer');
  };
  
  const handleTextUpdate = (field: 'title' | 'subtitle', value: string) => {
    const currentData = data[field];
    if (currentData) {
      const updatedField = { ...currentData, text: value };
      updateSection(data.id, { [field]: updatedField });
    }
  };

  const handleButtonTextUpdate = (value: string) => {
    updateSection(data.id, { buttonText: value });
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const key = `contact-${data.id}-${uuidv4()}`;
        await saveImage(key, file);
        updateSection(data.id, { imageKey: key, imageUrl: undefined });
    }
  };

  return (
    <div 
        ref={sectionRef}
        className="relative group/section w-full py-16 md:py-24 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition,
          backgroundAttachment: data.parallaxEnabled && !isAdminMode ? 'fixed' : 'scroll'
        }}
    >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <div className="relative z-10 container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    {data.title && (
                      <div style={{fontSize: data.title.fontSize, color: data.title.color, fontFamily: data.title.fontFamily}}>
                        <EditableText value={data.title.text} onChange={(val) => handleTextUpdate('title', val)} isAdminMode={isAdminMode} className="font-headline font-bold" as="h2"/>
                      </div>
                    )}
                    {data.subtitle && (
                      <div style={{fontSize: data.subtitle.fontSize, color: data.subtitle.color, fontFamily: data.subtitle.fontFamily}} className="mt-4">
                        <EditableText value={data.subtitle.text} onChange={(val) => handleTextUpdate('subtitle', val)} isAdminMode={isAdminMode} as="p"/>
                      </div>
                    )}
                </div>
                <div className="bg-white p-8 rounded-lg shadow-xl border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="text-slate-700">Nombre Completo</Label>
                            <Input id="name" type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-slate-700">Teléfono</Label>
                            <Input id="phone" type="tel" placeholder="Tu número de teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-2" />
                        </div>
                        <div>
                            <Label className="text-slate-700">Soy un</Label>
                            <RadioGroup value={userType} onValueChange={(value: 'buyer' | 'broker') => setUserType(value)} className="mt-2 flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="buyer" id="buyer" />
                                    <Label htmlFor="buyer">Comprador</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="broker" id="broker" />
                                    <Label htmlFor="broker">Agente</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-amber-600 text-lg py-6">
                           {data.buttonText && <EditableText value={data.buttonText} onChange={handleButtonTextUpdate} isAdminMode={isAdminMode} />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
         {isAdminMode && (
            <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity flex flex-col sm:flex-row gap-2 items-center bg-black/20 backdrop-blur-sm p-2 rounded-lg">
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id={`parallax-contact-${data.id}`}
                  checked={!!data.parallaxEnabled}
                  onCheckedChange={(checked) => updateSection(data.id, { parallaxEnabled: checked })}
                />
                <Label htmlFor={`parallax-contact-${data.id}`} className="text-white text-xs font-semibold">Parallax</Label>
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={handleImageButtonClick} title="Cambiar imagen de fondo">
                <ImageIcon />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
                  <Trash2 />
              </Button>
            </div>
        )}
    </div>
  );
};

export default ContactSection;
