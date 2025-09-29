
'use client';
import { HeroSectionData, DraggableTextData, Property } from '@/lib/types';
import { Trash2, PlusCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import EditableText from '../editable-text';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import ResizableDraggableText from './resizable-draggable-text';

interface HeroSectionProps {
  data: HeroSectionData;
  property: Property;
  updateProperty: (updatedProperty: Property) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  isFirstSection: boolean;
  isDraggingMode: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  data, 
  property,
  updateProperty, 
  deleteSection, 
  isAdminMode, 
  selectedElement,
  setSelectedElement,
  isFirstSection,
  isDraggingMode,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
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

  const handleUpdate = (updates: Partial<HeroSectionData>) => {
    const updatedSections = property.sections.map(s => s.id === data.id ? {...s, ...updates} : s);
    updateProperty({ ...property, sections: updatedSections });
  }

  const handleDraggableTextUpdate = (textId: string, updates: Partial<DraggableTextData>) => {
    if (!data.draggableTexts) return;
    const updatedTexts = data.draggableTexts.map(t => t.id === textId ? {...t, ...updates} : t);
    handleUpdate({ draggableTexts: updatedTexts });
  };
  
  const handleAddDraggableText = () => {
    const newText: DraggableTextData = {
        id: uuidv4(),
        text: 'Nuevo Texto',
        fontSize: 1.25,
        color: '#ffffff',
        fontFamily: 'Roboto',
        position: { x: 50, y: 50 },
        width: 300,
        height: 50,
    };
    const updatedTexts = [...(data.draggableTexts || []), newText];
    handleUpdate({ draggableTexts: updatedTexts });
  };

  const handleDeleteDraggableText = (textId: string) => {
    if (!data.draggableTexts) return;
    const updatedTexts = data.draggableTexts.filter(t => t.id !== textId);
    handleUpdate({ draggableTexts: updatedTexts });
  };
  
  const handleButtonTextUpdate = (value: string) => {
    handleUpdate({ buttonText: value });
  };
  
  const createSelectHandler = (textId: string) => () => {
      setSelectedElement({
          type: 'DRAGGABLE_TEXT',
          sectionId: data.id,
          textId: textId
      });
  };

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
        backgroundImage: `url(${data.imageUrl})`,
        backgroundPosition: backgroundPosition,
        backgroundAttachment: data.parallaxEnabled && !isAdminMode ? 'fixed' : 'scroll',
        transition: 'background-position 0.1s ease-out',
        overflow: 'hidden'
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('draggable-text-container')) {
            setSelectedElement(null);
        }
      }}
    >
      <div 
        className="absolute inset-0 bg-black/30"
        style={{ borderRadius: containerBorderRadius }}
      ></div>
      
      {data.draggableTexts && data.draggableTexts.map(text => (
        <ResizableDraggableText
          key={text.id}
          data={text}
          sectionId={data.id}
          isAdminMode={isAdminMode}
          isDraggingMode={isDraggingMode}
          onSelect={createSelectHandler(text.id)}
          onUpdate={(updates) => handleDraggableTextUpdate(text.id, updates)}
          onLocalUpdate={(updates) => { /* No-op, managed by parent */}}
          onDelete={() => handleDeleteDraggableText(text.id)}
          isSelected={selectedElement?.type === 'DRAGGABLE_TEXT' && selectedElement?.textId === text.id}
          containerRef={sectionRef}
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
          
          <div className="w-full space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`parallax-${data.id}`}
                checked={!!data.parallaxEnabled}
                onCheckedChange={(checked) => handleUpdate({ parallaxEnabled: checked })}
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
                    onValueChange={([value]) => handleUpdate({ height: `${value}vh` })}
                />
            </div>
             <div className='space-y-1'>
                <Label className="text-white text-xs font-semibold">Curvatura ({parseInt(data.borderRadius || '0')}rem)</Label>
                <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    value={[parseFloat(data.borderRadius || '3')]}
                    onValueChange={([value]) => handleUpdate({ borderRadius: `${value}rem` })}
                />
            </div>
          </div>
          <div className="w-full flex justify-between items-center mt-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={handleAddDraggableText} title="Añadir Texto">
                <PlusCircle />
            </Button>
            <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); deleteSection(data.id);}}>
              <Trash2 />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
