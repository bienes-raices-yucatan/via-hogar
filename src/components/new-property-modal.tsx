
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
import { geocodeAddress } from '@/ai/gemini-service';
import { useToast } from '@/hooks/use-toast';

interface NewPropertyModalProps {
  onClose: () => void;
  onCreate: (address: string, lat: number, lng: number) => Promise<void>;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({ onClose, onCreate }) => {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('19.4326'); // Default to Mexico City
  const [lng, setLng] = useState('-99.1332'); // Default to Mexico City
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleGeocode = async () => {
      if (!address) {
          setError('Por favor, ingresa una dirección para geocodificar.');
          return;
      }
      setIsLoading(true);
      setError('');
      try {
          const coords = await geocodeAddress(address);
          setLat(coords.lat.toString());
          setLng(coords.lng.toString());
          toast({ title: "Geocodificación Exitosa", description: "Se obtuvieron las coordenadas para la dirección." });
      } catch (err) {
          console.error(err);
          const errorMessage = err instanceof Error ? err.message : 'Un error desconocido ocurrió.';
          setError(`No se pudo obtener la geolocalización. ${errorMessage}`);
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
        setError('Por favor, ingresa una dirección.');
        return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
        setError('Las coordenadas deben ser números válidos.');
        return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onCreate(address, latNum, lngNum);
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
            Ingresa la dirección y las coordenadas (puedes obtenerlas de Google Maps).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="address">Dirección de la Propiedad</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Av. Reforma 222, CDMX"
                    disabled={isLoading}
                  />
                  <Button type="button" onClick={handleGeocode} disabled={isLoading || !address} variant="outline">
                    {isLoading ? <Spinner size="sm" /> : 'Geocodificar'}
                  </Button>
                </div>
              </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="lat">Latitud</Label>
                    <Input
                        id="lat"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="Ej: 19.4326"
                        disabled={isLoading}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="lng">Longitud</Label>
                    <Input
                        id="lng"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="Ej: -99.1332"
                        disabled={isLoading}
                    />
                </div>
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
