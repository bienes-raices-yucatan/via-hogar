'use client';

import React, { useState } from 'react';
import { ContactSectionData, ContactSubmission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2 } from 'lucide-react';

interface ContactSectionProps {
  data: ContactSectionData;
  propertyId: string;
  onContactSubmit: (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ data, propertyId, onContactSubmit, deleteSection, isAdminMode }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'broker'>('buyer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContactSubmit({ propertyId, name, phone, userType });
    setName('');
    setPhone('');
    setUserType('buyer');
  };

  return (
    <div 
        className="relative group/section w-full py-16 md:py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
    >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <div className="relative z-10 container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h2 className="font-headline font-bold text-slate-800" style={{fontSize: data.title.fontSize, color: data.title.color}}>{data.title.text}</h2>
                    <p className="mt-4 text-slate-600" style={{fontSize: data.subtitle.fontSize, color: data.subtitle.color}}>{data.subtitle.text}</p>
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
                        <Button type="submit" className="w-full bg-primary hover:bg-amber-600 text-lg py-6">{data.buttonText}</Button>
                    </form>
                </div>
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

export default ContactSection;
