import React, { useRef, useState, useEffect } from 'react';
import { GallerySectionData, GalleryImage, StyledText } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { getDefaultTitle } from '../constants';
import { enhanceImageWithAI, saveImage, deleteImage, getImageBlob } from '../services/geminiService';
import { Spinner } from './Spinner';

interface GallerySectionProps {
  data: GallerySectionData;
  onUpdate: (newData: GallerySectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
}

// Sub-component to handle individual image loading and URL lifecycle
const GalleryImageDisplay: React.FC<{ image: GalleryImage; className?: string }> = ({ image, className }) => {
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            if (image.url.startsWith('http') || image.url.startsWith('data:')) {
                setImageUrl(image.url);
            } else {
                const blob = await getImageBlob(image.url);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageUrl(objectUrl);
                }
            }
        };
        loadUrl();
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [image.url]);
    
    if (!imageUrl) return <div className={`w-full h-full bg-gray-200 ${className}`}></div>

    return <img src={imageUrl} alt={image.title} className={className} />;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ data, onUpdate, onDelete, isAdminMode }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [enhancingImageId, setEnhancingImageId] = useState<string | null>(null);

  // Auto-scroll effect for the user-facing carousel
  useEffect(() => {
    if (isAdminMode || data.images.length <= 1 || isHovered) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % data.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAdminMode, data.images.length, isHovered]);

  const handleImageTitleChange = (imageId: string, newTitle: string) => {
    const newImages = data.images.map(img => img.id === imageId ? {...img, title: newTitle} : img);
    onUpdate({ ...data, images: newImages });
  };

  const handleDeleteTitle = () => {
    const { title, ...restData } = data;
    onUpdate(restData as GallerySectionData);
  };

  const handleAddTitle = () => {
    onUpdate({ ...data, title: getDefaultTitle('Galería de la Propiedad') });
  };

  // Carousel navigation
  const goToNext = () => {
    if (data.images.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % data.images.length);
  };
  const goToPrev = () => {
    if (data.images.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + data.images.length) % data.images.length);
  };

  // Scroll handler for admin mode
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        // FIX: Both errors on lines 105 and 109 are caused by TypeScript losing type
        // information for the 'file' parameter within this map callback. Explicitly
        // typing 'file' as 'File' resolves this, ensuring it's a valid Blob for readAsDataURL.
        const readPromises = filesArray.map((file: File) => {
            return new Promise<{ file: File, url: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({ file, url: reader.result as string });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readPromises).then(async (results) => {
            const newImages: GalleryImage[] = [];
            for (const result of results) {
                 const newKey = await saveImage(result.url);
                 newImages.push({
                    id: `img-${Date.now()}-${Math.random()}`,
                    url: newKey,
                    title: result.file.name.split('.').slice(0, -1).join('.') || 'Nuevo Título'
                 });
            }
            onUpdate({ 
                ...data, 
                images: [...data.images, ...newImages]
            });
        });
    }
  };

  const handleRemoveImage = async (id: string) => {
    const imageToRemove = data.images.find(img => img.id === id);
    const newImages = data.images.filter(img => img.id !== id);
    onUpdate({ ...data, images: newImages });
    if (imageToRemove) {
        await deleteImage(imageToRemove.url);
    }
  };
  
  const handleEnhanceImage = async (imageId: string, imageUrlKey: string) => {
    if (enhancingImageId) return;

    setEnhancingImageId(imageId);
    try {
        const blob = await getImageBlob(imageUrlKey);
        if (!blob) {
            throw new Error("La imagen original no se pudo encontrar para mejorarla.");
        }

        const imageDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const enhancedDataUrl = await enhanceImageWithAI(imageDataUrl);
        const newKey = await saveImage(enhancedDataUrl);
        const newImages = data.images.map(img => img.id === imageId ? { ...img, url: newKey } : img);
        onUpdate({ ...data, images: newImages });
        await deleteImage(imageUrlKey);
    } catch (error) {
        alert(error instanceof Error ? error.message : "Ocurrió un error al mejorar la imagen.");
    } finally {
        setEnhancingImageId(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedImageId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();
      if (!draggedImageId || draggedImageId === targetId) {
          setDraggedImageId(null);
          return;
      }

      const draggedIndex = data.images.findIndex(img => img.id === draggedImageId);
      const targetIndex = data.images.findIndex(img => img.id === targetId);

      if (draggedIndex > -1 && targetIndex > -1) {
          const newImages = [...data.images];
          const [draggedItem] = newImages.splice(draggedIndex, 1);
          newImages.splice(targetIndex, 0, draggedItem);
          onUpdate({ ...data, images: newImages });
      }
      setDraggedImageId(null);
  };

  const handleDragEnd = () => {
      setDraggedImageId(null);
  };

  const AdminView = () => (
    <div className="relative">
      <div ref={scrollContainerRef} className="flex space-x-2 overflow-x-auto p-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {data.images.map(img => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => handleDragStart(e, img.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, img.id)}
            onDragEnd={handleDragEnd}
            className={`flex-shrink-0 w-64 h-48 snap-start relative group rounded-lg overflow-hidden shadow-md transition-opacity ${draggedImageId === img.id ? 'opacity-50' : ''}`}
          >
            <GalleryImageDisplay image={img} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditableText
                as="p"
                isAdminMode
                value={{ text: img.title, color: '#FFFFFF', fontSize: 0.875, fontFamily: 'Roboto' }}
                onChange={(newValue) => { if (newValue.text !== undefined) handleImageTitleChange(img.id, newValue.text); }}
                className="text-white text-sm font-semibold"
                inputClassName="bg-transparent border-b text-white w-full"
                onSelect={() => {}}
                isSelected={false}
              />
            </div>
            {enhancingImageId === img.id ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"><Spinner /><p className="mt-1 text-xs">Mejorando...</p></div>
            ) : (
                <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEnhanceImage(img.id, img.url)} className="p-1.5 bg-white/80 rounded-full shadow-lg" title="Mejorar con IA"><Icon name="sparkles" className="w-4 h-4 text-slate-800" /></button>
                    <button onClick={() => handleRemoveImage(img.id)} className="p-1.5 bg-red-500/80 text-white rounded-full shadow-lg" title="Eliminar"><Icon name="x-mark" className="w-4 h-4" /></button>
                </div>
            )}
          </div>
        ))}
        <div className="flex-shrink-0 w-64 h-48 snap-start">
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-400">
                <Icon name="plus" className="w-8 h-8" />
                <span className="mt-2 text-sm">Añadir Imágenes</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAddImage} multiple accept="image/*" className="hidden"/>
        </div>
      </div>
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg ml-2 hidden md:block"><Icon name="chevron-left" /></button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg mr-2 hidden md:block"><Icon name="chevron-right" /></button>
    </div>
  );
  
  const UserView = () => (
    <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lg shadow-xl">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {data.images.map(img => (
            <div key={img.id} className="w-full flex-shrink-0 relative aspect-[16/9]">
              <GalleryImageDisplay image={img} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-bold text-lg">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
       {data.images.length > 1 && (
        <>
            <button onClick={goToPrev} className="absolute top-1/2 left-4 -translate-y-1/2 bg-slate-800 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900"><Icon name="chevron-left" className="w-6 h-6"/></button>
            <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-slate-800 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900"><Icon name="chevron-right" className="w-6 h-6"/></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                {data.images.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setCurrentIndex(index)} 
                        className={`rounded-full transition-all duration-300 ease-in-out ${
                            index === currentIndex 
                            ? 'w-3 h-3 bg-slate-800' 
                            : 'w-2 h-2 bg-gray-400 hover:bg-gray-500'
                        }`}
                        aria-label={`Ir a la imagen ${index + 1}`}
                    ></button>
                ))}
            </div>
        </>
       )}
    </div>
  );

  return (
    <section className="py-12 md:py-20 bg-gray-50 relative group/section" style={{ backgroundColor: data.style?.backgroundColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center relative group/titleContainer mb-8">
            {data.title ? (
                <>
                    <EditableText
                        as="h2"
                        isAdminMode={isAdminMode}
                        value={data.title}
                        onChange={(changes) => onUpdate({ ...data, title: { ...data.title!, ...changes } })}
                        className="text-3xl font-bold text-slate-800"
                        inputClassName="text-3xl font-bold text-center text-slate-800 bg-transparent border-b"
                        onSelect={() => {}}
                        isSelected={false}
                    />
                    {isAdminMode && (
                        <button 
                            onClick={handleDeleteTitle} 
                            className="absolute top-1/2 -translate-y-1/2 -right-8 bg-white p-1.5 rounded-full shadow text-red-500 opacity-0 group-hover/titleContainer:opacity-100 transition-opacity"
                            aria-label="Eliminar título"
                        >
                            <Icon name="trash" className="w-4 h-4" />
                        </button>
                    )}
                </>
            ) : (
                isAdminMode && (
                    <div className="h-12 flex items-center justify-center">
                        <button 
                            onClick={handleAddTitle} 
                            className="bg-gray-200 text-slate-600 px-3 py-1 rounded-md hover:bg-gray-300 text-sm font-medium flex items-center"
                        >
                            <Icon name="plus" className="w-4 h-4 mr-1" />
                            Añadir Título
                        </button>
                    </div>
                )
            )}
        </div>
        
        {data.images.length > 0 || isAdminMode ? (
            isAdminMode ? <AdminView /> : <UserView />
        ) : (
            <div className="text-center py-16">
                <h3 className="text-xl text-gray-600">No hay imágenes en la galería.</h3>
            </div>
        )}
      </div>
       {isAdminMode && (
        <button
          onClick={() => {
            onDelete(data.id);
          }}
          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-opacity"
          aria-label="Eliminar esta sección"
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
      )}
    </section>
  );
};