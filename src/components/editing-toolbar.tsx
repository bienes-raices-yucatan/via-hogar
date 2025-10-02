
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icon } from './icon';
import { FontFamily, IconName, TextAlign, StyledText, DraggableTextData, FeatureItem, FontWeight, PageSectionStyle, AmenityItem, PricingTier, NearbyPlace, ButtonSectionData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from 'lucide-react';

const allIcons: IconName[] = ['bed' , 'bath' , 'area' , 'map-pin' , 'school' , 'store' , 'bus' , 'sparkles' , 'x-mark' , 'chevron-down' , 'plus' , 'pencil' , 'trash' , 'nearby' , 'logo' , 'drag-handle' , 'chevron-left' , 'chevron-right' , 'copyright' , 'solar-panel' , 'parking' , 'laundry' , 'pool' , 'generic-feature' , 'street-view' , 'gym' , 'park' , 'whatsapp' , 'arrows-move' , 'check' , 'list', 'camera', 'upload', 'download', 'message-circle'];

// Type definitions for what the toolbar can edit
type EditableElement = {
    type: 'styledText' | 'draggableText' | 'sectionStyle' | 'amenity' | 'feature' | 'pricingTier' | 'nearbyPlace' | 'button';
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
            // The onUpdate will trigger the saveImage logic in the parent component
            const keyToUpdate = element.type === 'amenity' || element.type === 'feature' ? 'imageUrl' : 'backgroundImageUrl';
            onUpdate({ [keyToUpdate]: dataUrl });
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
                    defaultValue={[...(data.textAlign ? [data.textAlign] : ['left']), ...(data.fontWeight === 'bold' ? ['bold'] : [])]}
                    onValueChange={(newValues: (TextAlign | 'bold')[]) => {
                        const newAlign = newValues.find(v => v === 'left' || v === 'center' || v === 'right') || 'left';
                        const newWeight = newValues.includes('bold') ? 'bold' : 'normal';
                        onUpdate({ textAlign: newAlign, fontWeight: newWeight });
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
                    onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 1})}
                    step={0.1}
                    min={0.5}
                />
            </div>
            {'position' in data && (
                 <div className="space-y-2">
                    <Label>Ancho del Contenedor ({(data.width || 40).toFixed(0)}%)</Label>
                    <Slider
                        value={[data.width || 40]}
                        onValueChange={(val) => onUpdate({ width: val[0] })}
                        min={10}
                        max={100}
                        step={1}
                    />
                </div>
            )}
            <div className="space-y-2">
                <Label>Familia de Fuente</Label>
                 <Select value={data.fontFamily || 'Poppins'} onValueChange={(val: FontFamily) => onUpdate({fontFamily: val})}>
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
            <ColorPicker label="Color de Texto" value={data.color} onChange={(c) => onUpdate({ color: c })} />
        </>
      )
    };
    
    const renderSectionStyleControls = (data: PageSectionStyle, onValueChange: (key: string, value: any) => void) => (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Cambiar Imagen de Fondo
            </Button>
            <hr />
            <ColorPicker label="Color de Fondo" value={data.backgroundColor || '#FFFFFF'} onChange={(c) => onValueChange('backgroundColor', c)} />
            <hr />
            <div className="space-y-2">
              <Label>Altura de la Sección ({(data.height || 80).toFixed(0)}vh)</Label>
              <Slider
                value={[data.height || 80]}
                onValueChange={(v) => onValueChange('height', v[0])}
                min={20}
                max={100}
                step={1}
              />
            </div>
            <hr />
            <Label>Radio de las Esquinas (rem)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Sup. Izquierda</Label>
                <Input type="number" value={data.borderRadiusTopLeft || 0} onChange={(e) => onValueChange('borderRadiusTopLeft', parseFloat(e.target.value))} step="0.1" min="0"/>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sup. Derecha</Label>
                <Input type="number" value={data.borderRadiusTopRight || 0} onChange={(e) => onValueChange('borderRadiusTopRight', parseFloat(e.target.value))} step="0.1" min="0"/>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Inf. Izquierda</Label>
                <Input type="number" value={data.borderRadiusBottomLeft || 0} onChange={(e) => onValueChange('borderRadiusBottomLeft', parseFloat(e.target.value))} step="0.1" min="0"/>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Inf. Derecha</Label>
                <Input type="number" value={data.borderRadiusBottomRight || 0} onChange={(e) => onValueChange('borderRadiusBottomRight', parseFloat(e.target.value))} step="0.1" min="0"/>
              </div>
            </div>
        </>
    );
    
    const renderAmenityControls = (data: AmenityItem) => (
        <>
            <IconPicker label="Icono" value={data.icon} onChange={(icon) => onUpdate({ icon })} />
            <div className="space-y-2">
                <Label>Texto de la amenidad</Label>
                <Input value={data.text} onChange={(e) => onUpdate({ text: e.target.value })} />
            </div>
            <hr/>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Usar Imagen en vez de icono
            </Button>
            {data.imageUrl && (
                <Button variant="destructive" size="sm" onClick={() => onUpdate({ imageUrl: null })}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    );

    const renderFeatureControls = (data: FeatureItem) => (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <IconPicker label="Icono" value={data.icon} onChange={(icon) => onUpdate({ icon })} />
            <hr />
            <p className="text-xs font-bold text-muted-foreground uppercase">Título</p>
            {renderTextControls(data.title, (key, value) => onUpdate({ title: { ...data.title, [key]: value } }))}
            <hr />
            <p className="text-xs font-bold text-muted-foreground uppercase">Descripción</p>
            {renderTextControls(data.description, (key, value) => onUpdate({ description: { ...data.description, [key]: value } }))}
            <hr />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Usar Imagen en vez de icono
            </Button>
            {data.imageUrl && (
                <Button variant="destructive" size="sm" onClick={() => onUpdate({ imageUrl: null })}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    );


    const renderPricingTierControls = (data: PricingTier) => (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Cambiar Imagen/Icono
            </Button>
            {data.iconUrl && (
                <Button variant="destructive" size="sm" onClick={() => onUpdate({ iconUrl: null })}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
            <hr/>
            <p className="text-xs font-bold text-muted-foreground uppercase">Título</p>
            {renderTextControls(data.title, (key, value) => onUpdate({ title: { ...data.title, [key]: value } }))}
            <hr/>
            <p className="text-xs font-bold text-muted-foreground uppercase">Precio</p>
            {renderTextControls(data.price, (key, value) => onUpdate({ price: { ...data.price, [key]: value } }))}
            <hr/>
            {data.oldPrice && (
                <>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Precio Anterior</p>
                    {renderTextControls(data.oldPrice, (key, value) => onUpdate({ oldPrice: { ...data.oldPrice, [key]: value } }))}
                    <hr/>
                </>
            )}
            <p className="text-xs font-bold text-muted-foreground uppercase">Moneda</p>
            {renderTextControls(data.currency, (key, value) => onUpdate({ currency: { ...data.currency, [key]: value } }))}
            <hr/>
            <p className="text-xs font-bold text-muted-foreground uppercase">Descripción</p>
            {renderTextControls(data.description, (key, value) => onUpdate({ description: { ...data.description, [key]: value } }))}
        </>
    )

    const renderNearbyPlaceControls = (data: NearbyPlace) => (
        <>
            <IconPicker label="Icono" value={data.icon} onChange={(icon) => onUpdate({ icon })} />
            <div className="space-y-2">
                <Label>Texto del Lugar</Label>
                <Input value={data.text} onChange={(e) => onUpdate({ text: e.target.value })} />
            </div>
            <hr/>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Usar Imagen en vez de icono
            </Button>
            {data.imageUrl && (
                <Button variant="destructive" size="sm" onClick={() => onUpdate({ imageUrl: null })}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    );

    const renderButtonControls = (data: ButtonSectionData) => (
        <>
            <div className="space-y-2">
                <Label>Texto del Botón</Label>
                <Input value={data.text} onChange={(e) => onUpdate({ text: e.target.value })} />
            </div>
             <div className="space-y-2">
                <Label>Alineación</Label>
                <ToggleGroup 
                    type="single" 
                    defaultValue={data.alignment || 'center'}
                    onValueChange={(value: 'left' | 'center' | 'right') => {
                        if (value) onUpdate({ alignment: value });
                    }}
                    className="w-full grid grid-cols-3"
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
                </ToggleGroup>
            </div>
             <div className="space-y-2">
                <Label>Enlazar a</Label>
                 <Select value={data.linkTo || 'contact'} onValueChange={(val: 'contact' | 'location') => onUpdate({linkTo: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="contact">Sección de Contacto</SelectItem>
                        <SelectItem value="location">Sección de Ubicación</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );

    const renderControls = () => {
        switch (element.type) {
            case 'styledText':
            case 'draggableText':
                return renderTextControls(values, (key, value) => onUpdate({ [key]: value }));
            case 'sectionStyle':
                return renderSectionStyleControls(values, (key, value) => onUpdate({ [key]: value }));
            case 'amenity':
                return renderAmenityControls(values);
            case 'feature':
                return renderFeatureControls(values);
            case 'pricingTier':
                return renderPricingTierControls(values);
            case 'nearbyPlace':
                return renderNearbyPlaceControls(values);
            case 'button':
                return renderButtonControls(values);
            default:
                return <p className="text-sm text-muted-foreground">No hay opciones de edición para este elemento.</p>;
        }
    };

    return (
        <div data-editing-toolbar="true" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-80 bg-background border rounded-lg shadow-lg">
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

    // Debounce updates to avoid performance issues
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
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 w-8 p-0 border-2" style={{ backgroundColor: color }} />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Input
                            type="color"
                            value={color || '#000000'}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-16 h-10 p-1 border-none"
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    type="text"
                    value={color || ''}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8"
                />
            </div>
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
                            <span className="capitalize">{value ? value.replace(/-/g, ' ') : "Seleccionar Icono"}</span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                    <ScrollArea className="h-72">
                        <div className="p-2 grid grid-cols-5 gap-1">
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

    