'use client';
import { HeroSectionData, Property, DraggableTextData } from '@/lib/types';
import { Trash2, PlusCircle, Move } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import ConfirmationModal from '../modals/confirmation-modal';
import EditableText from '../editable-text';
import { v4 as uuidv4 } from 'uuid';

interface HeroSectionProps {
  data: HeroSectionData;
  property: Property;
  updateSection: (sectionId: string, updatedData: Partial<HeroSectionData>) => void;
  deleteSection: (sectionId: string) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, property, updateSection, deleteSection, isAdminMode, isDraggingMode, setSelectedElement }) => {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const dragItem = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTextUpdate = (textId: string, newText: Partial<DraggableTextData>) => {
    const texts = data.title.id === textId
        ? [{ ...data.title, ...newText }]
        : data.floatingTexts.map(t => t.id === textId ? { ...t, ...newText } : t);
    
    updateSection(data.id, { 
        title: texts.find(t => t.id === data.title.id) || data.title,
        floatingTexts: texts.filter(t => t.id !== data.title.id)
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DraggableTextData) => {
    dragItem.current = item;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!containerRef.current || !dragItem.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    handleTextUpdate(dragItem.current.id, { position: { x, y } });
    dragItem.current = null;
  };
  
  const addFloatingText = () => {
      const newText: DraggableTextData = {
          id: uuidv4(),
          text: "Nuevo Texto",
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Roboto',
          position: { x: 50, y: 70 }
      };
      updateSection(data.id, { floatingTexts: [...data.floatingTexts, newText] });
  }

  const allTexts = [data.title, ...data.floatingTexts];

  return (
    <div 
      ref={containerRef}
      className="relative group/section w-full h-[60vh] bg-cover bg-center" 
      style={{ backgroundImage: `url(${data.imageUrl})`, backgroundAttachment: data.useParallax ? 'fixed' : 'scroll' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      {allTexts.map(text => (
        <div
          key={text.id}
          draggable={isAdminMode && isDraggingMode}
          onDragStart={(e) => handleDragStart(e, text)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 
            ${isAdminMode && isDraggingMode ? 'cursor-move border-2 border-dashed border-primary' : ''}
            ${isAdminMode && !isDraggingMode ? 'hover:border-2 hover:border-dashed hover:border-amber-500' : ''}
          `}
          style={{ 
              left: `${text.position.x}%`, 
              top: `${text.position.y}%`,
              color: text.color,
              fontSize: text.fontSize,
              fontFamily: text.fontFamily,
            }}
        >
          <EditableText
            value={text.text}
            onChange={(newVal) => handleTextUpdate(text.id, { text: newVal })}
            isAdminMode={isAdminMode}
            className="font-bold text-center"
            as="div"
            isDraggable={true}
            isDragModeActive={isDraggingMode}
            onSelect={() => setSelectedElement({type: 'DRAGGABLE_TEXT', propertyId: property.id, sectionId: data.id, textId: text.id})}
          />
        </div>
      ))}
      
      {isAdminMode && (
        <>
          <div className="absolute top-2 right-2 opacity-0 group-hover/section:opacity-100 transition-opacity flex gap-2">
            <Button size="icon" variant="secondary" onClick={addFloatingText}><PlusCircle/></Button>
            <Button size="icon" variant="destructive" onClick={() => setIsConfirmOpen(true)}>
              <Trash2 />
            </Button>
          </div>
        </>
      )}
       <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => deleteSection(data.id)}
        title="Eliminar Sección"
        description="¿Estás seguro de que quieres eliminar esta sección? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default HeroSection;
