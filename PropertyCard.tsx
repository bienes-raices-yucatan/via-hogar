


import React, { useRef, useState, useEffect } from 'react';
import { Property } from '../types';
import { Icon } from './Icon';
import { EditableText } from './EditableText';
import { enhanceImageWithAI, saveImage, deleteImage, getImageBlob } from '../services/geminiService';
import { Spinner } from './Spinner';

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  onUpdate: (updatedProperty: Property) => void;
  onDelete: (id: string) => void;
  isAdminMode: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, onUpdate, onDelete, isAdminMode }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadUrl = async () => {
            const key = property.mainImageUrl;
            if (!key) {
                setImageUrl('');
                return;
            }
            if (key.startsWith('http') || key.startsWith('data:')) {
                setImageUrl(key);
            } else {
                try {
                    const blob = await getImageBlob(key);
                    if (blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    } else {
                        console.warn(`Image with key ${key} not found in DB.`);
                        setImageUrl(''); // Fallback for missing image
                    }
                } catch (error) {
                    console.error("Error loading image from DB", error);
                    setImageUrl('');
                }
            }
        };
        loadUrl();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [property.mainImageUrl]);

    const handleFieldChange = (field: keyof Property, value: string) => {
        onUpdate({ ...property, [field]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                const oldKey = property.mainImageUrl;
                try {
                    const newKey = await saveImage(dataUrl);
                    onUpdate({ ...property, mainImageUrl: newKey });
                    await deleteImage(oldKey);
                } catch (error) {
                    console.error("Failed to save new image and update property", error);
                    alert("No se pudo guardar la nueva imagen. Por favor, inténtalo de nuevo.");
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleEnhanceImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!imageUrl) {
            alert("No hay imagen para mejorar.");
            return;
        }
        setIsEnhancing(true);
        try {
            let imageDataUrlToEnhance = imageUrl;
            // If the URL is a blob URL from createObjectURL, we need to convert it to a data URL
            if (imageUrl.startsWith('blob:')) {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                imageDataUrlToEnhance = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }
    
            const enhancedDataUrl = await enhanceImageWithAI(imageDataUrlToEnhance);
            const oldKey = property.mainImageUrl;
            const newKey = await saveImage(enhancedDataUrl);
            onUpdate({ ...property, mainImageUrl: newKey });
            await deleteImage(oldKey);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Ocurrió un error al mejorar la imagen.");
        } finally {
            setIsEnhancing(false);
        }
    };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl">
      <div className="relative">
        <img 
            src={imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
            alt={property.name} 
            className="w-full h-56 object-cover bg-gray-200" 
        />
        {isEnhancing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 text-white">
                <Spinner />
                <p className="mt-2 text-xs">Mejorando imagen...</p>
            </div>
        )}
        {isAdminMode && (
          <>
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button
                    onClick={handleEnhanceImage}
                    disabled={isEnhancing || !imageUrl}
                    className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Mejorar imagen con IA"
                    title="Mejorar imagen con IA"
                >
                    <Icon name="sparkles" className="w-5 h-5" />
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg hover:bg-white"
                    aria-label="Cambiar imagen principal"
                    title="Cambiar imagen principal"
                >
                  <Icon name="pencil" className="w-5 h-5" />
                </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
        <EditableText
            as="h3"
            isAdminMode={isAdminMode}
            value={{ text: property.name, color: '#1e293b', fontSize: 1.25, fontFamily: 'Montserrat' }}
            onChange={(newValue) => { if (newValue.text !== undefined) handleFieldChange('name', newValue.text); }}
            className="text-xl font-bold text-slate-800"
            inputClassName="w-full text-xl font-bold text-slate-800 bg-transparent border-b"
            onSelect={() => {}}
            isSelected={false}
        />
        {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
        <EditableText
            as="p"
            isAdminMode={isAdminMode}
            value={{ text: property.address, color: '#4b5563', fontSize: 0.875, fontFamily: 'Roboto' }}
            onChange={(newValue) => { if (newValue.text !== undefined) handleFieldChange('address', newValue.text); }}
            className="text-sm text-gray-600 mt-1"
            inputClassName="w-full text-sm text-gray-600 bg-transparent border-b"
            onSelect={() => {}}
            isSelected={false}
        />
        <div className="mt-4 flex-grow">
             {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
             <EditableText
                as="p"
                isAdminMode={isAdminMode}
                value={{ text: property.price, color: '#d97706', fontSize: 1.125, fontFamily: 'Roboto' }}
                onChange={(newValue) => { if (newValue.text !== undefined) handleFieldChange('price', newValue.text); }}
                className="text-lg font-semibold text-amber-600"
                inputClassName="w-full text-lg font-semibold text-amber-600 bg-transparent border-b"
                onSelect={() => {}}
                isSelected={false}
            />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <button
                onClick={() => onSelect(property.id)}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
                Ver Detalles
            </button>
            {isAdminMode && (
                <button
                    onClick={() => onDelete(property.id)}
                    className="ml-2 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    aria-label="Eliminar propiedad"
                >
                    <Icon name="trash" className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};