import React from 'react';
import { Icon } from './Icon';
import { PageSection } from '../types';

interface AddSectionModalProps {
  onClose: () => void;
  onSelect: (sectionType: PageSection['type']) => void;
}

const sectionOptions: { type: PageSection['type']; name: string; description: string }[] = [
  { type: 'hero', name: 'Banner Principal', description: 'Una imagen grande con un título personalizable.' },
  { type: 'imageWithFeatures', name: 'Imagen y Características', description: 'Muestra una imagen o video junto a una lista de puntos clave.' },
  { type: 'gallery', name: 'Galería', description: 'Un carrusel de imágenes para mostrar la propiedad.' },
  { type: 'amenities', name: 'Amenidades', description: 'Una cuadrícula de iconos y texto para listar las comodidades.' },
  { type: 'pricing', name: 'Precios', description: 'Muestra diferentes planes o paquetes de precios.' },
  { type: 'location', name: 'Ubicación', description: 'Un mapa interactivo con puntos de interés cercanos.' },
  { type: 'contact', name: 'Contacto', description: 'Un fondo con un título, subtítulo y un botón de contacto.' },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Añadir Nueva Sección</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <Icon name="x-mark" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionOptions.map(option => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className="p-4 border rounded-lg text-left hover:bg-gray-50 hover:border-amber-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <h3 className="font-bold text-lg text-slate-800">{option.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};