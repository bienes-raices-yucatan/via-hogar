
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icon } from './icon';
import { FontFamily, IconName, TextAlign, StyledText, DraggableTextData, FeatureItem, FontWeight } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { AlignCenter, AlignLeft, AlignRight, Bold } from 'lucide-react';

const allIcons: IconName[] = ['bed' , 'bath' , 'area' , 'map-pin' , 'school' , 'store' , 'bus' , 'sparkles' , 'x-mark' , 'chevron-down' , 'plus' , 'pencil' , 'trash' , 'nearby' , 'logo' , 'drag-handle' , 'chevron-left' , 'chevron-right' , 'copyright' , 'solar-panel' , 'parking' , 'laundry' , 'pool' , 'generic-feature' , 'street-view' , 'gym' , 'park' , 'whatsapp' , 'arrows-move' , 'check' , 'list', 'camera'];

// Type definitions for what the toolbar can edit
type EditableElement = {
    type: 'styledText' | 'draggableText' | 'sectionStyle' | 'amenity' | 'feature' | 'pricingTier' | 'nearbyPlace';
    data: any;
};

interface EditingToolbarProps {
    element: EditableElement;
    onUpdate: (changes: any) => void;
    onClose: () => void;
}

const fontOptions: { label: string; value: FontFamily }[] = [
    { label: 'Cuerpo de Texto', value: 'Poppins' },
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            handleChange('imageUrl', dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const renderTextControls = (data: StyledText | DraggableTextData, onValueChange: (key: string, value: any) => void) => {
      return (
        <>
            <div className="space-y-2">
                <Label>Alineación y Estilo</Label>
                 <ToggleGroup 
                    type="multiple" 
                    defaultValue={data.textAlign ? [data.textAlign] : []}
                    onValueChange={(newValues: (TextAlign | 'bold')[]) => {
                        const newAlign = newValues.find(v => v !== 'bold');
                        const newWeight = newValues.includes('bold') ? 'bold' : 'normal';
                        onValueChange('textAlign', newAlign || 'left')
                        onValueChange('fontWeight', newWeight)
                    }}
                    className="w-full grid grid-cols-4"
                 >
                    <ToggleGroupItem value="left" aria-label="Alinear a la izquierda">
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Alinear al centro">
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Alinear a la derecha">
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                     <ToggleGroupItem value="bold" aria-label="Negrita">
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="space-y-2">
                <Label>Tamaño de Fuente (rem)</Label>
                <Input
                    type="number"
                    value={data.fontSize || 1}
                    onChange={(e) => onValueChange('fontSize', parseFloat(e.target.value))}
                    step={0.1}
                    min={0.5}
                />
            </div>
            {'position' in data && (
                 <div className="space-y-2">
                    <Label>Ancho ({(data.width || 40).toFixed(0)}%)</Label>
                    <Slider
                        value={[data.width || 40]}
                        onValueChange={(val) => onValueChange('width', val[0])}
                        min={10}
                        max={100}
                        step={1}
                    />
                </div>
            )}
            <div className="space-y-2">
                <Label>Familia de Fuente</Label>
                 <Select value={data.fontFamily || 'Poppins'} onValueChange={(val: FontFamily) => onValueChange('fontFamily', val)}>
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
            <ColorPicker label="Color de Texto" value={data.color} onChange={(c) => onValueChange('color', c)} />
        </>
      )
    };
    
    const renderSectionStyleControls = () => (
        <>
            <ColorPicker label="Color de Fondo" value={values.backgroundColor} onChange={(c) => handleChange('backgroundColor', c)} />
        </>
    );
    
    const renderAmenityControls = () => (
        <>
             <IconPicker label="Icono" value={values.icon} onChange={(icon) => handleChange('icon', icon)} />
             <div className="space-y-2">
                <Label>Texto de la amenidad</Label>
                <Input value={values.text} onChange={(e) => handleChange('text', e.target.value)} />
            </div>
            <hr/>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Usar Imagen en vez de icono
            </Button>
            {values.imageUrl && (
                <Button variant="destructive" size="sm" onClick={() => handleChange('imageUrl', null)}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    );

    const renderFeatureControls = () => (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <IconPicker label="Icono" value={values.icon} onChange={(icon) => handleChange('icon', icon)} />
            <hr />
            <p className="text-xs font-bold text-muted-foreground uppercase">Título</p>
            {renderTextControls(values.title, (key, value) => handleChange('title', { ...values.title, [key]: value }))}
            <hr />
            <p className="text-xs font-bold text-muted-foreground uppercase">Descripción</p>
            {renderTextControls(values.description, (key, value) => handleChange('description', { ...values.description, [key]: value }))}
            <hr />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Usar Imagen en vez de icono
            </Button>
            {values.imageUrl && (
                <Button variant="destructive" size="sm" onClick={() => handleChange('imageUrl', null)}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    );


    const renderPricingTierControls = () => (
        <>
            <p className="text-xs font-bold text-muted-foreground uppercase">Título</p>
            {renderTextControls(values.title, (key, value) => handleChange('title', { ...values.title, [key]: value }))}
            <hr/>
             <p className="text-xs font-bold text-muted-foreground uppercase">Precio</p>
             {renderTextControls(values.price, (key, value) => handleChange('price', { ...values.price, [key]: value }))}
             <hr/>
             {values.oldPrice && (
                 <>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Precio Anterior</p>
                    {renderTextControls(values.oldPrice, (key, value) => handleChange('oldPrice', { ...values.oldPrice, [key]: value }))}
                    <hr/>
                 </>
             )}
             <p className="text-xs font-bold text-muted-foreground uppercase">Moneda</p>
             {renderTextControls(values.currency, (key, value) => handleChange('currency', { ...values.currency, [key]: value }))}
             <hr/>
             <p className="text-xs font-bold text-muted-foreground uppercase">Descripción</p>
             {renderTextControls(values.description, (key, value) => handleChange('description', { ...values.description, [key]: value }))}
        </>
    )

    const renderNearbyPlaceControls = () => (
        <>
             <IconPicker label="Icono" value={values.icon} onChange={(icon) => handleChange('icon', icon)} />
             <div className="space-y-2">
                <Label>Texto del Lugar</Label>
                <Input value={values.text} onChange={(e) => handleChange('text', e.target.value)} />
            </div>
        </>
    );

    const renderControls = () => {
        switch (element.type) {
            case 'styledText':
            case 'draggableText':
                return renderTextControls(values, handleChange);
            case 'sectionStyle':
                return renderSectionStyleControls();
            case 'amenity':
                return renderAmenityControls();
            case 'feature':
                return renderFeatureControls();
            case 'pricingTier':
                return renderPricingTierControls();
            case 'nearbyPlace':
                return renderNearbyPlaceControls();
            default:
                return <p className="text-sm text-muted-foreground">No hay opciones de edición para este elemento.</p>;
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-72 bg-background border rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm font-medium">Editar Elemento</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <Icon name="x-mark" />
                </Button>
            </div>
            <ScrollArea className="h-[40vh]">
                <div className="p-4 space-y-4">
                    {renderControls()}
                </div>
            </ScrollArea>
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
        setColor(value);
    }, [value]);

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
                    <div className="p-2">
                        <Input
                            type="text"
                            value={color || ''}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};


const IconPicker: React.FC<{ label: string; value: IconName; onChange: (icon: IconName) => void }> = ({ label, value, onChange }) => {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <div className="flex items-center gap-2">
                            {value && <Icon name={value} className="h-4 w-4" />}
                            <span className="capitalize">{value ? value.replace('-', ' ') : "Seleccionar Icono"}</span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                    <ScrollArea className="h-72">
                        <div className="p-2 grid grid-cols-4 gap-2">
                            {allIcons.map((icon) => (
                                <Button
                                    key={icon}
                                    variant={value === icon ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => onChange(icon)}
                                    className="w-full h-full aspect-square"
                                >
                                    <Icon name={icon} />
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    );
};
