
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
    IconName
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
import { initDB } from '@/lib/storage';

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

// Type for the state that tracks the currently selected element for editing
type SelectedElementForToolbar = {
    type: 'styledText' | 'draggableText' | 'sectionStyle';
    data: Partial<StyledText & DraggableTextData & { backgroundColor: string }>;
};

export default function Home() {
  // --- State Management ---
  const [properties, setProperties] = useState<Property[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

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

  // Derived state for the currently selected property
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // --- Effects ---
  useEffect(() => {
    initDB();
    
    const savedProps = localStorage.getItem('propertiesData');
    setProperties(savedProps ? JSON.parse(savedProps) : INITIAL_PROPERTIES_DATA);

    const savedSubmissions = localStorage.getItem('submissionsData');
    setSubmissions(savedSubmissions ? JSON.parse(savedSubmissions) : INITIAL_SUBMISSIONS_DATA);

    const savedSiteName = localStorage.getItem('siteName');
    if (savedSiteName) setSiteName(savedSiteName);

    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) setCustomLogo(savedLogo);

    const savedSelectedPropId = sessionStorage.getItem('selectedPropertyId');
    if(savedSelectedPropId) setSelectedPropertyId(savedSelectedPropId);

  }, []);

  // Persist data to localStorage
  useEffect(() => { localStorage.setItem('propertiesData', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('submissionsData', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('siteName', siteName); }, [siteName]);
  useEffect(() => {
    if (customLogo) localStorage.setItem('customLogo', customLogo);
    else localStorage.removeItem('customLogo');
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
      }
  }, [isAdminMode]);
  
  // Global click listener to deselect elements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // If in admin mode and the click is on the body (or a non-interactive part of a section), deselect.
        if (isAdminMode && selectedElement) {
            const target = event.target as HTMLElement;
            // Check if the click is outside any editable-related element
            if (!target.closest('[class*="outline-dashed"]')) {
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

  const handleUpdateSection = useCallback((sectionId: string, updatedData: AnySectionData) => {
    if (!selectedProperty) return;
    const newSections = selectedProperty.sections.map(s => s.id === sectionId ? updatedData : s);
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

  // --- Property Management Handlers ---
  const handleAddProperty = async (address: string) => {
      try {
        const coordinates = await geocodeAddress(address);
        const nearbyPlacesData = await generateNearbyPlaces(coordinates.lat, coordinates.lng);
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
        const nearbyPlaces: NearbyPlace[] = (nearbyPlacesData.places || []).map((place: any) => ({
              id: `place-${Date.now()}-${Math.random()}`,
              icon: mapCategoryToIcon(place.category),
              text: place.description
        }));

        const newProp = createNewProperty(address, coordinates, nearbyPlaces);
        setProperties(prev => [...prev, newProp]);
        setIsNewPropertyModalOpen(false);
        setSelectedPropertyId(newProp.id);
      } catch (error) {
        console.error("Failed to add property:", error);
        // You might want to show a toast or alert to the user here
      }
  };
  
  const handleDeleteProperty = (id: string) => {
     setConfirmationModalState({
        isOpen: true,
        title: 'Eliminar Propiedad',
        message: '¿Estás seguro de que quieres eliminar esta propiedad? Todos sus datos se perderán permanentemente.',
        onConfirm: () => {
             setProperties(prev => prev.filter(p => p.id !== id));
             if (selectedPropertyId === id) {
                setSelectedPropertyId(null);
             }
             setConfirmationModalState({isOpen: false, onConfirm: () => {}, title: '', message: ''});
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
  };
  
  const getSubmissionsForCurrentProperty = () => {
      return submissions.filter(sub => sub.propertyId === selectedPropertyId);
  };
  
  // --- Toolbar Logic ---
  const selectedElementForToolbar: SelectedElementForToolbar | null = useMemo(() => {
    if (!selectedElement || !selectedProperty) return null;

    const { sectionId, elementKey, subElementId } = selectedElement;
    const section = selectedProperty.sections.find(s => s.id === sectionId);
    if (!section) return null;

    if (elementKey === 'style') {
        return { type: 'sectionStyle', data: { backgroundColor: section.style?.backgroundColor || '#FFFFFF' }};
    }

    let data: any;
    if (elementKey === 'floatingTexts' && subElementId && 'floatingTexts' in section && section.floatingTexts) {
        data = section.floatingTexts.find(t => t.id === subElementId);
    } else if (elementKey === 'title' && 'title' in section) {
        data = section.title;
    } else if (elementKey === 'subtitle' && 'subtitle' in section) {
        data = section.subtitle;
    }
    
    if (data && 'position' in data) {
        return { type: 'draggableText', data };
    } else if (data && 'fontSize' in data) {
        return { type: 'styledText', data };
    }
    return null;
  }, [selectedElement, selectedProperty]);

  const handleToolbarUpdate = (changes: any) => {
    if (!selectedElement || !selectedProperty) return;
    const { sectionId, elementKey, subElementId } = selectedElement;

    const sectionIndex = selectedProperty.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    const newSections = [...selectedProperty.sections];
    let sectionToUpdate = { ...newSections[sectionIndex] };

    if (elementKey === 'style') {
        sectionToUpdate.style = { ...sectionToUpdate.style, ...changes };
    } else if (elementKey === 'floatingTexts' && subElementId && 'floatingTexts' in sectionToUpdate && sectionToUpdate.floatingTexts) {
        sectionToUpdate.floatingTexts = sectionToUpdate.floatingTexts.map(t =>
            t.id === subElementId ? { ...t, ...changes } : t
        );
    } else if (elementKey === 'title' && 'title' in sectionToUpdate && sectionToUpdate.title) {
        // Ensure title is not undefined before spreading
        sectionToUpdate.title = { ...(sectionToUpdate.title as DraggableTextData | StyledText), ...changes };
    } else if (elementKey === 'subtitle' && 'subtitle' in sectionToUpdate && sectionToUpdate.subtitle) {
        sectionToUpdate.subtitle = { ...sectionToUpdate.subtitle, ...changes };
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
          return <LocationSection {...commonProps} data={section} onUpdate={(d) => handleUpdateSection(section.id, d)} propertyAddress={selectedProperty?.address || ''}/>;
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
                {selectedProperty.sections.map((section, index) => (
                    <div key={section.id}>
                        {isAdminMode && <AddSectionControl index={index} onClick={(i) => setIsAddSectionModalOpen({ open: true, index: i })} />}
                        {renderSection(section, index)}
                    </div>
                ))}
                {isAdminMode && <AddSectionControl index={selectedProperty.sections.length} onClick={(i) => setIsAddSectionModalOpen({ open: true, index: i })} />}
            </div>
            ) : (
            <PropertyList
                properties={properties}
                onSelectProperty={setSelectedPropertyId}
                onAddProperty={() => setIsNewPropertyModalOpen(true)}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                isAdminMode={isAdminMode}
            />
            )}
        </main>
        
        <Footer onAdminLoginClick={() => setIsAdminLoginModalOpen(true)} />

        {/* --- Modals --- */}
        {isNewPropertyModalOpen && <NewPropertyModal onClose={() => setIsNewPropertyModalOpen(false)} onCreate={handleAddProperty} />}
        {isAdminLoginModalOpen && <AdminLoginModal onClose={() => setIsAdminLoginModalOpen(false)} onLogin={handleAdminLogin} />}
        {isAddSectionModalOpen.open && <AddSectionModal onClose={() => setIsAddSectionModalOpen({ open: false, index: 0 })} onSelect={(type) => handleAddSection(type, isAddSectionModalOpen.index)} />}
        {isContactModalOpen && selectedProperty && <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSubmit={handleContactSubmit} property={selectedProperty} />}
        {isSubmissionsModalOpen && <SubmissionsModal isOpen={isSubmissionsModalOpen} onClose={() => setIsSubmissionsModalOpen(false)} submissions={getSubmissionsForCurrentProperty()} />}
        <ConfirmationModal {...confirmationModalState} onClose={closeConfirmationModal} />
        
        {/* --- Admin Tools --- */}
        {isAdminMode && <AdminToolbar isDraggingMode={isDraggingMode} setIsDraggingMode={setIsDraggingMode} />}
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
