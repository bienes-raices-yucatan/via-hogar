'use client';
import React, { useEffect, useState } from 'react';
import { DraggableTextData, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';

interface EditingToolbarProps {
  selectedElement: any;
  setSelectedElement: (element: any | null) => void;
  updateProperty: (property: Property) => void;
  properties: Property[];
  selectedPropertyId: string | null;
}

const EditingToolbar: React.FC<EditingToolbarProps> = ({
  selectedElement,
  setSelectedElement,
  updateProperty,
  properties,
  selectedPropertyId
}) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 370, y: 50 });
    const dragStartPos = React.useRef<{x: number, y: number} | null>(null);

    const property = properties.find(p => p.id === selectedPropertyId);

    const getElementData = (): DraggableTextData | null => {
        if (!property || !selectedElement || selectedElement.type !== 'DRAGGABLE_TEXT') return null;
        const section = property.sections.find(s => s.id === selectedElement.sectionId);
        if (section?.type !== 'HERO') return null;
        if (section.title.id === selectedElement.textId) return section.title;
        return section.floatingTexts.find(t => t.id === selectedElement.textId) || null;
    }
    
    const elementData = getElementData();
    
    const handleUpdate = (updates: Partial<DraggableTextData>) => {
        if (!property || !elementData) return;
        
        let updatedProperty = JSON.parse(JSON.stringify(property));
        let section = updatedProperty.sections.find((s: any) => s.id === selectedElement.sectionId);
        
        if (section.title.id === elementData.id) {
            section.title = { ...section.title, ...updates };
        } else {
            section.floatingTexts = section.floatingTexts.map((t: any) => t.id === elementData.id ? { ...t, ...updates } : t);
        }
        updateProperty(updatedProperty);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragStartPos.current) return;
        setPosition({
            x: e.clientX - dragStartPos.current.x,
            y: e.clientY - dragStartPos.current.y,
        });
    };

    const handleMouseUp = () => {
        dragStartPos.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
    
    if (!elementData) return null;

    return (
        <div className="fixed z-50" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
            <Card className="w-80 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-slate-100 cursor-move" onMouseDown={handleMouseDown}>
                    <CardTitle className="text-base">Editar Texto</CardTitle>
                    <button onClick={() => setSelectedElement(null)} className="p-1 rounded-full hover:bg-slate-200"><X size={16}/></button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <Label>Color</Label>
                        <Input type="color" value={elementData.color} onChange={e => handleUpdate({ color: e.target.value })} />
                    </div>
                    <div>
                        <Label>Tamaño de Fuente (px)</Label>
                        <Input type="number" value={parseInt(elementData.fontSize)} onChange={e => handleUpdate({ fontSize: `${e.target.value}px` })} />
                    </div>
                    <div>
                        <Label>Fuente</Label>
                         <Select value={elementData.fontFamily} onValueChange={(val: any) => handleUpdate({ fontFamily: val })}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Lora">Lora</SelectItem>
                                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditingToolbar;
