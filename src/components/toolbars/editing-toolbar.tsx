
'use client';
import React, { useState, useEffect } from 'react';
import { Property, DraggableTextData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlignCenterHorizontal } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';

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
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: 'editing-toolbar',
    });
    
    const [toolbarPosition, setToolbarPosition] = useState({ x: window.innerWidth - 400, y: 100 });
    const property = properties.find(p => p.id === selectedPropertyId);

    useEffect(() => {
        if (transform) {
            setToolbarPosition(pos => ({
                x: pos.x + transform.x,
                y: pos.y + transform.y,
            }));
        }
    }, [transform]);


    const getElementData = (): DraggableTextData | null => {
        if (!property || !selectedElement || selectedElement.type !== 'DRAGGABLE_TEXT') return null;

        for (const section of property.sections) {
            if ('draggableTexts' in section && section.draggableTexts) {
                const text = section.draggableTexts.find(t => t.id === selectedElement.textId);
                if (text) return text;
            }
        }
        return null;
    }
    
    const elementData = getElementData();
    
    const handleUpdate = (updates: Partial<DraggableTextData>) => {
        if (!property || !elementData || !selectedElement) return;
        
        const updatedProperty = JSON.parse(JSON.stringify(property));
        const section = updatedProperty.sections.find((s: any) => s.id === selectedElement.sectionId);
        
        if (!section || !('draggableTexts' in section)) return;
        
        const textIndex = section.draggableTexts.findIndex((t: DraggableTextData) => t.id === selectedElement.textId);
        if (textIndex > -1) {
            section.draggableTexts[textIndex] = { ...section.draggableTexts[textIndex], ...updates };
        }
        
        updateProperty(updatedProperty);
    };

    const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!elementData) return;
        const step = 1; // Move by 1%
        let { x, y } = elementData.position;
        switch (direction) {
            case 'up': y -= step; break;
            case 'down': y += step; break;
            case 'left': x -= step; break;
            case 'right': x += step; break;
        }
        handleUpdate({ position: { x, y } });
    };

    const handleCenter = () => {
        handleUpdate({ position: { x: 50, y: 50 } });
    }
    
    if (!elementData) return null;
    
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div ref={setNodeRef} style={{position: 'fixed', left: toolbarPosition.x, top: toolbarPosition.y, zIndex: 100, ...style}}>
            <Card className="w-80 shadow-2xl">
                <CardHeader 
                    className="flex flex-row items-center justify-between p-4 bg-slate-100 cursor-move"
                    {...listeners}
                    {...attributes}
                >
                    <CardTitle className="text-base">Editar Texto</CardTitle>
                    <button onClick={() => setSelectedElement(null)} className="p-1 rounded-full hover:bg-slate-200"><X size={16}/></button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                     <div>
                        <Label>Texto</Label>
                        <Textarea 
                          value={elementData.text}
                          onChange={e => handleUpdate({ text: e.target.value })}
                          placeholder="Escribe aquí..."
                          className="min-h-[60px]"
                        />
                    </div>
                    <div>
                        <Label>Color</Label>
                        <Input type="color" value={elementData.color} onChange={e => handleUpdate({ color: e.target.value })} className="w-full h-8 p-0" />
                    </div>
                    <div>
                        <Label>Tamaño de Fuente ({elementData.fontSize}rem)</Label>
                         <Slider
                            min={0.5}
                            max={10}
                            step={0.1}
                            value={[elementData.fontSize]}
                            onValueChange={([value]) => handleUpdate({ fontSize: value })}
                        />
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
                    <div>
                        <Label>Posición</Label>
                        <div className="grid grid-cols-3 items-center gap-2">
                             <div></div>
                             <Button size="icon" variant="outline" onClick={() => handleMove('up')}><ArrowUp /></Button>
                             <div></div>

                             <Button size="icon" variant="outline" onClick={() => handleMove('left')}><ArrowLeft /></Button>
                             <Button size="icon" variant="outline" onClick={handleCenter}><AlignCenterHorizontal /></Button>
                             <Button size="icon" variant="outline" onClick={() => handleMove('right')}><ArrowRight /></Button>

                             <div></div>
                             <Button size="icon" variant="outline" onClick={() => handleMove('down')}><ArrowDown /></Button>
                             <div></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditingToolbar;
