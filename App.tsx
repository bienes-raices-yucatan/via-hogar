import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { HeroSection } from './components/HeroSection';
import { ImageWithFeaturesSection } from './components/ImageWithFeaturesSection';
import { GallerySection } from './components/GallerySection';
import { LocationSection } from './components/LocationSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { ContactSection } from './components/ContactSection';
import { PricingSection } from './components/PricingSection';
import { PropertyList } from './components/PropertyList';
import { AnySectionData, Property, NearbyPlace, IconName, PageSection, StyledText, DraggableTextData, ContactSubmission } from './types';
import { INITIAL_PROPERTIES_DATA, createNewProperty, createSectionData, INITIAL_SUBMISSIONS_DATA } from './constants';
import { Icon } from './components/Icon';
import { NewPropertyModal } from './components/NewPropertyModal';
import { geocodeAddress, generateNearbyPlaces, initDB, saveImage } from './services/geminiService';
import { AddSectionControl } from './components/AddSectionControl';
import { AddSectionModal } from './components/AddSectionModal';
import { EditingToolbar } from './components/EditingToolbar';
import { ContactModal } from './components/ContactModal';
import { SubmissionsModal } from './components/SubmissionsModal';
import { AdminToolbar } from './components/AdminToolbar';
import { ConfirmationModal } from './components/ConfirmationModal';

export interface SelectedElement {
    sectionId: string;
    // Fix: Changed elementKey to string to allow for keys that are not common across all section types (e.g., 'subtitle').
    elementKey: string;
    subElementId?: string; // For items in an array like floatingTexts
}

// This helper function maps the category string from the AI to a specific IconName
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

// Fix: Added a type alias for the data passed to the EditingToolbar to help with type inference in useMemo.
type SelectedElementForToolbar = {
    type: 'styledText' | 'draggableText' | 'sectionStyle';
    data: Partial<StyledText & DraggableTextData & { backgroundColor: string }>;
};

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => {
    try {
        const savedSubmissions = localStorage.getItem('contactSubmissions');
        return savedSubmissions ? JSON.parse(savedSubmissions) : INITIAL_SUBMISSIONS_DATA;
    } catch (error) {
        console.warn("Could not load submissions data from localStorage", error);
        return INITIAL_SUBMISSIONS_DATA;
    }
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDraggingMode, setIsDraggingMode] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [addSectionIndex, setAddSectionIndex] = useState(0);

  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [propertyIdToDelete, setPropertyIdToDelete] = useState<string | null>(null);

  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const [siteName, setSiteName] = useState<string>(() => {
    try {
      return localStorage.getItem('siteName') || 'Vía Hogar';
    } catch (error)      {
      console.warn("Could not read siteName from localStorage", error);
      return 'Vía Hogar';
    }
  });

  useEffect(() => {
    const initializeApp = async () => {
        await initDB();

        // Load logo and submissions first
        setCustomLogo(localStorage.getItem('customLogo'));

        // Load properties and run migration if needed
        const version = localStorage.getItem('dataVersion');
        const savedData = localStorage.getItem('propertiesData');
        let propertiesData = savedData ? JSON.parse(savedData) : INITIAL_PROPERTIES_DATA;

        if (version !== '2.0-indexeddb') {
            console.log("Running data migration to IndexedDB...");
            let migrationOccurred = false;
            
            const migrateObject = async (obj: any) => {
                for (const prop in obj) {
                    if (typeof obj[prop] === 'string' && obj[prop].startsWith('data:image') && obj[prop].length > 1024) {
                        try {
                            console.log(`Migrating property: ${prop}`);
                            const key = await saveImage(obj[prop]);
                            obj[prop] = key;
                            migrationOccurred = true;
                        } catch (e) {
                            console.error(`Migration failed for property ${prop}`, e);
                        }
                    } else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                        await migrateObject(obj[prop]);
                    }
                }
            };

            await migrateObject(propertiesData);

            if (migrationOccurred) {
                console.log("Migration complete. Saving cleaned data.");
                try {
                    localStorage.setItem('propertiesData', JSON.stringify(propertiesData));
                } catch (error) {
                    alert("Error guardando los datos migrados. El almacenamiento podría estar lleno. Por favor, contacte a soporte.");
                    console.error("Failed to save migrated data:", error);
                }
            }
            localStorage.setItem('dataVersion', '2.0-indexeddb');
        }

        setProperties(propertiesData);
        setIsDataLoaded(true);
    };

    initializeApp().catch(err => {
        console.error("Failed to initialize app:", err);
        setIsDataLoaded(true); // Still show the app, even if DB fails
    });
  }, []);

  useEffect(() => {
    if (siteName) {
      document.title = siteName;
    }
  }, [siteName]);

  const saveData = (newProperties: Property[], newSubmissions?: ContactSubmission[]) => {
      try {
          const stringifiedData = JSON.stringify(newProperties);
          localStorage.setItem('propertiesData', stringifiedData);
          if (newSubmissions) {
            localStorage.setItem('contactSubmissions', JSON.stringify(newSubmissions));
          }
      } catch (error: any) {
          console.error("Could not save data to localStorage", error);
          if (error.name === 'QuotaExceededError') {
              alert('Error: El almacenamiento local está lleno. No se pudieron guardar los cambios. Esto puede ocurrir si las imágenes son demasiado grandes. La aplicación intentará usar una base de datos interna para solucionar esto en el futuro.');
          } else {
              alert('Ocurrió un error inesperado al guardar los datos.');
          }
      }
      setProperties(newProperties);
      if (newSubmissions) {
          setContactSubmissions(newSubmissions);
      }
  }

  const handleOpenNewPropertyModal = () => {
    if (isAdminMode) {
      setIsNewPropertyModalOpen(true);
    }
  };

  const handleCreateProperty = async (address: string) => {
    try {
      const coordinates = await geocodeAddress(address);
      
      let nearbyPlaces: NearbyPlace[] = [];
      try {
        const aiPlaces = await generateNearbyPlaces(coordinates.lat, coordinates.lng);
        nearbyPlaces = aiPlaces.map(place => ({
          id: `place-${Date.now()}-${Math.random()}`,
          icon: mapCategoryToIcon(place.category),
          text: place.description,
        }));
      } catch (nearbyError) {
        console.warn("Could not auto-generate nearby places, continuing with an empty list:", nearbyError);
      }

      const newProperty = createNewProperty(address, coordinates, nearbyPlaces);
      const newProperties = [...properties, newProperty];
      saveData(newProperties);
      setIsNewPropertyModalOpen(false);
      setSelectedPropertyId(newProperty.id);
    } catch (error) {
      console.error("Failed to create property:", error);
      throw error;
    }
  };


  const handleDeleteProperty = (id: string) => {
    setPropertyIdToDelete(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!propertyIdToDelete) return;
    const newProperties = properties.filter(p => p.id !== propertyIdToDelete);
    saveData(newProperties);
    setPropertyIdToDelete(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setPropertyIdToDelete(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
      const newProperties = properties.map(p => p.id === updatedProperty.id ? updatedProperty : p);
      saveData(newProperties);
  };

  const updateSectionData = useCallback((updatedSection: AnySectionData) => {
    if (!selectedPropertyId) return;
    const newProperties = properties.map(p => {
        if (p.id === selectedPropertyId) {
            const newSections = p.sections.map(s => s.id === updatedSection.id ? updatedSection : s);
            return { ...p, sections: newSections };
        }
        return p;
    });
    saveData(newProperties);
  }, [selectedPropertyId, properties]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!selectedPropertyId) return;
    const newProperties = properties.map(p => {
        if (p.id === selectedPropertyId) {
            return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
        }
        return p;
    });
    saveData(newProperties);
    setSelectedElement(null);
  }, [selectedPropertyId, properties]);

  const handleOpenAddSectionModal = (index: number) => {
      setAddSectionIndex(index);
      setIsAddSectionModalOpen(true);
  };

  const handleAddSection = (sectionType: PageSection['type']) => {
    if (!selectedPropertyId) return;
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newSection = createSectionData(sectionType, uniqueSuffix);
    const newProperties = properties.map(p => {
        if (p.id === selectedPropertyId) {
            const newSections = [...p.sections];
            newSections.splice(addSectionIndex, 0, newSection);
            return { ...p, sections: newSections };
        }
        return p;
    });
    saveData(newProperties);
    setIsAddSectionModalOpen(false);
  };


  const handleSiteNameChange = (newName: string) => {
    try {
      localStorage.setItem('siteName', newName);
    } catch (error) {
       console.error("Could not save siteName to localStorage", error);
    }
    setSiteName(newName);
  };

  const handleLogoUpload = (logoDataUrl: string) => {
    try {
      localStorage.setItem('customLogo', logoDataUrl);
      setCustomLogo(logoDataUrl);
    } catch (error) {
       console.error("Could not save customLogo to localStorage", error);
    }
  };
  
  const handleNavigateHome = () => {
    setSelectedPropertyId(null);
  };

  const handleAdminLogin = (user: string, pass: string): boolean => {
    if (user === 'Admin' && pass === 'Aguilar1') {
      setIsAdminMode(true);
      setIsLoginModalOpen(false);
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
    const newSubmissions = [...contactSubmissions, newSubmission];
    setContactSubmissions(newSubmissions);
    saveData(properties, newSubmissions);
  };

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);
  
  const submissionsForSelectedProperty = useMemo(() => {
    return contactSubmissions.filter(s => s.propertyId === selectedPropertyId);
  }, [contactSubmissions, selectedPropertyId]);

  // Fix: Explicitly typing the return value of useMemo to prevent the compiler from widening literal types to 'string'.
  const selectedElementData = useMemo((): SelectedElementForToolbar | null => {
    if (!selectedElement || !selectedProperty) return null;
    
    const section = selectedProperty.sections.find(s => s.id === selectedElement.sectionId);
    if (!section) return null;

    if (selectedElement.elementKey === 'sectionStyle') {
        return { type: 'sectionStyle', data: section.style || {} };
    }
    if (selectedElement.elementKey === 'floatingTexts' && selectedElement.subElementId) {
        const textElement = section.floatingTexts?.find(t => t.id === selectedElement.subElementId);
        return textElement ? { type: 'draggableText', data: textElement } : null;
    }
    
    const element = (section as any)[selectedElement.elementKey] as StyledText | DraggableTextData;
    if (element && typeof element === 'object') {
        if ('position' in element) {
            return { type: 'draggableText', data: element };
        }
        return { type: 'styledText', data: element };
    }

    return null;
  }, [selectedElement, selectedProperty]);

  const handleUpdateSelectedElement = (newData: any) => {
    if (!selectedElement || !selectedPropertyId) return;
  
    const newProperties = properties.map(p => {
      if (p.id === selectedPropertyId) {
        const newSections = p.sections.map(s => {
          if (s.id === selectedElement.sectionId) {
            const newSection = { ...s } as any;
            const { elementKey, subElementId } = selectedElement;
  
            if (elementKey === 'sectionStyle') {
              newSection.style = { ...newSection.style, ...newData };
            } else if (elementKey === 'floatingTexts' && subElementId) {
              newSection.floatingTexts = (newSection.floatingTexts || []).map(t =>
                t.id === subElementId ? { ...t, ...newData } : t
              );
            } else {
              const currentElement = newSection[elementKey as keyof typeof newSection] as any;
              newSection[elementKey as keyof typeof newSection] = { ...currentElement, ...newData };
            }
            return newSection as AnySectionData;
          }
          return s;
        });
        return { ...p, sections: newSections };
      }
      return p;
    });
  
    saveData(newProperties);
  };

  const handleSelectElement = useCallback((newSelection: SelectedElement | null) => {
    setSelectedElement(newSelection);
  }, []);

  const renderSection = (section: AnySectionData) => {
    const commonProps = {
      key: section.id,
      onUpdate: updateSectionData,
      onDelete: handleDeleteSection,
      isAdminMode: isAdminMode,
      selectedElement: selectedElement,
      onSelectElement: handleSelectElement,
    };

    // Fix: Pass the correctly typed `section` object to each component's `data` prop
    // to avoid type mismatch errors between `AnySectionData` and specific section data types.
    switch (section.type) {
      case 'hero': return <HeroSection {...commonProps} data={section} isDraggingMode={isDraggingMode} />;
      case 'imageWithFeatures': return <ImageWithFeaturesSection {...commonProps} data={section} />;
      case 'gallery': return <GallerySection {...commonProps} data={section} />;
      case 'amenities': return <AmenitiesSection {...commonProps} data={section} />;
      case 'pricing': return <PricingSection {...commonProps} data={section} />;
      case 'contact': return <ContactSection {...commonProps} data={section} onOpenContactForm={() => setIsContactModalOpen(true)} isDraggingMode={isDraggingMode} />;
      case 'location': return <LocationSection {...commonProps} data={section} propertyAddress={selectedProperty?.address || ''}/>;
      default: return null;
    }
  };
  
  if (!isDataLoaded) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <p>Cargando aplicación...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" style={{fontFamily: 'Roboto'}}>
      <Header 
        isAdminMode={isAdminMode} 
        setIsAdminMode={(isAdmin) => {
            if (!isAdmin) {
                setSelectedPropertyId(null);
                setSelectedElement(null);
                setIsDraggingMode(false);
            }
            setIsAdminMode(isAdmin);
        }}
        customLogo={customLogo}
        onLogoUpload={handleLogoUpload}
        siteName={siteName}
        onSiteNameChange={handleSiteNameChange}
        onNavigateHome={handleNavigateHome}
      />
      {isAdminMode && selectedPropertyId && !isDraggingMode && (
          <div className="fixed top-20 left-4 z-30">
              <button
                  onClick={handleNavigateHome}
                  className="bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg hover:bg-slate-900 flex items-center transition-colors"
                  aria-label="Volver al listado de propiedades"
              >
                  <Icon name="chevron-left" className="w-5 h-5 mr-2" />
                  <span>Volver al listado</span>
              </button>
          </div>
      )}
      {isAdminMode && (
        <AdminToolbar isDraggingMode={isDraggingMode} setIsDraggingMode={setIsDraggingMode} />
      )}
      {isAdminMode && selectedElementData && (
        <EditingToolbar
            element={selectedElementData}
            onUpdate={handleUpdateSelectedElement}
            onClose={() => setSelectedElement(null)}
        />
      )}
      <main className="flex-grow" onClick={() => { if(isAdminMode) setSelectedElement(null); }}>
        {selectedProperty ? (
            <div className="relative">
                 <div className="absolute top-24 left-4 z-20">
                    {isAdminMode && (
                         <button
                            onClick={(e) => { e.stopPropagation(); setIsSubmissionsModalOpen(true); }}
                            className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-md shadow-lg hover:bg-amber-500 flex items-center"
                        >
                            Ver Contactos ({submissionsForSelectedProperty.length})
                        </button>
                    )}
                 </div>
                
                {isAdminMode ? (
                    <>
                        <AddSectionControl index={0} onClick={handleOpenAddSectionModal} />
                        {selectedProperty.sections.map((section, index) => (
                            <div key={section.id} className="relative">
                                {renderSection(section)}
                                <AddSectionControl index={index + 1} onClick={handleOpenAddSectionModal} />
                            </div>
                        ))}
                    </>
                ) : (
                    selectedProperty.sections.map(section => renderSection(section))
                )}
            </div>
        ) : (
            <PropertyList
                properties={properties}
                onSelectProperty={setSelectedPropertyId}
                onAddProperty={handleOpenNewPropertyModal}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                isAdminMode={isAdminMode}
            />
        )}
      </main>
      <Footer onAdminLoginClick={() => setIsLoginModalOpen(true)} />
      {isLoginModalOpen && (
        <AdminLoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleAdminLogin}
        />
      )}
      {isNewPropertyModalOpen && (
        <NewPropertyModal
          onClose={() => setIsNewPropertyModalOpen(false)}
          onCreate={handleCreateProperty}
        />
      )}
      {isAddSectionModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddSectionModalOpen(false)}
          onSelect={handleAddSection}
        />
      )}
       {isContactModalOpen && selectedProperty && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSubmit={handleContactSubmit}
          property={selectedProperty}
        />
      )}
      {isSubmissionsModalOpen && (
        <SubmissionsModal
            isOpen={isSubmissionsModalOpen}
            onClose={() => setIsSubmissionsModalOpen(false)}
            submissions={submissionsForSelectedProperty}
        />
      )}
      {isConfirmDeleteModalOpen && (
        <ConfirmationModal
            isOpen={isConfirmDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Confirmar Eliminación"
            message="¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer."
        />
      )}
    </div>
  );
};

export default App;