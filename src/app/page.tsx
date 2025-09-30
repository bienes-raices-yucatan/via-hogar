
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Import all types
import { 
    Property, 
    AnySectionData, 
    HeroSectionData, 
    ImageWithFeaturesSectionData,
    GallerySectionData,
    AmenitiesSectionData,
    ContactSectionData,
    LocationSectionData,
    PricingSectionData,
    NearbyPlace,
    ContactSubmission,
    SelectedElement,
    StyledText,
    DraggableTextData,
    IconName,
    AmenityItem,
    FeatureItem,
    TextAlign,
    PricingTier,
    FontWeight,
    PageSectionStyle
} from '@/lib/types';

// Import constants
import { 
    INITIAL_PROPERTIES_DATA, 
    INITIAL_SUBMISSIONS_DATA, 
    createNewProperty, 
    createSectionData 
} from '@/lib/constants';

// Import services
import { geocodeAddress, generateNearbyPlaces } from '@/ai/gemini-service';
import { initDB, saveImage, exportData, importData } from '@/lib/storage';

// Import all components
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyList } from '@/components/property-list';
import { NewPropertyModal } from '@/components/new-property-modal';
import { AdminLoginModal } from '@/components/admin-login-modal';
import { HeroSection } from '@/components/sections/hero-section';
import { ImageWithFeaturesSection } from '@/components/sections/image-with-features-section';
import { GallerySection } from '@/components/sections/gallery-section';
import { AmenitiesSection } from '@/components/sections/amenities-section';
import { ContactSection } from '@/components/sections/contact-section';
import { LocationSection } from '@/components/sections/location-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { AddSectionControl } from '@/components/add-section-control';
import { AddSectionModal } from '@/components/add-section-modal';
import { AdminToolbar } from '@/components/admin-toolbar';
import { EditingToolbar } from '@/components/editing-toolbar';
import { ContactModal } from '@/components/contact-modal';
import { SubmissionsModal } from '@/components/submissions-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DraggableEditableText } from '@/components/draggable-editable-text';
import { useToast } from '@/hooks/use-toast';

// Type for the state that tracks the currently selected element for editing
type SelectedElementForToolbar = {
    type: 'styledText' | 'draggableText' | 'sectionStyle' | 'amenity' | 'feature' | 'pricingTier' | 'nearbyPlace';
    data: Partial<StyledText & DraggableTextData & PageSectionStyle & AmenityItem & FeatureItem & PricingTier & NearbyPlace>;
};

export default function Home() {
  // --- State Management ---
  const [properties, setProperties] = useState<Property[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedIdsForExport, setSelectedIdsForExport] = useState<Set<string>>(new Set());

  // --- Modal State ---
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [confirmationModalState, setConfirmationModalState] = useState<{isOpen: boolean; onConfirm: () => void; title: string; message: string}>({isOpen: false, onConfirm: () => {}, title: '', message: ''});


  // --- UI Editing State ---
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [siteName, setSiteName] = useState('Vía Hogar');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const { toast } = useToast();

  // Derived state for the currently selected property
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // --- Effects ---
  useEffect(() => {
    const loadFromStorage = async () => {
        await initDB();
        
        try {
            const savedProps = localStorage.getItem('propertiesData');
            if (savedProps) {
                const parsedProps: Property[] = JSON.parse(savedProps);
                setProperties(parsedProps);
            } else {
                setProperties([]); // Start with empty if nothing is saved
            }

            const savedSubmissions = localStorage.getItem('submissionsData');
            setSubmissions(savedSubmissions ? JSON.parse(savedSubmissions) : []);

            const savedSiteName = localStorage.getItem('siteName');
            if (savedSiteName) setSiteName(savedSiteName);

            const savedLogo = localStorage.getItem('customLogo');
            if (savedLogo) setCustomLogo(savedLogo);

        } catch (error) {
            console.error("Failed to parse data from localStorage, starting fresh.", error);
            setProperties([]);
            setSubmissions([]);
        }

        const savedSelectedPropId = sessionStorage.getItem('selectedPropertyId');
        if(savedSelectedPropId) setSelectedPropertyId(savedSelectedPropId);
    }
    
    loadFromStorage();
  }, []);

  // Persist data to localStorage
  useEffect(() => { 
    if (properties && properties.length > 0) {
        localStorage.setItem('propertiesData', JSON.stringify(properties)); 
    } else {
        localStorage.removeItem('propertiesData');
    }
  }, [properties]);
  useEffect(() => { 
      if (submissions.length > 0) {
          localStorage.setItem('submissionsData', JSON.stringify(submissions)); 
      }
  }, [submissions]);
  useEffect(() => { localStorage.setItem('siteName', siteName); }, [siteName]);
  useEffect(() => {
    if (customLogo) {
        localStorage.setItem('customLogo', customLogo);
    } else {
        localStorage.removeItem('customLogo');
    }
  }, [customLogo]);
  
  useEffect(() => {
    if (selectedPropertyId) {
        sessionStorage.setItem('selectedPropertyId', selectedPropertyId);
    } else {
        sessionStorage.removeItem('selectedPropertyId');
    }
  }, [selectedPropertyId]);
  
  // Deselect element when admin mode is turned off
  useEffect(() => {
      if (!isAdminMode) {
          setSelectedElement(null);
          setIsDraggingMode(false);
          setSelectedIdsForExport(new Set());
      }
  }, [isAdminMode]);
  
  // Global click listener to deselect elements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isAdminMode && selectedElement) {
            const target = event.target as HTMLElement;
            if (!target.closest('[class*="outline-dashed"], [class*="ring-primary"], [class*="brightness-90"], [data-radix-popper-content-wrapper], .fixed')) {
                 setSelectedElement(null);
            }
        }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isAdminMode, selectedElement]);
  

  // --- Data Update Handlers ---
  const handleUpdateProperty = useCallback((updatedProperty: Property) => {
    setProperties(prev => prev.map(p => (p.id === updatedProperty.id ? updatedProperty : p)));
  }, []);

  const handleUpdateSection = useCallback((sectionId: string, updatedData: Partial<AnySectionData>) => {
    if (!selectedProperty) return;
    const newSections = selectedProperty.sections.map(s => s.id === sectionId ? { ...s, ...updatedData } : s);
    handleUpdateProperty({ ...selectedProperty, sections: newSections });
  }, [selectedProperty, handleUpdateProperty]);
  
  const handleAddSection = useCallback(async (type: AnySectionData['type'], index: number) => {
    if (!selectedProperty) return;
    const uniqueSuffix = `${Date.now()}`;
    
    // Simulate placeholder data for now
    const coordinates = { lat: 19.4326, lng: -99.1332 };
    const nearbyPlaces: NearbyPlace[] = [];

    const newSection = createSectionData(type, uniqueSuffix, {
      coordinates: coordinates,
      nearbyPlaces: nearbyPlaces,
    });

    const newSections = [...selectedProperty.sections];
    newSections.splice(index, 0, newSection);
    handleUpdateProperty({ ...selectedProperty, sections: newSections });
    setIsAddSectionModalOpen({ open: false, index: 0 });
  }, [selectedProperty, handleUpdateProperty]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!selectedProperty) return;
    
    setConfirmationModalState({
        isOpen: true,
        title: 'Eliminar Sección',
        message: '¿Estás seguro de que quieres eliminar esta sección? Esta acción no se puede deshacer.',
        onConfirm: () => {
            const newSections = selectedProperty.sections.filter(s => s.id !== sectionId);
            handleUpdateProperty({ ...selectedProperty, sections: newSections });
            setConfirmationModalState({isOpen: false, onConfirm: () => {}, title: '', message: ''});
        }
    });
  }, [selectedProperty, handleUpdateProperty]);
  
  const handleReorderSections = (dragIndex: number, hoverIndex: number) => {
      if (!selectedProperty) return;
      const draggedSection = selectedProperty.sections[dragIndex];
      const newSections = [...selectedProperty.sections];
      newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedSection);
      handleUpdateProperty({ ...selectedProperty, sections: newSections });
  };
  
    const handleUpdateAddress = useCallback(async (newAddress: string) => {
        if (!selectedProperty) return;
        
        toast({ title: "Actualizando ubicación...", description: "Geolocalizando la nueva dirección." });
        
        try {
            const newCoords = await geocodeAddress(newAddress);
            
            // Find the location section and update its coordinates
            const newSections = selectedProperty.sections.map(section => {
                if (section.type === 'location') {
                    return { ...section, coordinates: newCoords };
                }
                return section;
            });

            // Update the property with the new address and sections
            const updatedProperty = { ...selectedProperty, address: newAddress, sections: newSections };
            handleUpdateProperty(updatedProperty);
            
            toast({ title: "¡Ubicación actualizada!", description: "El mapa ahora muestra la nueva dirección.", variant: "default" });

        } catch (error) {
            console.error("Failed to geocode address:", error);
            toast({ title: "Error al actualizar", description: "No se pudo encontrar la dirección. Inténtalo de nuevo.", variant: "destructive" });
        }

    }, [selectedProperty, handleUpdateProperty, toast]);


  // --- Property Management Handlers ---
  const handleAddProperty = () => {
      const address = "Dirección no especificada";
      const coordinates = { lat: 19.4326, lng: -99.1332 }; // Default coords
      const nearbyPlaces: NearbyPlace[] = []; // Empty for now

      const newProp = createNewProperty(address, coordinates, nearbyPlaces);
      newProp.name = "Nueva Propiedad";
      setProperties(prev => [...prev, newProp]);
      setSelectedPropertyId(newProp.id); // Navigate to the new property
  };
  
  const handleDeleteProperty = (id: string) => {
     setConfirmationModalState({
        isOpen: true,
        title: 'Eliminar Propiedad',
        message: '¿Estás seguro de que quieres eliminar esta propiedad? Todos sus datos se perderán permanentemente.',
        onConfirm: () => {
             setProperties(prev => {
                const newProps = prev.filter(p => p.id !== id);
                if (newProps.length === 0) {
                    localStorage.removeItem('propertiesData');
                }
                return newProps;
             });
             if (selectedPropertyId === id) {
                setSelectedPropertyId(null);
             }
             closeConfirmationModal();
        }
    });
  };

  const handleTogglePropertySelectionForExport = (propertyId: string) => {
    setSelectedIdsForExport(prev => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
            newSet.delete(propertyId);
        } else {
            newSet.add(propertyId);
        }
        return newSet;
    });
};

const handleToggleAllPropertiesForExport = () => {
    if (selectedIdsForExport.size === properties.length) {
        setSelectedIdsForExport(new Set());
    } else {
        setSelectedIdsForExport(new Set(properties.map(p => p.id)));
    }
};


  // --- Admin & Login Handlers ---
  const handleAdminLogin = (user: string, pass: string): boolean => {
    if (user === 'Admin' && pass === 'Aguilar1') {
      setIsAdminMode(true);
      setIsAdminLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const handleContactSubmit = (formData: Omit<ContactSubmission, 'id' | 'propertyId' | 'propertyName' | 'submittedAt'>) => {
    if (!selectedProperty) return;
    const newSubmission: ContactSubmission = {
      ...formData,
      id: `sub-${Date.now()}`,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(prev => [...prev, newSubmission]);
  };
  
  const getSubmissionsForCurrentProperty = () => {
      return submissions.filter(sub => sub.propertyId === selectedPropertyId);
  };
  
    // --- Import/Export Handlers ---
    const handleExport = async () => {
        try {
            const propertiesToExport = selectedIdsForExport.size > 0
                ? properties.filter(p => selectedIdsForExport.has(p.id))
                : properties;

            if (propertiesToExport.length === 0) {
                toast({ title: "No hay propiedades seleccionadas", description: "Por favor, selecciona al menos una propiedad para guardar.", variant: "destructive" });
                return;
            }

            toast({ title: "Guardando...", description: `Recopilando datos de ${propertiesToExport.length} propiedades.` });
            
            const jsonString = await exportData(propertiesToExport, submissions, siteName, customLogo);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "via-hogar-backup.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({ title: "¡Exportación Completa!", description: "El archivo de respaldo se ha descargado." });
        } catch (error) {
            console.error("Export failed:", error);
            toast({ title: "Error de Exportación", description: String(error), variant: "destructive" });
        }
    };

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonString = event.target?.result as string;
                if (!jsonString) {
                    throw new Error("El archivo está vacío.");
                }
                toast({ title: "Importando...", description: "Restaurando propiedades e imágenes." });
                const { properties, submissions, siteName, customLogo } = await importData(jsonString);

                // This logic forces a re-render of all image components
                // by temporarily setting properties to an empty array.
                setProperties([]);
                setSubmissions([]);
                
                setTimeout(() => {
                    setProperties(properties);
                    setSubmissions(submissions || []);
                    setSiteName(siteName || 'Vía Hogar');
                    setCustomLogo(customLogo || null);
                    setSelectedPropertyId(null); // Go back to property list
                    toast({ title: "¡Importación Completa!", description: "Los datos han sido restaurados exitosamente." });
                }, 100);


            } catch (error) {
                console.error("Import failed:", error);
                toast({ title: "Error de Importación", description: String(error), variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

  // --- Toolbar Logic ---
    const selectedElementForToolbar: SelectedElementForToolbar | null = useMemo(() => {
        if (!selectedElement || !selectedProperty) return null;

        const { sectionId, elementKey, subElementId, property } = selectedElement;
        const section = selectedProperty.sections.find(s => s.id === sectionId);
        if (!section) return null;

        if (elementKey === 'style' || elementKey === 'backgroundImageUrl') {
            return { type: 'sectionStyle', data: section.style || {} };
        }
        
        let data: any;

        if (elementKey === 'floatingTexts' && subElementId && 'floatingTexts' in section && section.floatingTexts) {
            data = section.floatingTexts.find(t => t.id === subElementId);
        } else if (elementKey === 'title' && 'title' in section) {
            data = section.title;
        } else if (elementKey === 'subtitle' && 'subtitle' in section) {
            data = section.subtitle;
        } else if (elementKey === 'amenities' && subElementId && 'amenities' in section && section.amenities) {
            data = section.amenities.find(a => a.id === subElementId);
            if (data) return { type: 'amenity', data };
        } else if (elementKey === 'features' && subElementId && 'features' in section) {
            const feature = section.features.find(f => f.id === subElementId);
            if (feature) {
                 if (property && (property === 'title' || property === 'description')) {
                     data = feature[property];
                 } else {
                     return { type: 'feature', data: feature };
                 }
            }
        } else if (elementKey === 'tier' && 'tier' in section) {
            const tier = section.tier;
            if (property && property in tier) {
                data = tier[property as keyof PricingTier];
            } else {
                return { type: 'pricingTier', data: tier };
            }
        } else if (elementKey === 'nearbyPlaces' && subElementId && 'nearbyPlaces' in section && section.nearbyPlaces) {
            data = section.nearbyPlaces.find(p => p.id === subElementId);
            if (data) return { type: 'nearbyPlace', data };
        }
        
        if (data) {
            if ('position' in data) return { type: 'draggableText', data };
            if ('fontSize' in data) return { type: 'styledText', data };
        }

        return null;
    }, [selectedElement, selectedProperty]);


  const handleToolbarUpdate = async (changes: any) => {
    if (!selectedElement || !selectedProperty) return;
    const { sectionId, elementKey, subElementId, property } = selectedElement;

    const sectionIndex = selectedProperty.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    let processedChanges = { ...changes };

    // If there's an image data URL, we need to save it and get the key
    if (changes.imageUrl && changes.imageUrl.startsWith('data:')) {
        try {
            processedChanges.imageUrl = await saveImage(changes.imageUrl);
        } catch (error) {
            console.error("Failed to save image:", error);
            toast({ title: 'Error al guardar imagen', variant: 'destructive' });
            delete processedChanges.imageUrl; // Don't apply the change if saving fails
        }
    }
    
    const newSections = [...selectedProperty.sections];
    let sectionToUpdate: AnySectionData = { ...newSections[sectionIndex] };

    const updateNestedObject = (obj: any, keys: string[], value: any): any => {
      const key = keys[0];
      if (keys.length === 1) {
          if (Array.isArray(obj)) {
              return obj.map(item => item.id === subElementId ? { ...item, ...value } : item);
          }
          return { ...obj, ...value };
      }

      if (Array.isArray(obj)) {
          return obj.map(item => item.id === subElementId ? { ...item, [key]: updateNestedObject(item[key], keys.slice(1), value) } : item);
      }
      return { ...obj, [key]: updateNestedObject(obj[key], keys.slice(1), value) };
    };

    if (elementKey === 'style' || elementKey === 'backgroundImageUrl') {
        sectionToUpdate.style = { ...sectionToUpdate.style, ...processedChanges };
        if (elementKey === 'backgroundImageUrl' && 'backgroundImageUrl' in sectionToUpdate) {
            (sectionToUpdate as any).backgroundImageUrl = processedChanges.backgroundImageUrl;
        }
    } else if (subElementId && property) {
        // Deeply nested update, e.g., pricing tier title or feature description
        (sectionToUpdate as any)[elementKey] = (sectionToUpdate as any)[elementKey].map((item: any) => {
            if (item.id === subElementId) {
                return { ...item, [property]: { ...item[property], ...processedChanges } };
            }
            return item;
        });
    } else if (subElementId) {
        // Update a specific item in an array, e.g., an amenity or a feature
         (sectionToUpdate as any)[elementKey] = (sectionToUpdate as any)[elementKey].map((item: any) => 
            item.id === subElementId ? { ...item, ...processedChanges } : item
        );
    } else if (property) {
        // Update a property of a direct object, e.g. tier.title
        (sectionToUpdate as any)[elementKey][property] = { ...(sectionToUpdate as any)[elementKey][property], ...processedChanges };
    }
    else {
        // Update a direct property of the section, e.g., title or a whole object like 'tier'
        (sectionToUpdate as any)[elementKey] = { ...(sectionToUpdate as any)[elementKey], ...processedChanges };
    }

    newSections[sectionIndex] = sectionToUpdate;
    handleUpdateProperty({ ...selectedProperty, sections: newSections });
  };
  
  const closeConfirmationModal = () => {
      setConfirmationModalState({isOpen: false, onConfirm: () => {}, title: '', message: ''});
  };

  // --- Render Logic ---
  const renderSection = (section: AnySectionData, index: number) => {
    const commonProps = {
      key: section.id,
      onDelete: handleDeleteSection,
      isAdminMode: isAdminMode,
      selectedElement,
      onSelectElement: setSelectedElement,
    };

    switch (section.type) {
      case 'hero':
        return <HeroSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} isDraggingMode={isDraggingMode} />;
      case 'imageWithFeatures':
        return <ImageWithFeaturesSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
      case 'gallery':
        return <GallerySection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
      case 'amenities':
          return <AmenitiesSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
      case 'contact':
          return <ContactSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} onOpenContactForm={() => setIsContactModalOpen(true)} isDraggingMode={isDraggingMode}/>;
      case 'location':
          return <LocationSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} propertyAddress={selectedProperty?.address || ''} onUpdateAddress={handleUpdateAddress} />;
      case 'pricing':
          return <PricingSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
      default:
        const _exhaustiveCheck: never = section;
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
        <Header 
            isAdminMode={isAdminMode} 
            setIsAdminMode={setIsAdminMode}
            siteName={siteName}
            onSiteNameChange={setSiteName}
            customLogo={customLogo}
            onLogoUpload={setCustomLogo}
            onNavigateHome={() => setSelectedPropertyId(null)}
        />

        <main className="flex-grow">
            {selectedProperty ? (
            <div>
                {isAdminMode && <AddSectionControl index={0} onClick={(i) => setIsAddSectionModalOpen({ open: true, index: i })} />}
                {selectedProperty.sections.map((section, index) => (
                    <React.Fragment key={section.id}>
                        {renderSection(section, index)}
                        {isAdminMode && <AddSectionControl index={index + 1} onClick={(i) => setIsAddSectionModalOpen({ open: true, index: i })} />}
                    </React.Fragment>
                ))}
            </div>
            ) : (
            <PropertyList
                properties={properties}
                onSelectProperty={setSelectedPropertyId}
                onAddProperty={handleAddProperty}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                isAdminMode={isAdminMode}
                selectedIdsForExport={selectedIdsForExport}
                onToggleSelection={handleTogglePropertySelectionForExport}
                onToggleAll={handleToggleAllPropertiesForExport}
            />
            )}
        </main>
        
        <Footer onAdminLoginClick={() => setIsAdminLoginModalOpen(true)} />

        {/* --- Modals --- */}
        {isNewPropertyModalOpen && <NewPropertyModal onClose={() => setIsNewPropertyModalOpen(false)} onCreate={() => {
            setIsNewPropertyModalOpen(false);
        }} />}
        {isAdminLoginModalOpen && <AdminLoginModal onClose={() => setIsAdminLoginModalOpen(false)} onLogin={handleAdminLogin} />}
        {isAddSectionModalOpen.open && <AddSectionModal onClose={() => setIsAddSectionModalOpen({ open: false, index: 0 })} onSelect={(type) => handleAddSection(type, isAddSectionModalOpen.index)} />}
        {isContactModalOpen && selectedProperty && <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSubmit={handleContactSubmit} property={selectedProperty} />}
        {isSubmissionsModalOpen && <SubmissionsModal isOpen={isSubmissionsModalOpen} onClose={() => setIsSubmissionsModalOpen(false)} submissions={getSubmissionsForCurrentProperty()} />}
        <ConfirmationModal {...confirmationModalState} onClose={closeConfirmationModal} />
        
        {/* --- Admin Tools --- */}
        {isAdminMode && (
            <AdminToolbar 
                isDraggingMode={isDraggingMode} 
                setIsDraggingMode={setIsDraggingMode}
                onExport={handleExport}
                onImport={handleImport}
            />
        )}
        {isAdminMode && selectedElementForToolbar && (
            <EditingToolbar
                element={selectedElementForToolbar}
                onUpdate={handleToolbarUpdate}
                onClose={() => setSelectedElement(null)}
            />
        )}
    </div>
  );
};
