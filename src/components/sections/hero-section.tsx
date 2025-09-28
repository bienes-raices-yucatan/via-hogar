'use client';
import { HeroSectionData, DraggableTextData } from '@/lib/types';
import { Trash2, Image as ImageIcon, PlusCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { saveImage, getImage } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { Slider } from '../ui/slider';

interface DraggableTextProps {
    data: DraggableTextData;
    sectionId: string;
    containerRef: React.RefObject<HTMLDivElement>;
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

    const style = {
        position: 'absolute' as const,
        left: `${data.position.x}%`,
        top: `${data.position.y}%`,
        transform: `translate(-50%, -50%) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
        color: data.color,
        fontSize: data.fontSize,
        fontFamily: data.fontFamily,
        zIndex: 20
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isAdminMode ? listeners : {})}
            {...(isAdminMode ? attributes : {})}
            className="group/text relative p-2"
        >
            <EditableText
                value={data.text}
                onChange={(val) => onUpdate({ text: val })}
                isAdminMode={isAdminMode}
                className="font-bold font-headline leading-tight"
                as="div"
                onSelect={onSelect}
            />
            {isAdminMode && (
                <button 
                    onClick={onDelete} 
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover/text:opacity-100"
                >
                    <Trash2 size={12}/>
                </button>
            )}
        </div>
    );
};


interface HeroSectionProps {
  data: HeroSectionData;
  updateSection: (sectionId: string, updatedData: Partial<HeroSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
  setSelectedElement: (element: any) => void;
  isFirstSection: boolean;
  isDraggingMode: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  data, 
  updateSection, 
  deleteSection, 
  isAdminMode, 
  setSelectedElement,
  isFirstSection,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundPosition, setBackgroundPosition] = useState('center');
  const [imageUrl, setImageUrl] = useState(data.imageUrl);

  useEffect(() => {
    const loadImage = async () => {
        if (data.imageKey) {
            const blob = await getImage(data.imageKey);
            if (blob) {
                const localUrl = URL.createObjectURL(blob);
                setImageUrl(localUrl);
                return () => URL.revokeObjectURL(localUrl);
            }
        } else {
            setImageUrl(data.imageUrl);
        }
    };
    loadImage();
  }, [data.imageKey, data.imageUrl]);

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
    const updatedTexts = data.draggableTexts.map(t => t.id === textId ? {...t, ...updates} : t);
    updateSection(data.id, { draggableTexts: updatedTexts });
  };
  
  const handleAddDraggableText = () => {
    const newText: DraggableTextData = {
        id: uuidv4(),
        text: 'Nuevo Texto',
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
        color: '#ffffff',
        fontFamily: 'Roboto',
        position: { x: 50, y: 50 }
    };
    const updatedTexts = [...data.draggableTexts, newText];
    updateSection(data.id, { draggableTexts: updatedTexts });
  };

  const handleDeleteDraggableText = (textId: string) => {
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
    if (file) {
        const key = `hero-${data.id}-${uuidv4()}`;
        await saveImage(key, file);
        updateSection(data.id, { imageKey: key, imageUrl: undefined });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  }
  
  const uploadId = `hero-image-upload-${data.id}`;

  const scrollToContact = () => {
    document.getElementById('section-contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  const containerHeight = data.height || '75vh';
  const containerBorderRadius = isFirstSection ? `0 0 ${data.borderRadius || '3rem'} ${data.borderRadius || '3rem'}` : (data.borderRadius || '3rem');

  return (
    <div 
      ref={sectionRef}
      data-section-id={data.id}
      className={cn(
        'relative group/section w-full bg-cover bg-center draggable-text-container',
        { 'mt-[-5rem]': isFirstSection }
      )}
      style={{ 
        height: containerHeight,
        borderRadius: containerBorderRadius,
        backgroundImage: `url(${imageUrl})`,
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
            containerRef={sectionRef}
            isAdminMode={isAdminMode}
            onSelect={createSelectHandler(text.id)}
            onUpdate={(updates) => handleDraggableTextUpdate(text.id, updates)}
            onDelete={() => handleDeleteDraggableText(text.id)}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          {data.buttonText && (
            <div className="absolute bottom-12">
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
        <div className="absolute top-20 right-4 opacity-100 sm:opacity-0 group-hover/section:opacity-100 transition-opacity flex flex-col gap-2 items-start bg-black/30 backdrop-blur-sm p-3 rounded-lg z-30 w-52">
          <input
              type="file"
              id={uploadId}
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*"
          />
          <div className="w-full space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`parallax-${data.id}`}
                checked={!!data.parallaxEnabled}
                onCheckedChange={(checked) => updateSection(data.id, { parallaxEnabled: checked })}
              />
              <Label htmlFor={`parallax-${data.id}`} className="text-white text-xs font-semibold">Parallax</Label>
            </div>
            <div className='space-y-1'>
                <Label className="text-white text-xs font-semibold">Altura ({parseInt(data.height || '0')}vh)</Label>
                <Slider
                    min={20}
                    max={100}
                    step={1}
                    value={[parseInt(data.height || '75')]}
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
        </div>
      )}
    </div>
  );
};

export default HeroSection;
