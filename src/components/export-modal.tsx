
"use client";

import React, { useState } from 'react';
import { Property } from '@/lib/types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: Property[];
    onExport: (selectedIds: Set<string>) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, properties, onExport }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(properties.map(p => p.id)));

    const handleToggleSelection = (propertyId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(propertyId)) {
                newSet.delete(propertyId);
            } else {
                newSet.add(propertyId);
            }
            return newSet;
        });
    };

    const handleToggleAll = () => {
        if (selectedIds.size === properties.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(properties.map(p => p.id)));
        }
    };

    const handleConfirm = () => {
        onExport(selectedIds);
    };
    
    const areAllSelected = properties.length > 0 && selectedIds.size === properties.length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Guardar Propiedades</DialogTitle>
                    <DialogDescription>
                        Selecciona las propiedades que deseas guardar en el archivo de respaldo.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center space-x-2 border-t border-b py-2 px-4">
                    <Checkbox
                        id="select-all-export"
                        checked={areAllSelected}
                        onCheckedChange={handleToggleAll}
                    />
                    <Label htmlFor="select-all-export" className="text-sm font-medium leading-none">
                        {areAllSelected ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                    </Label>
                </div>
                
                <ScrollArea className="h-64">
                    <div className="p-4 space-y-4">
                        {properties.map(prop => (
                            <div key={prop.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`export-${prop.id}`}
                                    checked={selectedIds.has(prop.id)}
                                    onCheckedChange={() => handleToggleSelection(prop.id)}
                                />
                                <Label htmlFor={`export-${prop.id}`} className="font-normal w-full truncate">
                                    {prop.name}
                                </Label>
                            </div>
                        ))}
                         {properties.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-10">No hay propiedades para guardar.</p>
                         )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                        Confirmar y Guardar ({selectedIds.size})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
