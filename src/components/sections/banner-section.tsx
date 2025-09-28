'use client';
import { BannerSectionData, DraggableTextData } from '@/lib/types';
import { Trash2, Image as ImageIcon, PlusCircle, GripVertical } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { Slider } from '../ui/slider';
import { db } from '@/lib/db';

interface DraggableTextProps {
    data: DraggableTextData;
    sectionId: string;
    isAdminMode: boolean;
    onSelect: () => void;
    onUpdate: (updatedText: Partial<DraggableTextData>) => void;
    onDelete: () => void;
}

const DraggableText: React.FC<DraggableTextProps> = ({ data, sectionId, isAdminMode, onSelect, onUpdate, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `text-${sectionId}-${data.id}`,
        disabled: !isAdminMode,
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${data.position.x}%`,
        top: `${data.position.y}%`,
        color: data.color,
        fontSize: `${data.fontSize}rem`,
        fontFamily: data.fontFamily,
        zIndex: 20,
        transform: `translate(-50%, -50%)`,
    };

    if (transform) {
      style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) translate(-50%, -50%)`;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group/text relative p-2"
        >
             <div 
              className="flex items-center gap-2"
            >
                <div 
                    {...listeners} 
                    {...attributes} 
                    className="cursor-grab text-white opacity-50 hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (isAdminMode) onSelect();
                    }}
                >
                    <GripVertical size={20} />
                </div>
                <div onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (isAdminMode) onSelect();
                  }}>
                    <EditableText
                        value={data.text}
                        onChange={(val) => onUpdate({ text: val })}
                        isAdminMode={isAdminMode}
                        className="font-bold font-headline leading-tight text-center"
                        as="div"
                        onSelect={onSelect}
                    />
                </div>
            </div>
            {isAdminMode && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }} 
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover/text:opacity-100"
                >
                    <Trash2 size={12}/>
                </button>
            )}
        </div>
    );
};

interface BannerSectionProps {
  data: BannerSectionData;
  isFirstSection: boolean;
  updateSection: (sectionId: string, updatedData: Partial<BannerSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
  setSelectedElement: (element: any) => void;
  isDraggingMode: boolean;
}

const BannerSection: React.FC<BannerSectionProps> = ({ 
  data,
  isFirstSection,
  updateSection, 
  deleteSection, 
  isAdminMode, 
  setSelectedElement,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundPosition, setBackgroundPosition] = useState('center');
  
  useEffect(() => {
    if (!data.parallaxEnabled || isAdminMode) {
      setBackgroundPosition('center');
      return;
    }

    let animationFrameId: number;

    const handleScroll = () => {
      if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top;
        const speed = 0.4;
        const newY = -(top * speed);
        
        animationFrameId = requestAnimationFrame(() => {
          setBackgroundPosition(`50% ${newY}px`);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [data.parallaxEnabled, isAdminMode]);

  const handleDraggableTextUpdate = (textId: string, updates: Partial<DraggableTextData>) => {
    if (!data.draggableTexts) return;
    const updatedTexts = data.draggableTexts.map(t => t.id === textId ? {...t, ...updates} : t);
    updateSection(data.id, { draggableTexts: updatedTexts });
  };
  
  const handleAddDraggableText = () => {
    const newText: DraggableTextData = {
        id: uuidv4(),
        text: 'Nuevo Texto',
        fontSize: 1.25,
        color: '#ffffff',
        fontFamily: 'Roboto',
        position: { x: 50, y: 50 }
    };
    const updatedTexts = [...(data.draggableTexts || []), newText];
    updateSection(data.id, { draggableTexts: updatedTexts });
  };

  const handleDeleteDraggableText = (textId: string) => {
    if (!data.draggableTexts) return;
    const updatedTexts = data.draggableTexts.filter(t => t.id !== textId);
    updateSection(data.id, { draggableTexts: updatedTexts });
  };
  
  const handleButtonTextUpdate = (value: string) => {
    updateSection(data.id, { buttonText: value });
  };
  
  const createSelectHandler = (textId: string) => () => {
      setSelectedElement({
          type: 'DRAGGABLE_TEXT',
          sectionId: data.id,
          textId: textId
      });
  };

  const handleFileChange = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    updateSection(data.id, { imageUrl: dataUrl });
    await db.setItem(`section-bg-${data.id}`, dataUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  }
  
  const uploadId = `banner-image-upload-${data.id}`;

  const scrollToContact = () => {
    document.getElementById('section-contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  const containerHeight = data.height || '50vh';
  const containerBorderRadius = isFirstSection ? `0 0 ${data.borderRadius || '3rem'} ${data.borderRadius || '3rem'}` : (data.borderRadius || '3rem');

  return (
    <div 
      ref={sectionRef}
      data-section-id={data.id}
      className={cn(
        'relative group/section w-full bg-cover bg-center draggable-text-container'
      )}
      style={{ 
        height: containerHeight,
        borderRadius: containerBorderRadius,
        backgroundImage: `url(${data.imageUrl})`,
        backgroundPosition: backgroundPosition,
        backgroundAttachment: data.parallaxEnabled && !isAdminMode ? 'fixed' : 'scroll',
        transition: 'background-position 0.1s ease-out',
        overflow: 'hidden'
      }}
    >
      <div 
        className="absolute inset-0 bg-black/30"
        style={{ borderRadius: containerBorderRadius }}
      ></div>
      
      {data.draggableTexts && data.draggableTexts.map(text => (
        <DraggableText 
            key={text.id}
            data={text}
            sectionId={data.id}
            isAdminMode={isAdminMode}
            onSelect={createSelectHandler(text.id)}
            onUpdate={(updates) => handleDraggableTextUpdate(text.id, updates)}
            onDelete={() => handleDeleteDraggableText(text.id)}
        />
      ))}
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        {data.buttonText && (
          <div className="absolute bottom-8">
            <Button size="lg" onClick={scrollToContact} className="bg-primary hover:bg-amber-600 text-slate-900 text-lg px-8 py-6 rounded-full font-bold">
                <EditableText
                    value={data.buttonText}
                    onChange={handleButtonTextUpdate}
                    isAdminMode={isAdminMode}
                />
            </Button>
          </div>
        )}
      </div>
      
      {isAdminMode && (
         <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 group-hover/section:opacity-100 transition-opacity flex flex-col gap-2 items-start bg-black/30 backdrop-blur-sm p-3 rounded-lg z-30 w-52">
          <div className="w-full space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`parallax-banner-${data.id}`}
                checked={!!data.parallaxEnabled}
                onCheckedChange={(checked) => updateSection(data.id, { parallaxEnabled: checked })}
              />
              <Label htmlFor={`parallax-banner-${data.id}`} className="text-white text-xs font-semibold">Parallax</Label>
            </div>
             <div className='space-y-1'>
                <Label className="text-white text-xs font-semibold">Altura ({parseInt(data.height || '0')}vh)</Label>
                <Slider
                    min={20}
                    max={100}
                    step={1}
                    value={[parseInt(data.height || '50')]}
                    onValueChange={([value]) => updateSection(data.id, { height: `${value}vh` })}
                />
            </div>
             <div className='space-y-1'>
                <Label className="text-white text-xs font-semibold">Curvatura ({parseInt(data.borderRadius || '0')}rem)</Label>
                <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    value={[parseFloat(data.borderRadius || '3')]}
                    onValueChange={([value]) => updateSection(data.id, { borderRadius: `${value}rem` })}
                />
            </div>
          </div>
          <div className="w-full flex justify-between items-center mt-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={handleAddDraggableText} title="Añadir Texto">
                <PlusCircle />
            </Button>
            <Label htmlFor={uploadId} className="cursor-pointer">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" as="span" title="Cambiar imagen de fondo">
                <ImageIcon />
              </Button>
            </Label>
            <Button size="icon" variant="destructive" onClick={() => deleteSection(data.id)}>
              <Trash2 />
            </Button>
          </div>
           <input
              type="file"
              id={uploadId}
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*"
          />
        </div>
      )}
    </div>
  );
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default BannerSection;

    