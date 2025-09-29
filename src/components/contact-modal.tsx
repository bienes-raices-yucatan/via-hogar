
"use client";

import React, { useState } from 'react';
import { Property, ContactSubmission } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<ContactSubmission, 'id' | 'propertyId' | 'propertyName' | 'submittedAt'>) => void;
  property: Property;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit, property }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'broker'>('buyer');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    onSubmit({ name, phone, userType });
    toast({
        title: "¡Gracias por tu interés!",
        description: `Hemos recibido tu información para la propiedad "${property.name}". Te contactaremos pronto.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contactar por: {property.name}</DialogTitle>
          <DialogDescription>
            Déjanos tus datos y un asesor se pondrá en contacto contigo a la brevedad.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Soy</Label>
              <RadioGroup
                defaultValue="buyer"
                className="col-span-3 flex gap-4"
                onValueChange={(value: 'buyer' | 'broker') => setUserType(value)}
                value={userType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="r1" />
                  <Label htmlFor="r1">Comprador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="broker" id="r2" />
                  <Label htmlFor="r2">Bróker</Label>
                </div>
              </RadioGroup>
            </div>
            {error && (
              <p className="col-span-4 text-center text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Enviar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
