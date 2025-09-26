import React, { useRef, useState, useEffect } from 'react';
import { ImageWithFeaturesSectionData, FeatureItem, StyledText } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { getDefaultTitle } from '../constants';
import { saveImage, deleteImage, getImageBlob } from '../services/geminiService';


const FeatureImage: React.FC<{ item: FeatureItem }> = ({ item }) => {
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            if (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:')) {
                setImageUrl(item.imageUrl);
            } else {
                const blob = await getImageBlob(item.imageUrl);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageUrl(objectUrl);
                }
            }
        };
        loadUrl();
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [item.imageUrl]);

    return <img src={imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg shadow-md" />;
};


interface ImageWithFeaturesSectionProps {
  data: ImageWithFeaturesSectionData;
  onUpdate: (newData: ImageWithFeaturesSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
}

const FeatureEditor: React.FC<{ 
    item: FeatureItem, 
    onUpdate: (updatedItem: FeatureItem) => void,
    onDelete: () => void,
}> = ({ item, onUpdate, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            const oldKey = item.imageUrl;
            const newKey = await saveImage(dataUrl);
            onUpdate({ ...item, imageUrl: newKey });
            await deleteImage(oldKey);
          };
          reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-100 relative group">
            <div className="flex-shrink-0 relative">
                <div className="w-16 h-16"><FeatureImage item={item} /></div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Cambiar imagen"
                >
                    <Icon name="pencil" className="w-5 h-5 text-white" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
            <div className="flex-grow">
                {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
                <EditableText
                    as="p"
                    isAdminMode={true}
                    value={{ text: item.title, color: '#1e293b', fontSize: 1, fontFamily: 'Roboto' }}
                    onChange={(newValue) => { if (newValue.text !== undefined) onUpdate({ ...item, title: newValue.text }); }}
                    className="font-bold text-slate-800"
                    inputClassName="font-bold text-slate-800 bg-transparent border-b -m-1 p-1"
                    onSelect={() => {}}
                    isSelected={false}
                />
                 {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
                 <EditableText
                    as="p"
                    isAdminMode={true}
                    value={{ text: item.subtitle, color: '#475569', fontSize: 0.875, fontFamily: 'Roboto' }}
                    onChange={(newValue) => { if (newValue.text !== undefined) onUpdate({ ...item, subtitle: newValue.text }); }}
                    className="text-sm text-gray-600"
                    inputClassName="text-sm text-gray-600 bg-transparent border-b -m-1 p-1 w-full"
                    onSelect={() => {}}
                    isSelected={false}
                />
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100" aria-label="Eliminar característica">
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );
};


export const ImageWithFeaturesSection: React.FC<ImageWithFeaturesSectionProps> = ({ data, onUpdate, onDelete, isAdminMode }) => {
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const [mediaUrl, setMediaUrl] = useState('');

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadMedia = async () => {
            const key = data.media.url;
            if (key.startsWith('http') || key.startsWith('data:')) {
                setMediaUrl(key);
            } else {
                const blob = await getImageBlob(key);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setMediaUrl(objectUrl);
                }
            }
        };
        loadMedia();
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [data.media.url]);

    const handleUpdateFeature = (updatedItem: FeatureItem) => {
        const newFeatures = data.features.map(f => f.id === updatedItem.id ? updatedItem : f);
        onUpdate({ ...data, features: newFeatures });
    };

    const handleDeleteFeature = async (id: string) => {
        const featureToDelete = data.features.find(f => f.id === id);
        const newFeatures = data.features.filter(f => f.id !== id);
        onUpdate({ ...data, features: newFeatures });
        if (featureToDelete) {
            await deleteImage(featureToDelete.imageUrl);
        }
    };
    
    const handleAddFeature = async () => {
        const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZDVlMCI+PHBhdGggZD0iTTE5IDNINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWNWgxNHYxNHptLTUuMDQtNi43MWwtMi4yNSAyLjI1LTEuMjUtMS4yNUw4IDE2aDhsLTMuMDQtNC43MXoiLz48L3N2Zz4=';
        const newFeature: FeatureItem = {
            id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            imageUrl: placeholderSvg,
            title: 'Nueva Característica',
            subtitle: 'Descripción de la característica',
        };
        onUpdate({ ...data, features: [...data.features, newFeature] });
    };

    const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                const newMediaType = file.type.startsWith('video/') ? 'video' : 'image';
                const oldKey = data.media.url;
                const newKey = await saveImage(dataUrl);
                onUpdate({
                    ...data,
                    media: {
                        type: newMediaType,
                        url: newKey,
                    }
                });
                await deleteImage(oldKey);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDeleteTitle = () => {
        const { title, ...restData } = data;
        onUpdate(restData as ImageWithFeaturesSectionData);
    };

    const handleAddTitle = () => {
        onUpdate({ ...data, title: getDefaultTitle('Descubre Más Sobre la Propiedad') });
    };

    const handleTitleChange = (changes: Partial<StyledText>) => {
        onUpdate({ ...data, title: { ...data.title!, ...changes } });
    };

  return (
    <section className="py-12 md:py-20 bg-white relative group/section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center relative group/titleContainer mb-8">
            {data.title ? (
                <>
                    <EditableText
                        as="h2"
                        isAdminMode={isAdminMode}
                        value={data.title}
                        onChange={handleTitleChange}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl group max-w-xs mx-auto w-full bg-gray-200">
             {mediaUrl && data.media.type === 'video' ? (
                <video
                    key={data.media.url}
                    className="w-full h-full object-cover"
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                />
             ) : mediaUrl && (
                <img
                    key={data.media.url}
                    className="w-full h-full object-cover"
                    src={mediaUrl}
                    alt="Imagen de la propiedad"
                />
             )}
             {isAdminMode && (
                <>
                    <button onClick={() => mediaInputRef.current?.click()} className="absolute top-2 right-2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Cambiar multimedia">
                        <Icon name="pencil" className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={mediaInputRef}
                        onChange={handleMediaFileChange}
                        accept="image/*,video/*"
                        className="hidden"
                    />
                </>
             )}
          </div>

          <div className="space-y-4">
             {isAdminMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.features.map(item => (
                        <FeatureEditor 
                            key={item.id}
                            item={item}
                            onUpdate={handleUpdateFeature}
                            onDelete={() => handleDeleteFeature(item.id)}
                        />
                    ))}
                     <button onClick={handleAddFeature} className="w-full p-2 border-2 border-dashed rounded-md text-slate-600 hover:bg-gray-100 hover:border-slate-400 sm:col-span-2">
                        <Icon name="plus" className="w-5 h-5 mx-auto" />
                    </button>
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                    {data.features.map(item => (
                        <div key={item.id} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                               <FeatureImage item={item} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                     {data.features.length === 0 && (
                        <p className="text-gray-500 sm:col-span-2 text-center">Aún no se han añadido características.</p>
                    )}
                </div>
             )}
          </div>

        </div>
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