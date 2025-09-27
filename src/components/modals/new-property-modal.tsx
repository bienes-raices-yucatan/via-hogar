'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string, address: string, price: number, lat: number, lng: number }) => void;
}

const NewPropertyModal: React.FC<NewPropertyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && address.trim()) {
      onSubmit({
        name,
        address,
        price: parseFloat(price) || 0,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0
      });
      setName('');
      setAddress('');
      setPrice('');
      setLat('');
      setLng('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nueva Propiedad</DialogTitle>
          <DialogDescription>
            Introduce los detalles de la nueva propiedad.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Villa Moderna" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: 123 Ocean Drive, Miami, FL" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Precio</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: 500000" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lat" className="text-right">Latitud</Label>
              <Input id="lat" type="number" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Ej: 25.7617" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lng" className="text-right">Longitud</Label>
              <Input id="lng" type="number" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Ej: -80.1918" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Crear Propiedad</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPropertyModal;
