'use client';
import React, { useState, useEffect } from 'react';
import { Property, StyledText, DraggableTextData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Textarea } from '../ui/textarea';

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


    const getElementData = (): StyledText | null => {
        if (!property || !selectedElement) return null;

        const section = property.sections.find(s => s.id === selectedElement.sectionId);
        if (!section) return null;

        if (selectedElement.type === 'STYLED_TEXT') {
            if ('title' in section && selectedElement.field === 'title' && section.title) {
                return section.title;
            }
            if ('subtitle' in section && selectedElement.field === 'subtitle' && section.subtitle) {
                return section.subtitle;
            }
        } else if (selectedElement.type === 'DRAGGABLE_TEXT') {
            if ('draggableTexts' in section) {
                return section.draggableTexts.find(t => t.id === selectedElement.textId) || null;
            }
        }
        return null;
    }
    
    const elementData = getElementData();
    
    const handleUpdate = (updates: Partial<StyledText>) => {
        if (!property || !elementData || !selectedElement) return;
        
        const updatedProperty = JSON.parse(JSON.stringify(property));
        const section = updatedProperty.sections.find((s: any) => s.id === selectedElement.sectionId);
        
        if (!section) return;

        if (selectedElement.type === 'STYLED_TEXT' && selectedElement.field in section) {
           section[selectedElement.field] = { ...section[selectedElement.field], ...updates };
        } else if (selectedElement.type === 'DRAGGABLE_TEXT' && 'draggableTexts' in section) {
            const textIndex = section.draggableTexts.findIndex((t: DraggableTextData) => t.id === selectedElement.textId);
            if (textIndex > -1) {
                section.draggableTexts[textIndex] = { ...section.draggableTexts[textIndex], ...updates };
            }
        }
        
        updateProperty(updatedProperty);
    };
    
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
                        <Label>Tamaño de Fuente</Label>
                        <Input 
                          type="text"
                          value={elementData.fontSize}
                          onChange={e => handleUpdate({ fontSize: e.target.value })}
                          placeholder="Ej: 2.5rem o clamp(...)"
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
                </CardContent>
            </Card>
        </div>
    );
};

export default EditingToolbar;
