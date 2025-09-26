


import React, { useRef, useState, useEffect } from 'react';
import { AmenitiesSectionData, AmenityItem, IconName, StyledText } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { IconPicker } from './IconPicker';
import { getDefaultTitle } from '../constants';
import { saveImage, deleteImage, getImageBlob } from '../services/geminiService';


interface AmenitiesSectionProps {
  data: AmenitiesSectionData;
  onUpdate: (newData: AmenitiesSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
}

const AmenityEditor: React.FC<{
    item: AmenityItem,
    onUpdate: (updatedItem: AmenityItem) => void,
    onDelete: () => void,
}> = ({ item, onUpdate, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

     useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            const key = item.imageUrl;
            if (!key) {
                setImageUrl('');
                return;
            }
            if (key.startsWith('http') || key.startsWith('data:')) {
                setImageUrl(key);
            } else {
                const blob = await getImageBlob(key);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            const oldKey = item.imageUrl;
            const newKey = await saveImage(dataUrl);
            onUpdate({ ...item, imageUrl: newKey });
            if (oldKey) await deleteImage(oldKey);
          };
          reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const oldKey = item.imageUrl;
        const { imageUrl, ...rest } = item;
        onUpdate(rest);
        if (oldKey) await deleteImage(oldKey);
    };
    
    const handleIconSelect = async (iconName: IconName) => {
        const oldKey = item.imageUrl;
        onUpdate({ ...item, icon: iconName, imageUrl: undefined });
        setIsIconPickerOpen(false);
        if (oldKey) await deleteImage(oldKey);
    };

    // Fallback for potentially old data that doesn't have an icon
    const displayIcon = item.icon || 'generic-feature';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center justify-start text-center group relative h-full">
            <div className="relative w-12 h-12 mb-3">
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt={item.text} className="w-full h-full object-cover rounded-md shadow" />
                        <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={handleRemoveImage}
                                className="text-white p-1 bg-red-500/80 rounded-full"
                                aria-label="Eliminar imagen y usar icono"
                                title="Eliminar imagen y usar icono"
                            >
                                <Icon name="x-mark" className="w-4 h-4"/>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setIsIconPickerOpen(prev => !prev)}
                            className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200"
                            aria-label="Cambiar icono"
                        >
                            <Icon name={displayIcon} className="w-6 h-6 text-slate-600" />
                        </button>
                        {isIconPickerOpen && <IconPicker onSelect={handleIconSelect} onClose={() => setIsIconPickerOpen(false)} />}
                    </div>
                )}
            </div>
            <div className="flex-grow flex items-center w-full">
                 {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
                 <EditableText
                    as="p"
                    isAdminMode={true}
                    value={{
                        text: item.text,
                        color: '#334155',
                        fontSize: 0.875,
                        fontFamily: 'Roboto'
                    }}
                    onChange={(newValue) => { if (newValue.text !== undefined) onUpdate({ ...item, text: newValue.text }); }}
                    className="font-semibold text-slate-700 text-sm w-full"
                    inputClassName="font-semibold text-slate-700 bg-transparent border-b text-center w-full"
                    onSelect={() => {}}
                    isSelected={false}
                />
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-slate-500 bg-white rounded-full shadow hover:text-slate-800 hover:bg-gray-100"
                    title="Subir imagen"
                    aria-label="Subir imagen"
                >
                    <Icon name="pencil" className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-500 bg-white rounded-full shadow hover:text-red-700 hover:bg-gray-100" title="Eliminar" aria-label="Eliminar amenidad">
                    <Icon name="trash" className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ data, onUpdate, onDelete, isAdminMode }) => {
  
  const handleDeleteTitle = () => {
    const { title, ...restData } = data;
    onUpdate(restData as AmenitiesSectionData);
  };

  const handleAddTitle = () => {
    onUpdate({ ...data, title: getDefaultTitle('Amenidades Exclusivas') });
  };
  
  const handleTitleChange = (changes: Partial<StyledText>) => {
    onUpdate({ ...data, title: { ...data.title!, ...changes } });
  };

  const handleUpdateAmenity = (updatedItem: AmenityItem) => {
    const newAmenities = data.amenities.map(a => a.id === updatedItem.id ? updatedItem : a);
    onUpdate({ ...data, amenities: newAmenities });
  };

  const handleDeleteAmenity = (id: string) => {
    const amenityToDelete = data.amenities.find(a => a.id === id);
    const newAmenities = data.amenities.filter(a => a.id !== id);
    onUpdate({ ...data, amenities: newAmenities });
    if (amenityToDelete?.imageUrl) {
        deleteImage(amenityToDelete.imageUrl);
    }
  };

  const handleAddAmenity = () => {
    const newAmenity: AmenityItem = {
      id: `amenity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      icon: 'generic-feature',
      text: 'Nueva Amenidad',
    };
    onUpdate({ ...data, amenities: [...data.amenities, newAmenity] });
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50 relative group/section">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data.amenities.map(item => (
            isAdminMode ? (
                <AmenityEditor 
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdateAmenity}
                    onDelete={() => handleDeleteAmenity(item.id)}
                />
            ) : (
                 <AmenityViewer key={item.id} item={item} />
            )
          ))}
          {isAdminMode && (
            <button onClick={handleAddAmenity} className="w-full h-full min-h-[120px] p-2 border-2 border-dashed rounded-lg text-slate-500 hover:bg-white hover:border-slate-400 flex flex-col items-center justify-center">
                <Icon name="plus" className="w-8 h-8" />
                <span className="text-sm mt-1">Añadir</span>
            </button>
          )}
        </div>
         {data.amenities.length === 0 && !isAdminMode && (
            <p className="text-center text-gray-500 py-8">No hay amenidades para mostrar.</p>
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


const AmenityViewer: React.FC<{item: AmenityItem}> = ({ item }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            const key = item.imageUrl;
             if (!key) {
                setImageUrl('');
                return;
            }
            if (key.startsWith('http') || key.startsWith('data:')) {
                setImageUrl(key);
            } else {
                const blob = await getImageBlob(key);
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


    return (
        <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 mb-3 flex items-center justify-center">
                {imageUrl ? (
                   <img src={imageUrl} alt={item.text} className="w-full h-full object-cover rounded-md" />
                ) : (
                   <Icon name={item.icon || 'generic-feature'} className="w-8 h-8 text-slate-600" />
                )}
            </div>
            <p className="font-semibold text-slate-700 text-sm">{item.text}</p>
        </div>
    )
}