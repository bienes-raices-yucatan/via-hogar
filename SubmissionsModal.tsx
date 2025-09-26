import React from 'react';
import { ContactSubmission } from '../types';
import { Icon } from './Icon';

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: ContactSubmission[];
}

export const SubmissionsModal: React.FC<SubmissionsModalProps> = ({ isOpen, onClose, submissions }) => {
  if (!isOpen) return null;
  
  const formatUserType = (type: 'buyer' | 'broker') => {
    return type === 'buyer' ? 'Comprador' : 'Broker / Inmobiliaria';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Contactos Recibidos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <Icon name="x-mark" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(sub => (
                <div key={sub.id} className="border rounded-lg p-4 bg-gray-50">
                   <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800">{sub.name}</p>
                            <a href={`tel:${sub.phone}`} className="text-sm text-slate-600 hover:text-amber-600 hover:underline">{sub.phone}</a>
                        </div>
                        <div className="text-right">
                           <p className={`text-xs font-semibold px-2 py-1 rounded-full ${sub.userType === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {formatUserType(sub.userType)}
                           </p>
                        </div>
                   </div>
                   <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-slate-500">
                            Propiedad: <span className="font-medium">{sub.propertyName}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                           Contactado el: <span className="font-medium">{formatDate(sub.submittedAt)}</span>
                        </p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg text-gray-600">No hay contactos para esta propiedad todavía.</h3>
              <p className="text-sm text-gray-500 mt-2">Cuando un cliente potencial llene el formulario, aparecerá aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
