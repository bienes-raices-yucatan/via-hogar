


import React from 'react';
import { PricingSectionData, PricingTier, StyledText } from '../types';
import { EditableText } from './EditableText';
import { Icon } from './Icon';
import { getDefaultTitle } from '../constants';

interface PricingSectionProps {
  data: PricingSectionData;
  onUpdate: (newData: PricingSectionData) => void;
  onDelete: (sectionId: string) => void;
  isAdminMode: boolean;
}

const TierEditor: React.FC<{
  tier: PricingTier;
  onUpdate: (updatedTier: PricingTier) => void;
  onDelete: () => void;
}> = ({ tier, onUpdate, onDelete }) => {
  
  const handleFeatureChange = (featureId: string, newText: string) => {
    const newFeatures = tier.features.map(f => f.id === featureId ? { ...f, text: newText } : f);
    onUpdate({ ...tier, features: newFeatures });
  };
  
  const handleAddFeature = () => {
    const newFeature = { id: `feat-${Date.now()}`, text: 'Nueva Característica' };
    onUpdate({ ...tier, features: [...tier.features, newFeature] });
  };
  
  const handleDeleteFeature = (featureId: string) => {
    const newFeatures = tier.features.filter(f => f.id !== featureId);
    onUpdate({ ...tier, features: newFeatures });
  };
  
  return (
    <div className={`p-6 rounded-lg shadow-lg border relative flex flex-col h-full ${tier.isFeatured ? 'border-amber-500 bg-white' : 'bg-gray-50'}`}>
        <div className="absolute top-2 right-2 flex items-center space-x-2">
            <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-600"><Icon name="trash" className="w-4 h-4" /></button>
            <label className="flex items-center space-x-1 cursor-pointer">
                <input type="checkbox" checked={tier.isFeatured} onChange={e => onUpdate({ ...tier, isFeatured: e.target.checked })} className="form-checkbox h-4 w-4 text-amber-600 rounded" />
                <span className="text-xs font-medium">Destacado</span>
            </label>
        </div>

        {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
        <EditableText as="h3" isAdminMode value={{ text: tier.name, color: '#1e293b', fontSize: 1.25, fontFamily: 'Roboto' }} onChange={newValue => { if (newValue.text !== undefined) onUpdate({ ...tier, name: newValue.text }); }} className="text-xl font-bold text-slate-800" inputClassName="text-xl font-bold w-full bg-transparent border-b" onSelect={() => {}} isSelected={false} />
        <div className="flex items-baseline mt-2">
            {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
            <EditableText as="span" isAdminMode value={{ text: tier.price, color: '#000', fontSize: 2.25, fontFamily: 'Roboto' }} onChange={newValue => { if (newValue.text !== undefined) onUpdate({ ...tier, price: newValue.text }); }} className="text-4xl font-extrabold" inputClassName="text-4xl font-extrabold w-24 bg-transparent border-b" onSelect={() => {}} isSelected={false} />
            {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
            <EditableText as="span" isAdminMode value={{ text: tier.frequency, color: '#64748b', fontSize: 1.125, fontFamily: 'Roboto' }} onChange={newValue => { if (newValue.text !== undefined) onUpdate({ ...tier, frequency: newValue.text }); }} className="ml-1 text-lg font-medium text-gray-500" inputClassName="text-lg w-full bg-transparent border-b" onSelect={() => {}} isSelected={false} />
        </div>

        <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-grow">
            {tier.features.map(feature => (
                <li key={feature.id} className="flex items-center group">
                    <Icon name="plus" className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
                    <EditableText as="span" isAdminMode value={{ text: feature.text, color: '#475569', fontSize: 0.875, fontFamily: 'Roboto' }} onChange={newValue => { if (newValue.text !== undefined) handleFeatureChange(feature.id, newValue.text); }} className="flex-grow" inputClassName="w-full bg-transparent border-b" onSelect={() => {}} isSelected={false} />
                    <button onClick={() => handleDeleteFeature(feature.id)} className="ml-2 text-red-400 opacity-0 group-hover:opacity-100"><Icon name="x-mark" className="w-3 h-3" /></button>
                </li>
            ))}
            <li><button onClick={handleAddFeature} className="text-sm text-amber-600 hover:underline mt-2">+ Añadir característica</button></li>
        </ul>

        <div className="mt-8">
            {/* Fix: Wrapped string value in a StyledText-like object and adapted onChange. */}
            <EditableText as="span" isAdminMode value={{ text: tier.buttonText, color: '#fff', fontSize: 1, fontFamily: 'Roboto' }} onChange={newValue => { if (newValue.text !== undefined) onUpdate({ ...tier, buttonText: newValue.text }); }} className="block w-full text-center p-3 rounded-lg font-semibold bg-slate-800 text-white" inputClassName="w-full bg-slate-900 text-center" onSelect={() => {}} isSelected={false} />
        </div>
    </div>
  );
};


export const PricingSection: React.FC<PricingSectionProps> = ({ data, onUpdate, onDelete, isAdminMode }) => {

  const handleDeleteTitle = () => {
    const { title, ...restData } = data;
    onUpdate(restData as PricingSectionData);
  };

  const handleAddTitle = () => {
    onUpdate({ ...data, title: getDefaultTitle('Opciones de Precios') });
  };
  
  const handleTitleChange = (changes: Partial<StyledText>) => {
    onUpdate({ ...data, title: { ...data.title!, ...changes } });
  };
  
  const handleUpdateTier = (updatedTier: PricingTier) => {
    const newTiers = data.tiers.map(t => t.id === updatedTier.id ? updatedTier : t);
    onUpdate({ ...data, tiers: newTiers });
  };
  
  const handleDeleteTier = (tierId: string) => {
    const newTiers = data.tiers.filter(t => t.id !== tierId);
    onUpdate({ ...data, tiers: newTiers });
  };

  const handleAddTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      name: 'Nuevo Plan',
      price: '0',
      frequency: '/mes',
      features: [{id: 'f1', text:'Característica'}],
      buttonText: 'Elegir Plan',
      isFeatured: false,
    };
    onUpdate({ ...data, tiers: [...data.tiers, newTier] });
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50 relative group/section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center relative group/titleContainer mb-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {data.tiers.map(tier => (
            isAdminMode ? (
              <TierEditor key={tier.id} tier={tier} onUpdate={handleUpdateTier} onDelete={() => handleDeleteTier(tier.id)} />
            ) : (
              <div key={tier.id} className={`p-8 rounded-lg shadow-lg flex flex-col ${tier.isFeatured ? 'bg-white border-2 border-amber-500 transform scale-105 z-10' : 'bg-white border'}`}>
                 {tier.isFeatured && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Más Popular</div>}
                <h3 className="text-2xl font-bold text-slate-800">{tier.name}</h3>
                <div className="flex items-baseline mt-4">
                  <span className="text-5xl font-extrabold tracking-tight">${tier.price}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">{tier.frequency}</span>
                </div>
                <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
                  {tier.features.map(feature => (
                    <li key={feature.id} className="flex items-start">
                      <Icon name="plus" className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-1" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className={`mt-8 block w-full text-center p-3 rounded-lg font-semibold transition-colors ${tier.isFeatured ? 'bg-amber-500 text-slate-900 hover:bg-amber-600' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
                  {tier.buttonText}
                </a>
              </div>
            )
          ))}
          {isAdminMode && (
            <button onClick={handleAddTier} className="w-full min-h-[200px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-400 hover:bg-white">
              <Icon name="plus" className="w-8 h-8" />
              <span className="mt-2">Añadir Plan</span>
            </button>
          )}
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