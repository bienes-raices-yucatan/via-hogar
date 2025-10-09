
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icon } from './icon';
import { FontFamily, IconName, TextAlign, StyledText, DraggableTextData, FeatureItem, FontWeight, PageSectionStyle, AmenityItem, PricingTier, NearbyPlace, ButtonSectionData, ImageWithFeaturesSectionData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from 'lucide-react';

const allIcons: IconName[] = ['bed' , 'bath' , 'area' , 'map-pin' , 'school' , 'store' , 'bus' , 'sparkles' , 'x-mark' , 'chevron-down' , 'plus' , 'pencil' , 'trash' , 'nearby' , 'logo' , 'drag-handle' , 'chevron-left' , 'chevron-right' , 'copyright' , 'solar-panel' , 'parking' , 'laundry' , 'pool' , 'generic-feature' , 'street-view' , 'gym' , 'park' , 'whatsapp' , 'arrows-move' , 'check' , 'list', 'camera', 'upload', 'download', 'message-circle', 'grip-vertical'];

// Type definitions for what the toolbar can edit
type EditableElement = {
    type: 'styledText' | 'draggableText' | 'sectionStyle' | 'amenity' | 'feature' | 'pricingTier' | 'nearbyPlace' | 'button' | 'imageWithFeatures';
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
    { label: 'Display Condensada', value: 'Oswald' },
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
            const keyToUpdate = 'backgroundImageUrl';
            onUpdate({ [keyToUpdate]: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const renderTextControls = (data: StyledText | DraggableTextData) => {
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
    
    const renderSectionStyleControls = (data: PageSectionStyle) => (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Cambiar Imagen de Fondo
            </Button>
            <hr />
            <ColorPicker label="Color de Fondo" value={data.backgroundColor || '#FFFFFF'} onChange={(c) => handleChange('backgroundColor', c)} />
            <hr />
            <div className="space-y-2">
              <Label>Altura de la Sección ({(data.height || 80).toFixed(0)}vh)</Label>
              <Slider
                value={[data.height || 80]}
                onValueChange={(v) => handleChange('height', v[0])}
                min={20}
                max={100}
                step={1}
              />
            </div>
            <hr />
            <Label>Radio de las Esquinas (rem)</Label>
             <div className="grid grid-cols-2 gap-4">
                <SliderWithInput label="Sup. Izquierda" value={data.borderRadiusTopLeft} onValueChange={(val) => handleChange('borderRadiusTopLeft', val)} />
                <SliderWithInput label="Sup. Derecha" value={data.borderRadiusTopRight} onValueChange={(val) => handleChange('borderRadiusTopRight', val)} />
                <SliderWithInput label="Inf. Izquierda" value={data.borderRadiusBottomLeft} onValueChange={(val) => handleChange('borderRadiusBottomLeft', val)} />
                <SliderWithInput label="Inf. Derecha" value={data.borderRadiusBottomRight} onValueChange={(val) => handleChange('borderRadiusBottomRight', val)} />
            </div>
        </>
    );

    const renderImageWithFeaturesControls = (data: ImageWithFeaturesSectionData) => (
        <>
            <div className="space-y-2">
                <Label>Ancho de Media ({(data.mediaWidth || 50).toFixed(0)}%)</Label>
                <Slider
                    value={[data.mediaWidth || 50]}
                    onValueChange={(v) => handleChange('mediaWidth', v[0])}
                    min={20}
                    max={80}
                    step={1}
                />
            </div>
        </>
    );
    
    const renderAmenityControls = (data: AmenityItem) => (
        <>
            <IconPicker 
                label="Icono o Imagen" 
                value={data.icon} 
                imageUrl={data.imageUrl}
                onIconChange={(icon) => onUpdate({ icon, imageUrl: null })}
                onImageUpload={(newImageUrl) => onUpdate({ imageUrl: newImageUrl, icon: null })}
                onImageRemove={() => onUpdate({ imageUrl: null, icon: 'generic-feature' })}
            />
            <div className="space-y-2">
                <Label>Texto de la amenidad</Label>
                <Input value={data.text} onChange={(e) => onUpdate({ text: e.target.value })} />
            </div>
        </>
    );

    const renderFeatureControls = (data: FeatureItem) => {
        return (
            <>
                <IconPicker 
                    label="Icono o Imagen" 
                    value={data.icon} 
                    imageUrl={data.imageUrl}
                    onIconChange={(icon) => onUpdate({ icon, imageUrl: null })}
                    onImageUpload={(newImageUrl) => onUpdate({ imageUrl: newImageUrl, icon: null })}
                    onImageRemove={() => onUpdate({ imageUrl: null, icon: 'generic-feature' })}
                />
            </>
        );
    };


    const renderPricingTierControls = (data: PricingTier) => {
        const handleFileChangeForTier = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                onUpdate({ iconUrl: dataUrl });
            };
            reader.readAsDataURL(file);
        };
        
        return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChangeForTier} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Icon name="camera" className="mr-2" />
                Cambiar Imagen de Encabezado
            </Button>
            {data.iconUrl && (
                <Button variant="destructive" size="sm" onClick={() => onUpdate({ iconUrl: null })}>
                    <Icon name="trash" className="mr-2" />
                    Quitar Imagen
                </Button>
            )}
        </>
    )};

    const renderNearbyPlaceControls = (data: NearbyPlace) => (
        <>
            <IconPicker 
                label="Icono o Imagen" 
                value={data.icon} 
                imageUrl={data.imageUrl}
                onIconChange={(icon) => onUpdate({ icon, imageUrl: null })}
                onImageUpload={(newImageUrl) => onUpdate({ imageUrl: newImageUrl, icon: null })}
                onImageRemove={() => onUpdate({ imageUrl: null, icon: 'map-pin' })}
            />
            <div className="space-y-2">
                <Label>Título del Lugar</Label>
                <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Tiempo de Viaje</Label>
                <Input value={data.travelTime} onChange={(e) => onUpdate({ travelTime: e.target.value })} />
            </div>
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
                return renderTextControls(values);
            case 'sectionStyle':
                return renderSectionStyleControls(values);
            case 'imageWithFeatures':
                 return renderImageWithFeaturesControls(values);
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


const IconPicker: React.FC<{
    label: string;
    value: IconName | null;
    imageUrl?: string | null;
    onIconChange: (icon: IconName) => void;
    onImageUpload: (dataUrl: string) => void;
    onImageRemove: () => void;
}> = ({ label, value, imageUrl, onIconChange, onImageUpload, onImageRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onImageUpload(dataUrl);
        };
        reader.readAsDataURL(file);
    };
    
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <div className="flex items-center gap-2">
                            {imageUrl ? <img src={imageUrl} className="h-4 w-4 object-cover rounded-sm" alt="Custom icon" /> : value && <Icon name={value} className="h-4 w-4" />}
                            <span className="capitalize">{imageUrl ? "Imagen Personalizada" : (value ? value.replace(/-/g, ' ') : "Seleccionar")}</span>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-2 border-b grid grid-cols-2 gap-2">
                         <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Icon name="upload" className="mr-2" />
                            Cargar Imagen
                        </Button>
                        <Button variant="destructive" size="sm" onClick={onImageRemove} disabled={!imageUrl}>
                            <Icon name="trash" className="mr-2" />
                            Quitar Imagen
                        </Button>
                    </div>
                    <ScrollArea className="h-60">
                        <div className="p-2 grid grid-cols-6 gap-1">
                            {allIcons.map((icon) => (
                                <Button
                                    key={icon}
                                    variant={value === icon ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => onIconChange(icon)}
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

const SliderWithInput: React.FC<{
  label: string;
  value: number | undefined;
  onValueChange: (value: number) => void;
  max?: number;
  step?: number;
}> = ({ label, value = 0, onValueChange, max = 5, step = 0.1 }) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Slider
          value={[value]}
          onValueChange={(v) => onValueChange(v[0])}
          max={max}
          step={step}
          className="w-[60%]"
        />
        <Input
          type="number"
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className="w-[40%] h-8"
          max={max}
          step={step}
        />
      </div>
    </div>
  );
};

    
