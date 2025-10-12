
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
    ButtonSectionData,
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
    PageSectionStyle,
    GalleryImage
} from '@/lib/types';

// Import constants
import { 
    INITIAL_PROPERTIES_DATA, 
    INITIAL_SUBMISSIONS_DATA, 
    createNewProperty, 
    createSectionData 
} from '@/lib/constants';

// Import services
import { initDB, saveImage, exportData, importData, getImageBlob } from '@/lib/storage';
import { geocodeAddress, generateNearbyPlaces } from '@/ai/gemini-service';


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
import { ButtonSection } from '@/components/sections/button-section';
import { AddSectionControl } from '@/components/add-section-control';
import { AddSectionModal } from '@/components/add-section-modal';
import { AdminToolbar } from '@/components/admin-toolbar';
import { EditingToolbar } from '@/components/editing-toolbar';
import { SubmissionsModal } from '@/components/submissions-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DraggableEditableText } from '@/components/draggable-editable-text';
import { ExportModal } from '@/components/export-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

// Type for the state that tracks the currently selected element for editing
type SelectedElementForToolbar = {
    type: 'styledText' | 'draggableText' | 'sectionStyle' | 'amenity' | 'feature' | 'pricingTier' | 'nearbyPlace' | 'button' | 'imageWithFeatures';
    data: Partial<StyledText & DraggableTextData & PageSectionStyle & AmenityItem & FeatureItem & PricingTier & NearbyPlace & ButtonSectionData & ImageWithFeaturesSectionData>;
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export default function Home() {
  // --- State Management ---
  const [properties, setProperties] = useState<Property[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // --- Modal State ---
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [confirmationModalState, setConfirmationModalState] = useState<{isOpen: boolean; onConfirm: () => void; title: string; message: string}>({isOpen: false, onConfirm: () => {}, title: '', message: ''});


  // --- UI Editing State ---
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
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
        setIsLoading(true);
        await initDB();
        
        try {
            const savedProps = localStorage.getItem('propertiesData');
            if (savedProps) {
                const parsedProps: Property[] = JSON.parse(savedProps);
                // If there are no properties, load the default one.
                if (parsedProps.length === 0) {
                     setProperties([]);
                } else {
                    setProperties(parsedProps);
                }
            } else {
                 setProperties([]);
            }

            const savedSubmissions = localStorage.getItem('submissionsData');
            setSubmissions(savedSubmissions ? JSON.parse(savedSubmissions) : []);

            const savedSiteName = localStorage.getItem('siteName');
            if (savedSiteName) setSiteName(savedSiteName);

            const savedLogo = localStorage.getItem('customLogo');
            if (savedLogo) setCustomLogo(savedLogo);

            const savedSelectedPropId = sessionStorage.getItem('selectedPropertyId');
            if(savedSelectedPropId) setSelectedPropertyId(savedSelectedPropId);
        } catch (error) {
            console.error("Failed to parse data from localStorage, starting fresh.", error);
            // Clear potentially corrupted data
            localStorage.removeItem('propertiesData');
            localStorage.removeItem('submissionsData');
            setProperties([]);
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    }
    
    loadFromStorage();
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('propertiesData', JSON.stringify(properties));
    }
  }, [properties, isLoading]);

  useEffect(() => { 
      if (!isLoading && submissions.length >= 0) {
          localStorage.setItem('submissionsData', JSON.stringify(submissions)); 
      }
  }, [submissions, isLoading]);

  useEffect(() => { 
    if (!isLoading) localStorage.setItem('siteName', siteName); 
  }, [siteName, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (customLogo) {
        localStorage.setItem('customLogo', customLogo);
    } else {
        localStorage.removeItem('customLogo');
    }
  }, [customLogo, isLoading]);
  
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
      }
  }, [isAdminMode]);
  
  // Global click listener to deselect elements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isAdminMode && selectedElement) {
            const target = event.target as HTMLElement;
            // Check for a custom attribute on the toolbar, or if it's inside a popper
            if (!target.closest('[data-editing-toolbar="true"], [data-radix-popper-content-wrapper]')) {
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

  const onUpdateProperty = handleUpdateProperty;

  const handleUpdateSection = useCallback((sectionId: string, updatedData: Partial<AnySectionData>) => {
    if (!selectedProperty) return;
    const newSections = selectedProperty.sections.map(s => s.id === sectionId ? { ...s, ...updatedData } : s);
    handleUpdateProperty({ ...selectedProperty, sections: newSections });
  }, [selectedProperty, handleUpdateProperty]);
  
  const handleAddSection = useCallback(async (type: AnySectionData['type'], index: number) => {
    if (!selectedProperty) return;
    const uniqueSuffix = `${Date.now()}`;
    
    const locationSection = selectedProperty.sections.find(s => s.type === 'location') as LocationSectionData | undefined;
    const coordinates = locationSection?.coordinates || { lat: 19.4326, lng: -99.1332 };
    
    const newSection = createSectionData(type, uniqueSuffix, {
      coordinates: coordinates,
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
  
  const moveSection = (fromIndex: number, toIndex: number) => {
      if (!selectedProperty) return;
      const newSections = [...selectedProperty.sections];
      const [movedItem] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedItem);
      handleUpdateProperty({ ...selectedProperty, sections: newSections });
  };
  
  const handleMoveSectionUp = (index: number) => {
    if (index > 0) {
      moveSection(index, index - 1);
    }
  };

  const handleMoveSectionDown = (index: number) => {
    if (!selectedProperty || index >= selectedProperty.sections.length - 1) return;
    moveSection(index, index + 1);
  };


  
    const handleUpdateAddress = useCallback(async (newAddress: string) => {
        if (!selectedProperty) return;
        
        toast({ title: "Actualizando dirección...", description: "Cambiando la dirección de la propiedad." });
        
        const updatedProperty = { ...selectedProperty, address: newAddress };
        handleUpdateProperty(updatedProperty);
        
        toast({ title: "¡Dirección actualizada!", description: "La dirección ha sido cambiada.", variant: "default" });

    }, [selectedProperty, handleUpdateProperty, toast]);


  // --- Property Management Handlers ---
  const handleAddProperty = () => {
      setIsNewPropertyModalOpen(true);
  };
  
    const handleCreateProperty = useCallback(async (address: string, lat: number, lng: number) => {
      toast({ title: "Creando propiedad...", description: "Generando detalles y lugares cercanos." });
      
      try {
        const nearbyPlaces = await generateNearbyPlaces(lat, lng);
        const newProp = createNewProperty(address, { lat, lng }, nearbyPlaces);
        
        setProperties(prev => [...prev, newProp]);
        setSelectedPropertyId(newProp.id);
        setIsNewPropertyModalOpen(false);

      } catch (error) {
        console.error("Failed to create property with AI features:", error);
        toast({
            title: "Error de IA",
            description: "No se pudieron generar los lugares cercanos. Se creará la propiedad con datos de ejemplo.",
            variant: "destructive"
        });
        // Fallback to creating property without AI-generated places
        const newProp = createNewProperty(address, { lat, lng }, []);
        setProperties(prev => [...prev, newProp]);
        setSelectedPropertyId(newProp.id);
        setIsNewPropertyModalOpen(false);
      }
  }, [toast]);

  
  const handleDeleteProperty = (id: string) => {
     setConfirmationModalState({
        isOpen: true,
        title: 'Eliminar Propiedad',
        message: '¿Estás seguro de que quieres eliminar esta propiedad? Todos sus datos se perderán permanentemente.',
        onConfirm: () => {
             setProperties(prev => {
                const newProps = prev.filter(p => p.id !== id);
                return newProps;
             });
             if (selectedPropertyId === id) {
                setSelectedPropertyId(null);
             }
             closeConfirmationModal();
        }
    });
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
     toast({
        title: "¡Gracias por tu interés!",
        description: `Hemos recibido tu información para la propiedad "${selectedProperty.name}". Te contactaremos pronto.`,
    });
  };
  
  const getSubmissionsForCurrentProperty = () => {
      return submissions.filter(sub => sub.propertyId === selectedPropertyId);
  };
  
    // --- Import/Export Handlers ---
    const handleExport = async (selectedIds: Set<string>) => {
        setIsExportModalOpen(false);
        try {
            const propertiesToExport = properties.filter(p => selectedIds.has(p.id));

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

        // Handle section-level style selections
        if (elementKey === 'style') {
            return { type: 'sectionStyle', data: { ...section.style, backgroundImageUrl: (section as any).backgroundImageUrl }};
        }
        
        let data: any;

        switch(section.type) {
            case 'hero':
                if (elementKey === 'title') {
                    data = section.title;
                }
                break;
            case 'imageWithFeatures':
                if (elementKey === 'title') data = section.title;
                if (elementKey === 'mediaWidth' || elementKey === 'mediaScale') {
                    return { type: 'imageWithFeatures', data: section };
                }
                if (elementKey === 'features') {
                     const feature = section.features.find(f => f.id === subElementId);
                     if (feature) {
                        if (property === 'title' || property === 'description') {
                            data = feature[property];
                        } else {
                            return { type: 'feature', data: feature };
                        }
                    }
                }
                break;
            case 'gallery':
                 if (elementKey === 'title') data = section.title;
                 break;
            case 'amenities':
                 if (elementKey === 'title') data = section.title;
                 if (elementKey === 'amenities') {
                    const amenity = section.amenities.find(a => a.id === subElementId);
                     if (amenity) return { type: 'amenity', data: amenity };
                 }
                 break;
            case 'pricing':
                if (elementKey === 'tier') {
                    const tier = section.tier;
                    if (subElementId === tier.id && property && (property === 'title' || property === 'price' || property === 'oldPrice' || property === 'currency' || property === 'description')) {
                        data = tier[property];
                    } else {
                        return { type: 'pricingTier', data: tier };
                    }
                }
                break;
            case 'location':
                if (elementKey === 'title') data = section.title;
                if (elementKey === 'nearbyPlaces') {
                    const place = section.nearbyPlaces?.find(p => p.id === subElementId);
                    if (place) return { type: 'nearbyPlace', data: place };
                }
                break;
            case 'button':
                if (elementKey === 'title' || elementKey === 'subtitle') {
                    data = section[elementKey];
                } else if (elementKey === 'text' || elementKey === 'alignment' || elementKey === 'linkTo') {
                    return { type: 'button', data: section };
                }
                break;
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
    
    const newSections = [...selectedProperty.sections];
    let sectionToUpdate: AnySectionData = JSON.parse(JSON.stringify(newSections[sectionIndex]));

    if (elementKey === 'style' || elementKey === 'mediaWidth' || elementKey === 'mediaScale') {
        sectionToUpdate = { ...sectionToUpdate, ...changes };
        if (changes.backgroundImageUrl !== undefined) {
             (sectionToUpdate as any).backgroundImageUrl = changes.backgroundImageUrl;
        }
    } else if (sectionToUpdate.type === 'button' && (elementKey === 'alignment' || elementKey === 'linkTo')) {
        sectionToUpdate = { ...sectionToUpdate, ...changes };
    } else if (subElementId && property && (sectionToUpdate as any)[elementKey]) {
        // Deeply nested update (e.g., feature title, pricing tier price)
        const array = (sectionToUpdate as any)[elementKey];
        const itemIndex = Array.isArray(array) ? array.findIndex((item: any) => item.id === subElementId) : -1;

        if (itemIndex > -1) {
            const itemToUpdate = array[itemIndex];
            if (itemToUpdate && (property in itemToUpdate)) {
                 (itemToUpdate[property as keyof typeof itemToUpdate] as any) = {
                    ...(itemToUpdate[property as keyof typeof itemToUpdate] as any),
                    ...changes
                 };
            }
        } else if (!Array.isArray(array) && array.id === subElementId) { // For non-array objects like 'tier'
            const itemToUpdate = (sectionToUpdate as any)[elementKey];
             (itemToUpdate[property as keyof typeof itemToUpdate] as any) = {
                    ...(itemToUpdate[property as keyof typeof itemToUpdate] as any),
                    ...changes
                 };
        }

    } else if (subElementId && (sectionToUpdate as any)[elementKey]) {
        // Update a specific item in an array (e.g., an amenity, a feature object, a nearby place)
        const array = (sectionToUpdate as any)[elementKey] as any[];
        const itemIndex = array.findIndex((item: any) => item.id === subElementId);
        if (itemIndex > -1) {
            array[itemIndex] = { ...array[itemIndex], ...changes };
        }
    } else if (elementKey) {
        // Update a direct property of the section or a whole object like 'tier'
        (sectionToUpdate as any)[elementKey] = { ...(sectionToUpdate as any)[elementKey], ...changes };
    }

    newSections[sectionIndex] = sectionToUpdate;
    handleUpdateProperty({ ...selectedProperty, sections: newSections });
  };
  
  const closeConfirmationModal = () => {
      setConfirmationModalState({isOpen: false, onConfirm: () => {}, title: '', message: ''});
  };

  const handleUpdatePropertyImage = useCallback(async (propertyId: string, newImageKey: string) => {
      const propertyToUpdate = properties.find(p => p.id === propertyId);
      if (propertyToUpdate) {
          onUpdateProperty({ ...propertyToUpdate, mainImageUrl: newImageKey });
      }
  }, [properties, onUpdateProperty]);

  // --- Render Logic ---
  const renderSection = useCallback((section: AnySectionData, index: number) => {
    const commonProps = {
      key: section.id,
      onDelete: handleDeleteSection,
      isAdminMode: isAdminMode,
      selectedElement,
      onSelectElement: setSelectedElement,
    };

    const sectionContent = () => {
        switch (section.type) {
            case 'hero':
                return <HeroSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} isFirstSection={index === 0} />;
            case 'imageWithFeatures':
                return <ImageWithFeaturesSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
            case 'gallery':
                return <GallerySection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
            case 'amenities':
                return <AmenitiesSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
            case 'contact':
                return <ContactSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} onSubmit={handleContactSubmit} />;
            case 'location':
                return <LocationSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} propertyAddress={selectedProperty?.address || ''} onUpdateAddress={handleUpdateAddress} />;
            case 'pricing':
                return <PricingSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
            case 'button':
                return <ButtonSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} />;
            default:
                const _exhaustiveCheck: never = section;
                console.warn("Unknown section type, cannot render:", section);
                return null;
        }
    };
    
    return (
        <div className="relative">
             {isAdminMode && (
                <div className="absolute top-1/2 -translate-y-1/2 left-2 z-30 flex flex-col gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-background/50 hover:bg-background"
                        onClick={() => handleMoveSectionUp(index)}
                        disabled={index === 0}
                        aria-label="Move section up"
                    >
                        <Icon name="chevron-up" className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-background/50 hover:bg-background"
                        onClick={() => handleMoveSectionDown(index)}
                        disabled={index === (selectedProperty?.sections.length ?? 0) - 1}
                        aria-label="Move section down"
                    >
                        <Icon name="chevron-down" className="h-5 w-5" />
                    </Button>
                </div>
            )}
            {sectionContent()}
        </div>
    );

  }, [isAdminMode, selectedElement, handleUpdateSection, handleDeleteSection, handleContactSubmit, selectedProperty?.address, handleUpdateAddress, selectedProperty?.sections.length]);

  if (isLoading) {
    return <div className="fixed inset-0 bg-white z-50"></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
        <Header 
            isAdminMode={isAdminMode} 
            setIsAdminMode={setIsAdminMode}
            siteName={siteName}
            onSiteNameChange={setSiteName}
            customLogo={customLogo}
            onLogoUpload={setCustomLogo}
            onNavigateHome={() => setSelectedPropertyId(null)}
        />

        <main className={cn("flex-grow", !selectedProperty && "pt-24")}>
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
                onUpdateProperty={onUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                onUpdatePropertyImage={handleUpdatePropertyImage}
                isAdminMode={isAdminMode}
            />
            )}
        </main>
        
        <Footer onAdminLoginClick={() => setIsAdminLoginModalOpen(true)} />

        {/* --- Modals --- */}
        {isNewPropertyModalOpen && <NewPropertyModal onClose={() => setIsNewPropertyModalOpen(false)} onCreate={handleCreateProperty} />}
        {isAdminLoginModalOpen && <AdminLoginModal onClose={() => setIsAdminLoginModalOpen(false)} onLogin={handleAdminLogin} />}
        {isAddSectionModalOpen.open && <AddSectionModal onClose={() => setIsAddSectionModalOpen({ open: false, index: 0 })} onSelect={(type) => handleAddSection(type, isAddSectionModalOpen.index)} />}
        {isSubmissionsModalOpen && <SubmissionsModal isOpen={isSubmissionsModalOpen} onClose={() => setIsSubmissionsModalOpen(false)} submissions={getSubmissionsForCurrentProperty()} />}
        <ConfirmationModal {...confirmationModalState} onClose={closeConfirmationModal} />
        {isExportModalOpen && (
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                properties={properties}
                onExport={handleExport}
            />
        )}
        
        {/* --- Admin Tools --- */}
        {isAdminMode && (
            <AdminToolbar 
                onExportClick={() => setIsExportModalOpen(true)}
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

    