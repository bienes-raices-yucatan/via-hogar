import React, { useState } from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface NewPropertyModalProps {
  onClose: () => void;
  onCreate: (address: string) => Promise<void>;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({ onClose, onCreate }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Por favor, introduce una dirección.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onCreate(address);
      // The parent component will handle closing the modal on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Añadir Nueva Propiedad</h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1">
                <Icon name="x-mark" className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Introduce la dirección completa de la propiedad. Usaremos IA para encontrar su ubicación exacta en el mapa.
            </p>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="address"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Ej: Av. Paseo de la Reforma 222, Juárez, Ciudad de México"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-400 w-32"
            >
              {isLoading ? <Spinner /> : 'Crear Propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
