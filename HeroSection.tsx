import React, { useRef, useState, useCallback, useEffect } from 'react';
import { HeroSectionData, DraggableTextData } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { SelectedElement } from '../App';
import { enhanceImageWithAI, saveImage, deleteImage, getImageBlob } from '../services/geminiService';
import { Spinner } from './Spinner';

type Guides = { vertical: number | null; horizontal: number | null };

interface HeroSectionProps {
  data: HeroSectionData;
  onUpdate: (newData: HeroSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  selectedElement: SelectedElement | null;
  onSelectElement: (selection: SelectedElement | null) => void;
  isDraggingMode: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, onUpdate, onDelete, isAdminMode, selectedElement, onSelectElement, isDraggingMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeGuides, setActiveGuides] = useState<Guides>({ vertical: null, horizontal: null });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

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

  const handleTextChange = (newTitleData: Partial<DraggableTextData>) => {
    onUpdate({ ...data, title: { ...data.title, ...newTitleData } });
  };
  
  const handleFloatingTextChange = (updatedText: DraggableTextData) => {
      const newTexts = (data.floatingTexts || []).map(t => t.id === updatedText.id ? updatedText : t);
      onUpdate({ ...data, floatingTexts: newTexts });
  };
  
  const handleAddText = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newText: DraggableTextData = {
        id: `text-${Date.now()}`,
        text: 'Nuevo Texto',
        fontSize: 1.5,
        color: '#FFFFFF',
        fontFamily: 'Roboto',
        position: { x: 50, y: 80 },
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

  const handleEnhanceImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!backgroundUrl) {
        alert("No hay imagen para mejorar.");
        return;
    }
    setIsEnhancing(true);
    try {
        let imageDataUrlToEnhance = backgroundUrl;
        if (backgroundUrl.startsWith('blob:')) {
            const response = await fetch(backgroundUrl);
            const blob = await response.blob();
            imageDataUrlToEnhance = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        
        const enhancedImageUrl = await enhanceImageWithAI(imageDataUrlToEnhance);
        const oldKey = data.backgroundImageUrl;
        const newKey = await saveImage(enhancedImageUrl);
        onUpdate({ ...data, backgroundImageUrl: newKey });
        await deleteImage(oldKey);
    } catch (error) {
        alert(error instanceof Error ? error.message : "Ocurrió un error al mejorar la imagen.");
    } finally {
        setIsEnhancing(false);
    }
  };

  const containerDivStyle: React.CSSProperties = {
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
    backgroundColor: '#e5e7eb', // gray-200
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };

  if (data.parallaxEffect && !isAdminMode) {
      containerDivStyle.backgroundAttachment = 'fixed';
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="relative h-[60vh] group overflow-hidden rounded-b-3xl shadow-xl" 
            style={containerDivStyle}
            onClick={(e) => { if (e.target === e.currentTarget) onSelectElement(null); }}>
        {isEnhancing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 text-white">
                <Spinner />
                <p className="mt-2 text-sm font-medium">Mejorando imagen con IA...</p>
            </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
            <EditableText
                value={data.title}
                onChange={handleTextChange}
                isAdminMode={isAdminMode}
                as="h1"
                className="font-extrabold text-white text-center drop-shadow-lg"
                onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'title' })}
                isSelected={selectedElement?.elementKey === 'title' && selectedElement?.sectionId === data.id}
                isDraggable={true}
                containerRef={containerRef}
                isDragModeActive={isDraggingMode}
                onDragMove={setActiveGuides}
                onDragEnd={() => setActiveGuides({ vertical: null, horizontal: null })}
            />

            {(data.floatingTexts || []).map(textItem => (
                <EditableText
                    key={textItem.id}
                    value={textItem}
                    onChange={(changes) => handleFloatingTextChange({ ...textItem, ...changes })}
                    onDelete={() => handleDeleteText(textItem.id)}
                    isAdminMode={isAdminMode}
                    as="p"
                    className="text-white drop-shadow-md"
                    onSelect={() => onSelectElement({ sectionId: data.id, elementKey: 'floatingTexts', subElementId: textItem.id })}
                    isSelected={selectedElement?.subElementId === textItem.id}
                    isDraggable={true}
                    containerRef={containerRef}
                    isDragModeActive={isDraggingMode}
                    onDragMove={setActiveGuides}
                    onDragEnd={() => setActiveGuides({ vertical: null, horizontal: null })}
                />
            ))}
        </div>
        {isAdminMode && (
            <>
            <div className="absolute top-4 left-4 flex flex-col items-start gap-y-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm">
                    <label className="font-medium cursor-pointer select-none" onClick={() => onUpdate({ ...data, parallaxEffect: !data.parallaxEffect })}>Efecto Parallax</label>
                    <div onClick={() => onUpdate({ ...data, parallaxEffect: !data.parallaxEffect })} className={`relative w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${data.parallaxEffect ? 'bg-amber-500' : 'bg-gray-300'}`} role="switch" aria-checked={!!data.parallaxEffect}>
                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${data.parallaxEffect ? 'translate-x-5' : ''}`} />
                    </div>
                </div>
                <button onClick={handleAddText} className="bg-white/80 backdrop-blur-sm text-slate-800 px-2 py-1 rounded-lg shadow-lg flex items-center space-x-1 text-sm font-medium hover:bg-white">
                    <Icon name="plus" className="w-4 h-4" />
                    <span>Añadir Texto</span>
                </button>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={handleEnhanceImage} disabled={isEnhancing || !backgroundUrl} className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Mejorar imagen con IA">
                    <Icon name="sparkles" className="w-5 h-5" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg" aria-label="Cambiar imagen del banner">
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
        </div>
    </div>
  );
};