
"use client";
import React, { useState } from 'react';
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
import Spinner from './spinner';

interface NewPropertyModalProps {
  onClose: () => void;
  onCreate: (lat: number, lng: number) => Promise<void>;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({ onClose, onCreate }) => {
  const [lat, setLat] = useState('19.4326'); // Default to Mexico City
  const [lng, setLng] = useState('-99.1332'); // Default to Mexico City
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
        setError('Las coordenadas deben ser números válidos.');
        return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onCreate(latNum, lngNum);
      onClose(); // Close on success
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Un error desconocido ocurrió.';
      setError(`No se pudo crear la propiedad. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Propiedad</DialogTitle>
          <DialogDescription>
            Ingresa la dirección y las coordenadas (puedes obtenerlas de Google Maps). La dirección se puede editar más tarde.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lat" className="text-right">
                Latitud
              </Label>
              <Input
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="col-span-3"
                placeholder="Ej: 19.4326"
                disabled={isLoading}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lng" className="text-right">
                Longitud
              </Label>
              <Input
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="col-span-3"
                placeholder="Ej: -99.1332"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="col-span-4 text-center text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Crear Propiedad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
