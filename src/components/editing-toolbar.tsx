
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icon } from './icon';
import { FontFamily } from '@/lib/types';
import { cn } from '@/lib/utils';

// Type definitions for what the toolbar can edit
type EditableElement = {
    type: 'styledText' | 'draggableText' | 'sectionStyle';
    data: any;
};

interface EditingToolbarProps {
    element: EditableElement;
    onUpdate: (changes: any) => void;
    onClose: () => void;
}

const fontOptions: { label: string; value: FontFamily }[] = [
    { label: 'Sans Serif', value: 'Roboto' },
    { label: 'Serif Clásico', value: 'Lora' },
    { label: 'Serif Moderno', value: 'Playfair Display' },
    { label: 'Cabecera', value: 'Montserrat' },
];

export const EditingToolbar: React.FC<EditingToolbarProps> = ({ element, onUpdate, onClose }) => {
    const [values, setValues] = useState(element.data);
    
    useEffect(() => {
        setValues(element.data);
    }, [element.data]);

    const handleChange = (key: string, value: any) => {
        const newValues = { ...values, [key]: value };
        setValues(newValues);
        onUpdate({ [key]: value });
    };

    const renderTextControls = () => (
        <>
            <div className="space-y-2">
                <Label>Tamaño ({values.fontSize?.toFixed(2) || '1.00'}rem)</Label>
                <Slider
                    value={[values.fontSize || 1]}
                    onValueChange={(val) => handleChange('fontSize', val[0])}
                    min={0.5}
                    max={10}
                    step={0.1}
                />
            </div>
            <div className="space-y-2">
                <Label>Familia de Fuente</Label>
                 <Select value={values.fontFamily || 'Roboto'} onValueChange={(val: FontFamily) => handleChange('fontFamily', val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                    </SelectTrigger>
                    <SelectContent>
                        {fontOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} style={{fontFamily: opt.value}}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ColorPicker label="Color de Texto" value={values.color} onChange={(c) => handleChange('color', c)} />
        </>
    );
    
    const renderSectionStyleControls = () => (
        <>
            <ColorPicker label="Color de Fondo" value={values.backgroundColor} onChange={(c) => handleChange('backgroundColor', c)} />
        </>
    );

    const renderControls = () => {
        switch (element.type) {
            case 'styledText':
            case 'draggableText':
                return renderTextControls();
            case 'sectionStyle':
                return renderSectionStyleControls();
            default:
                return <p className="text-sm text-muted-foreground">No hay opciones de edición para este elemento.</p>;
        }
    };

    return (
        <div className="fixed bottom-20 right-4 z-50 w-64 bg-background border rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm font-medium">Editar Elemento</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <Icon name="x-mark" />
                </Button>
            </div>
            <div className="p-4 space-y-4">
                {renderControls()}
            </div>
        </div>
    );
};

// --- Sub-components for the Toolbar ---

const Label: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
    <label className={cn("text-xs font-medium text-muted-foreground", className)}>{children}</label>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (color: string) => void }> = ({ label, value, onChange }) => {
    const [color, setColor] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (color !== value) {
                onChange(color);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [color, onChange, value]);

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded !bg-center !bg-cover transition-all" style={{ background: color }}></div>
                            <div className="truncate flex-1">{color}</div>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                     {/* Basic hex color input. A real app might use a library like react-color */}
                    <div className="p-2">
                        <Input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
