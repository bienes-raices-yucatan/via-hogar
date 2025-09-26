import React, { useRef, useState, useEffect } from 'react';
import { ContactSectionData, DraggableTextData, StyledText } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { SelectedElement } from '../App';
import { getDefaultSubtitle } from '../constants';
import { saveImage, deleteImage, getImageBlob } from '../services/geminiService';

type Guides = { vertical: number | null; horizontal: number | null };

interface ContactSectionProps {
  data: ContactSectionData;
  onUpdate: (newData: ContactSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (selection: SelectedElement | null) => void;
  onOpenContactForm: () => void;
  isDraggingMode: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ data, onUpdate, onDelete, isAdminMode, selectedElement, onSelectElement, onOpenContactForm, isDraggingMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeGuides, setActiveGuides] = useState<Guides>({ vertical: null, horizontal: null });
  const [backgroundUrl, setBackgroundUrl] = useState('');

  useEffect(() => {
    let objectUrl: string | null = null;
    const loadUrl = async () => {
        const key = data.backgroundImageUrl;
        if (key.startsWith('http') || key.startsWith('data:')) {
            setBackgroundUrl(key);
        } else {
            const blob = await getImageBlob(key);
            if (blob) {
                objectUrl = URL.createObjectURL(blob);
                setBackgroundUrl(objectUrl);
            }
        }
    };
    loadUrl();

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [data.backgroundImageUrl]);

  const handleAddText = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newText: DraggableTextData = {
        id: `text-${Date.now()}`, text: 'Nuevo Texto', fontSize: 1.5,
        color: '#FFFFFF', fontFamily: 'Roboto', position: { x: 50, y: 20 },
    };
    onUpdate({ ...data, floatingTexts: [...(data.floatingTexts || []), newText]});
  };

  const handleDeleteText = (textId: string) => {
    const newTexts = (data.floatingTexts || []).filter(t => t.id !== textId);
    onUpdate({ ...data, floatingTexts: newTexts });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const oldKey = data.backgroundImageUrl;
        const newKey = await saveImage(dataUrl);
        onUpdate({ ...data, backgroundImageUrl: newKey });
        await deleteImage(oldKey);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDeleteTitle = () => {
    const { title, ...rest } = data;
    onUpdate(rest as ContactSectionData);
  };
  const handleAddTitle = () => {
    onUpdate({ ...data, title: { text: '¿Te interesa esta propiedad?', fontSize: 2.5, color: '#FFFFFF', fontFamily: 'Montserrat' } });
  };
  const handleDeleteSubtitle = () => {
    const { subtitle, ...rest } = data;
    onUpdate(rest as ContactSectionData);
  };
  const handleAddSubtitle = () => {
    onUpdate({ ...data, subtitle: { text: 'Contáctanos para obtener más información o para agendar una visita. ¡Estamos listos para ayudarte!', fontSize: 1.25, color: '#E2E8F0', fontFamily: 'Roboto' } });
  };

  const sectionStyle: React.CSSProperties = {
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
    backgroundColor: '#334155', // slate-700
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };

  if (data.parallaxEffect && !isAdminMode) {
      sectionStyle.backgroundAttachment = 'fixed';
  }


  return (
    <section ref={containerRef} className="relative py-44 md:py-56 text-white group/section overflow-hidden" 
        style={sectionStyle}
        onClick={(e) => { if (e.target === e.currentTarget) onSelectElement(null); }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative group/titleContainer inline-block">
            {data.title ? (
                <>
                    <EditableText
                        value={data.title}
                        onChange={(changes) => onUpdate({ ...data, title: {...data.title, ...changes}})}
                        isAdminMode={isAdminMode} as="h2" className="font-bold mb-4"
                        onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title'})}
                        isSelected={selectedElement?.sectionId === data.id && selectedElement?.elementKey === 'title'}
                    />
                    {isAdminMode && <button onClick={handleDeleteTitle} className="absolute top-1/2 -right-8 -translate-y-1/2 p-1.5 bg-white/80 rounded-full text-red-500 opacity-0 group-hover/titleContainer:opacity-100"><Icon name="trash" className="w-4 h-4"/></button>}
                </>
            ) : isAdminMode && (
                <button onClick={handleAddTitle} className="bg-white/20 text-white px-3 py-1 rounded-md text-sm mb-4"><Icon name="plus" className="w-4 h-4 inline-block mr-1"/>Añadir Título</button>
            )}
        </div>
        
        <div className="relative group/titleContainer max-w-2xl mx-auto">
            {data.subtitle ? (
                <>
                    <EditableText
                        value={data.subtitle}
                        onChange={(changes) => onUpdate({ ...data, subtitle: {...data.subtitle, ...changes}})}
                        isAdminMode={isAdminMode} as="p" className="text-slate-200 mb-8"
                        onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'subtitle'})}
                        isSelected={selectedElement?.sectionId === data.id && selectedElement?.elementKey === 'subtitle'}
                    />
                    {isAdminMode && <button onClick={handleDeleteSubtitle} className="absolute top-1/2 -right-8 -translate-y-1/2 p-1.5 bg-white/80 rounded-full text-red-500 opacity-0 group-hover/titleContainer:opacity-100"><Icon name="trash" className="w-4 h-4"/></button>}
                </>
            ) : isAdminMode && (
                 <button onClick={handleAddSubtitle} className="bg-white/20 text-white px-3 py-1 rounded-md text-sm mb-8"><Icon name="plus" className="w-4 h-4 inline-block mr-1"/>Añadir Subtítulo</button>
            )}
        </div>

        {(data.floatingTexts || []).map(textItem => (
          <EditableText key={textItem.id} value={textItem}
              onChange={(changes) => onUpdate({ ...data, floatingTexts: data.floatingTexts!.map(t => t.id === textItem.id ? {...t, ...changes} : t)})}
              onDelete={() => handleDeleteText(textItem.id)}
              isAdminMode={isAdminMode} as="p" className="drop-shadow-md"
              onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'floatingTexts', subElementId: textItem.id })}
              isSelected={selectedElement?.subElementId === textItem.id}
              isDraggable={true} containerRef={containerRef}
              isDragModeActive={isDraggingMode}
              onDragMove={setActiveGuides}
              onDragEnd={() => setActiveGuides({ vertical: null, horizontal: null })}
          />
        ))}

        <button onClick={onOpenContactForm} className="inline-flex items-center justify-center px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105">
          Contáctanos
        </button>
      </div>

      {isAdminMode && (
        <>
           <div className="absolute top-4 left-4 flex flex-col items-start gap-y-2 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
                <div className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm">
                    <label className="font-medium cursor-pointer select-none" onClick={() => onUpdate({ ...data, parallaxEffect: !data.parallaxEffect })}>Efecto Parallax</label>
                    <div onClick={() => onUpdate({ ...data, parallaxEffect: !data.parallaxEffect })} className={`relative w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${data.parallaxEffect ? 'bg-amber-500' : 'bg-gray-300'}`} role="switch" aria-checked={!!data.parallaxEffect}>
                        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${data.parallaxEffect ? 'translate-x-5' : ''}`} />
                    </div>
                </div>
                 <button onClick={handleAddText} className="bg-white/80 backdrop-blur-sm text-slate-800 px-2 py-1 rounded-lg shadow-lg flex items-center space-x-1 text-sm font-medium hover:bg-white">
                  <Icon name="plus" className="w-4 h-4" />
                  <span>Añadir Texto</span>
               </button>
           </div>
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
              <button onClick={() => fileInputRef.current?.click()} className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg" aria-label="Cambiar imagen de fondo">
                <Icon name="pencil" className="w-5 h-5" />
              </button>
              <button onClick={() => { onDelete(data.id); }} className="bg-red-500 text-white p-2 rounded-full shadow-lg" aria-label="Eliminar esta sección">
                <Icon name="trash" className="w-5 h-5" />
              </button>
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
        </>
      )}
        {/* Render Guides */}
        {activeGuides.vertical !== null && (
            <div className="absolute top-0 bottom-0 bg-cyan-400/70 w-px pointer-events-none z-20" style={{ left: `${activeGuides.vertical}%`, transform: 'translateX(-50%)' }} />
        )}
        {activeGuides.horizontal !== null && (
            <div className="absolute left-0 right-0 bg-cyan-400/70 h-px pointer-events-none z-20" style={{ top: `${activeGuides.horizontal}%`, transform: 'translateY(-50%)' }} />
        )}
    </section>
  );
};