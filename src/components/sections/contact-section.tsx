'use client';

import React, { useState } from 'react';
import { ContactSectionData, ContactSubmission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2 } from 'lucide-react';
import EditableText from '../editable-text';
import { Card, CardContent } from '../ui/card';

interface ContactSectionProps {
  data: ContactSectionData;
  propertyId: string;
  onContactSubmit: (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => void;
  updateSection: (sectionId: string, updatedData: Partial<ContactSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ 
  data, 
  propertyId, 
  onContactSubmit, 
  updateSection, 
  deleteSection, 
  isAdminMode 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'broker'>('buyer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onContactSubmit({ propertyId, name, phone, userType });
      setName('');
      setPhone('');
      setUserType('buyer');
    }
  };
  
  const handleTitleUpdate = (value: string) => {
    if (data.title) {
        updateSection(data.id, { title: { ...data.title, text: value } });
    }
  };

  const handleButtonTextUpdate = (value: string) => {
    updateSection(data.id, { buttonText: value });
  };

  return (
    <div 
        id="section-contact"
        className="py-16 md:py-24 relative group/section"
        style={{ backgroundColor: data.style.backgroundColor }}
    >
        <div className="container mx-auto px-4 flex justify-center">
          <Card className="w-full max-w-lg shadow-lg">
            <CardContent className="p-8">
              {data.title && (
                <div 
                  className="text-center mb-8"
                  style={{
                    fontSize: data.title.fontSize, 
                    color: data.title.color, 
                    fontFamily: data.title.fontFamily
                  }}
                >
                  <EditableText 
                    value={data.title.text} 
                    onChange={handleTitleUpdate} 
                    isAdminMode={isAdminMode} 
                    as="h2"
                    className="font-semibold"
                  />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">Nombre</Label>
                  <Input id="name" type="text" placeholder="Tu nombre completo" value={name} onChange={(e) => setName(e.target.value)} required className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-700 font-medium">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="Tu número de teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-2" />
                </div>
                
                <RadioGroup value={userType} onValueChange={(value: 'buyer' | 'broker') => setUserType(value)} className="space-y-2 pt-2">
                  <Label className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <span className="font-medium">Me interesa para mi la casa</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="broker" id="broker" />
                    <span className="font-medium">Soy vendedor inmobiliario o Broker</span>
                  </Label>
                </RadioGroup>

                <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 text-lg py-6 rounded-lg">
                  {data.buttonText && <EditableText value={data.buttonText} onChange={handleButtonTextUpdate} isAdminMode={isAdminMode} />}
                </Button>
              </form>
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

export default ContactSection;
