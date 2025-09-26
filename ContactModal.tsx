import React, { useState, useEffect } from 'react';
import { Property, ContactSubmission } from '../types';
import { Icon } from './Icon';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<ContactSubmission, 'id' | 'propertyId' | 'propertyName' | 'submittedAt'>) => void;
  property: Property;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit, property }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'broker' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep(1);
      setName('');
      setPhone('');
      setUserType(null);
      setError('');
    }
  }, [isOpen]);
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || phone.trim() === '') {
      setError('Por favor, completa ambos campos.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      setError('Por favor, selecciona una opción.');
      return;
    }
    onSubmit({ name, phone, userType });
    setStep(3); // Success step
  };
  
  if (!isOpen) return null;

  const renderStepOne = () => (
    <form onSubmit={handleNext}>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Contactar por {property.name}</h2>
      <p className="text-sm text-slate-600 mb-6">Déjanos tus datos y nos pondremos en contacto contigo.</p>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" required />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Número de teléfono</label>
          <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" required />
        </div>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>
       <div className="mt-6">
          <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Siguiente
          </button>
       </div>
    </form>
  );

  const renderStepTwo = () => (
    <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-6">
            <button type="button" onClick={() => setStep(1)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800">
                <Icon name="chevron-left" className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 text-center flex-grow">¿Te interesa la casa para ti o eres vendedor inmobiliario?</h2>
        </div>
      <div className="space-y-4">
         <label className={`relative block border rounded-lg p-4 cursor-pointer transition-all ${userType === 'buyer' ? 'border-slate-800 ring-2 ring-slate-800' : 'border-gray-300'}`}>
            <input type="radio" name="userType" value="buyer" checked={userType === 'buyer'} onChange={() => setUserType('buyer')} className="sr-only peer" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Me interesa para mi la casa</span>
              {userType === 'buyer' && (
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 text-white" strokeWidth={3}/>
                </span>
              )}
            </div>
         </label>
         <label className={`relative block border rounded-lg p-4 cursor-pointer transition-all ${userType === 'broker' ? 'border-slate-800 ring-2 ring-slate-800' : 'border-gray-300'}`}>
            <input type="radio" name="userType" value="broker" checked={userType === 'broker'} onChange={() => setUserType('broker')} className="sr-only peer" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Soy vendedor inmobiliario o Broker</span>
              {userType === 'broker' && (
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 text-white" strokeWidth={3}/>
                </span>
              )}
            </div>
         </label>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>
       <div className="mt-6">
          <button type="submit" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Enviar
          </button>
       </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">¡Información Enviada!</h3>
        <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
                Gracias por tu interés. Un asesor se pondrá en contacto contigo muy pronto.
            </p>
        </div>
        <div className="items-center px-4 py-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500">
                Cerrar
            </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderSuccessStep()}
      </div>
    </div>
  );
};