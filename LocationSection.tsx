


import React, { useState, useRef, useEffect } from 'react';
import { LocationSectionData, NearbyPlace, IconName, StyledText } from '../types';
import { EditableText } from './EditableText';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { generateNearbyPlaces, geocodeAddress, saveImage, deleteImage, getImageBlob } from '../services/geminiService';
import { Map } from './Map';
import { IconPicker } from './IconPicker';
import { getDefaultTitle } from '../constants';

interface LocationSectionProps {
  data: LocationSectionData;
  onUpdate: (newData: LocationSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
  propertyAddress: string;
}

const NearbyPlaceEditor: React.FC<{
    place: NearbyPlace,
    onUpdate: (updatedPlace: NearbyPlace) => void,
    onDelete: () => void,
}> = ({ place, onUpdate, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            const key = place.imageUrl;
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
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [place.imageUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                const oldKey = place.imageUrl;
                const newKey = await saveImage(dataUrl);
                onUpdate({ ...place, imageUrl: newKey });
                if (oldKey) await deleteImage(oldKey);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const oldKey = place.imageUrl;
        const { imageUrl, ...rest } = place;
        onUpdate(rest);
        if (oldKey) await deleteImage(oldKey);
    };
    
    const handleIconSelect = (iconName: IconName) => {
        const { imageUrl, ...rest } = place;
        onUpdate({ ...rest, icon: iconName });
        setIsIconPickerOpen(false);
    };

    return (
        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 group w-full">
            <div className="flex-shrink-0 relative">
                {imageUrl ? (
                    <div className="relative w-12 h-12">
                        <img src={imageUrl} alt="Punto de interés" className="w-full h-full object-cover rounded-md shadow" />
                        <button 
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Eliminar imagen"
                        >
                            <Icon name="x-mark" className="w-3 h-3"/>
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setIsIconPickerOpen(true)}
                            className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md hover:bg-gray-300"
                            aria-label="Cambiar icono"
                        >
                            <Icon name={place.icon} className="w-6 h-6 text-slate-600" />
                        </button>
                        {isIconPickerOpen && <IconPicker onSelect={handleIconSelect} onClose={() => setIsIconPickerOpen(false)} />}
                    </div>
                )}
            </div>

            <div className="flex-grow min-w-0">
                {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
                <EditableText
                    as="p"
                    isAdminMode={true}
                    value={{
                        text: place.text,
                        color: '#334155',
                        fontSize: 0.875,
                        fontFamily: 'Roboto',
                    }}
                    onChange={(newValue) => { if (newValue.text !== undefined) onUpdate({ ...place, text: newValue.text }); }}
                    className="text-sm text-slate-700"
                    inputClassName="text-sm text-slate-700 bg-transparent border-b -m-1 p-1 w-full"
                    onSelect={() => {}}
                    isSelected={false}
                />
            </div>
            
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title="Subir imagen"
                    aria-label="Subir imagen"
                >
                    <Icon name="pencil" className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-500 hover:text-red-700" title="Eliminar" aria-label="Eliminar punto de interés">
                    <Icon name="trash" className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


export const LocationSection: React.FC<LocationSectionProps> = ({ data, onUpdate, onDelete, isAdminMode, propertyAddress }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleDeleteTitle = () => {
    const { title, ...restData } = data;
    onUpdate(restData as LocationSectionData);
  };

  const handleAddTitle = () => {
    onUpdate({ ...data, title: getDefaultTitle('Ubicación y Alrededores') });
  };

  const handleTitleChange = (changes: Partial<StyledText>) => {
    onUpdate({ ...data, title: { ...data.title!, ...changes } });
  };

  const handleGeocode = async () => {
    setIsGeocoding(true);
    try {
        const coordinates = await geocodeAddress(propertyAddress);
        onUpdate({ ...data, coordinates });
    } catch (error) {
        alert(error instanceof Error ? error.message : "No se pudieron encontrar las coordenadas para la dirección proporcionada.");
    } finally {
        setIsGeocoding(false);
    }
  };

  const mapCategoryToIcon = (category: string): IconName => {
    switch (category.toLowerCase()) {
        case 'supermarket':
        case 'store':
            return 'store';
        case 'gym':
            return 'gym';
        case 'school':
            return 'school';
        case 'park':
            return 'park';
        case 'transport':
            return 'bus';
        default:
            return 'generic-feature';
    }
  };

  const handleGenerateNearby = async () => {
    setIsGenerating(true);
    try {
        const results = await generateNearbyPlaces(data.coordinates.lat, data.coordinates.lng);
        const newPlaces: NearbyPlace[] = results.map(place => ({
            id: `place-${Date.now()}-${Math.random()}`,
            icon: mapCategoryToIcon(place.category),
            text: place.description
        }));
        onUpdate({ ...data, nearbyPlaces: newPlaces });
    } catch (error) {
        alert(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleUpdatePlace = (updatedPlace: NearbyPlace) => {
    const newPlaces = data.nearbyPlaces.map(p => p.id === updatedPlace.id ? updatedPlace : p);
    onUpdate({ ...data, nearbyPlaces: newPlaces });
  };

  const handleDeletePlace = (id: string) => {
    const placeToDelete = data.nearbyPlaces.find(p => p.id === id);
    const newPlaces = data.nearbyPlaces.filter(p => p.id !== id);
    onUpdate({ ...data, nearbyPlaces: newPlaces });
    if (placeToDelete?.imageUrl) {
        deleteImage(placeToDelete.imageUrl);
    }
  };
  
  const handleAddPlace = () => {
    const newPlace: NearbyPlace = {
        id: `place-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        icon: 'generic-feature',
        text: 'Nuevo punto de interés'
    };
    onUpdate({ ...data, nearbyPlaces: [...data.nearbyPlaces, newPlace]});
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mt-8">
            <div className="sticky top-24 aspect-video lg:aspect-auto lg:h-[600px] rounded-lg overflow-hidden shadow-xl border">
                <Map coordinates={data.coordinates} />
            </div>

            <div>
                 {isAdminMode && (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">Ubicación de la Propiedad</h3>
                        <p className="text-sm text-slate-600 mb-1">Dirección actual: <span className="font-medium text-slate-800">{propertyAddress}</span></p>
                        <p className="text-sm text-slate-500">Coordenadas: Lat: {data.coordinates.lat.toFixed(4)}, Lng: {data.coordinates.lng.toFixed(4)}</p>
                        <button
                            onClick={handleGeocode}
                            disabled={isGeocoding}
                            className="mt-4 w-full bg-slate-800 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isGeocoding ? <Spinner/> : <Icon name="map-pin" className="w-4 h-4 mr-1.5"/>}
                            <span>{isGeocoding ? 'Buscando...' : 'Actualizar Coordenadas desde Dirección'}</span>
                        </button>
                    </div>
                 )}

                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                    {isAdminMode ? (
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-slate-800 mb-3">Editar Puntos de Interés Cercanos</h3>
                            {data.nearbyPlaces.map(place => (
                                <NearbyPlaceEditor 
                                key={place.id} 
                                place={place}
                                onUpdate={handleUpdatePlace}
                                onDelete={() => handleDeletePlace(place.id)}
                                />
                            ))}
                            <div className="flex items-center space-x-3 pt-3">
                                <button onClick={handleAddPlace} className="flex-1 p-2 border-2 border-dashed rounded-md text-slate-600 hover:bg-gray-100 hover:border-slate-400 text-sm flex items-center justify-center space-x-2">
                                    <Icon name="plus" className="w-4 h-4" />
                                    <span>Añadir Manualmente</span>
                                </button>
                                <button 
                                    onClick={handleGenerateNearby} 
                                    disabled={isGenerating}
                                    className="flex-1 p-2 border-2 border-amber-500 rounded-md text-amber-600 bg-amber-50 hover:bg-amber-100 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isGenerating ? <Spinner/> : <Icon name="sparkles" className="w-5 h-5" />}
                                    <span>{isGenerating ? 'Generando...' : 'Generar con IA'}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">¿Qué hay cerca?</h3>
                            <div className="space-y-4">
                            {data.nearbyPlaces.length > 0 ? data.nearbyPlaces.map(place => {
                                const [imageUrl, setImageUrl] = useState('');
                                useEffect(() => {
                                    let objectUrl: string | null = null;
                                    const loadUrl = async () => {
                                        const key = place.imageUrl;
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
                                        if (objectUrl) {
                                            URL.revokeObjectURL(objectUrl);
                                        }
                                    };
                                }, [place.imageUrl]);

                                return (
                                    <div key={place.id} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shadow-inner overflow-hidden">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={place.text} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon name={place.icon} className="w-8 h-8 text-slate-500"/>
                                            )}
                                        </div>
                                        <p className="text-slate-700 text-lg">{place.text}</p>
                                    </div>
                                )
                            }) : (
                                <p className="text-center text-gray-500 py-8">No hay puntos de interés cercanos para mostrar.</p>
                            )}
                            </div>
                        </div>
                    )}
                </div>
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