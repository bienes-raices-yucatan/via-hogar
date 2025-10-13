
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyList } from '@/components/property-list';
import { AdminLoginModal } from '@/components/admin-login-modal';
import { NewPropertyModal } from '@/components/new-property-modal';
import { AddSectionModal } from '@/components/add-section-modal';
import { AddSectionControl } from '@/components/add-section-control';
import { EditingToolbar } from '@/components/editing-toolbar';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ContactModal } from '@/components/contact-modal';
import { SubmissionsModal } from '@/components/submissions-modal';
import { AdminToolbar } from '@/components/admin-toolbar';
import { ExportModal } from '@/components/export-modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { useToast } from "@/hooks/use-toast";
import { generateNearbyPlaces } from '@/ai/gemini-service';

import { 
  Property, 
  AnySectionData, 
  SelectedElement, 
  ContactSubmission,
  AmenityItem, 
  FeatureItem, 
  PricingTier, 
  NearbyPlace, 
  DraggableTextData,
  ImageWithFeaturesSectionData,
  ButtonSectionData,
  PricingSectionData
} from '@/lib/types';
import { createSectionData, createNewProperty } from '@/lib/constants';
import { initDB, saveImage, deleteImage, exportData, importData } from '@/lib/storage';

// Import all section components
import { HeroSection } from '@/components/sections/hero-section';
import { GallerySection } from '@/components/sections/gallery-section';
import { LocationSection } from '@/components/sections/location-section';
import { AmenitiesSection } from '@/components/sections/amenities-section';
import { ImageWithFeaturesSection } from '@/components/sections/image-with-features-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { ContactSection } from '@/components/sections/contact-section';
import { ButtonSection } from '@/components/sections/button-section';

type ModalState = 'none' | 'login' | 'newProperty' | 'addSection' | 'confirmDeleteProperty' | 'confirmDeleteSection' | 'contact' | 'submissions' | 'export';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [addSectionIndex, setAddSectionIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ propertyId?: string; sectionId?: string }>({});
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [siteName, setSiteName] = useState("Vía Hogar");
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    initDB().then(success => {
      setDbInitialized(success);
      if (success) {
        // Load data from localStorage after DB is up
        const savedProps = localStorage.getItem('properties');
        const savedSubmissions = localStorage.getItem('submissions');
        const savedSiteName = localStorage.getItem('siteName');
        const savedLogo = localStorage.getItem('customLogo');
        if (savedProps) setProperties(JSON.parse(savedProps));
        if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
        if (savedSiteName) setSiteName(savedSiteName);
        if (savedLogo) setCustomLogo(savedLogo);
      }
    });
  }, []);

  useEffect(() => {
    if (dbInitialized) {
      localStorage.setItem('properties', JSON.stringify(properties));
    }
  }, [properties, dbInitialized]);

  useEffect(() => {
    if (dbInitialized) {
      localStorage.setItem('submissions', JSON.stringify(submissions));
    }
  }, [submissions, dbInitialized]);

  useEffect(() => {
    if (dbInitialized) {
      localStorage.setItem('siteName', siteName);
    }
  }, [siteName, dbInitialized]);
  
  useEffect(() => {
    if (dbInitialized) {
        if (customLogo) {
            localStorage.setItem('customLogo', customLogo);
        } else {
            localStorage.removeItem('customLogo');
        }
    }
  }, [customLogo, dbInitialized]);

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setSelectedElement(null);
  };

  const handleNavigateHome = () => {
    setSelectedPropertyId(null);
    setSelectedElement(null);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };
  
  const handleUpdateSection = useCallback((sectionId: string, updatedData: Partial<AnySectionData>) => {
    if (!selectedPropertyId) return;

    setProperties(prev => prev.map(p => {
        if (p.id === selectedPropertyId) {
            const newSections = p.sections.map(s =>
                s.id === sectionId ? { ...s, ...updatedData } : s
            );
            return { ...p, sections: newSections };
        }
        return p;
    }));
  }, [selectedPropertyId]);


  const handleDeleteSection = (sectionId: string) => {
    if (!selectedPropertyId) return;

    setProperties(prev => prev.map(p => {
        if (p.id === selectedPropertyId) {
            const sectionToDelete = p.sections.find(s => s.id === sectionId);
            if (sectionToDelete) {
                // Recursively delete images from section
                Object.values(sectionToDelete).forEach(value => {
                    if (typeof value === 'string' && value.startsWith('blob:')) {
                       deleteImage(value);
                    } else if (Array.isArray(value)) {
                        value.forEach(item => {
                            if(item.url) deleteImage(item.url);
                            if(item.imageUrl) deleteImage(item.imageUrl);
                            if(item.backgroundImageUrl) deleteImage(item.backgroundImageUrl);
                        });
                    }
                });
            }
            return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
        }
        return p;
    }));
    setItemToDelete({});
    setModalState('none');
    setSelectedElement(null);
  };

  const handleAddSection = (sectionType: AnySectionData['type']) => {
    if (!selectedPropertyId) return;

    const property = properties.find(p => p.id === selectedPropertyId);
    if (!property) return;
    
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newSection = createSectionData(sectionType, uniqueSuffix, { 
      coordinates: { lat: 0, lng: 0 } // Placeholder, should be from property
    });

    setProperties(prev => prev.map(p => {
        if (p.id === selectedPropertyId) {
            const newSections = [...p.sections];
            newSections.splice(addSectionIndex, 0, newSection);
            return { ...p, sections: newSections };
        }
        return p;
    }));
    setModalState('none');
  };

  const handleAttemptDeleteSection = (sectionId: string) => {
    setItemToDelete({ sectionId });
    setModalState('confirmDeleteSection');
  };

  const handleLogin = (user: string, pass: string): boolean => {
    // NOTE: Hardcoded credentials. In a real app, use a secure auth system.
    if (user === 'admin' && pass === 'admin') {
      setIsAdminMode(true);
      setModalState('none');
      return true;
    }
    return false;
  };
  
  const handleUpdatePropertyImage = async (propertyId: string, newImageKey: string) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        // Delete the old image if it exists and it's not a placeholder URL
        if (p.mainImageUrl && !p.mainImageUrl.startsWith('https://')) {
          deleteImage(p.mainImageUrl);
        }
        return { ...p, mainImageUrl: newImageKey };
      }
      return p;
    }));
  };
  
  const handleCreateProperty = async (address: string, lat: number, lng: number) => {
      const nearbyPlaces = await generateNearbyPlaces(lat, lng);
      const newProp = createNewProperty(address, {lat, lng}, nearbyPlaces);
      setProperties(prev => [...prev, newProp]);
      toast({
        title: "Propiedad Creada",
        description: `Se ha creado la propiedad "${newProp.name}" en ${address}.`,
      });
  };

  const handleDeleteProperty = async (id: string) => {
      const propToDelete = properties.find(p => p.id === id);
      if (propToDelete) {
          // Delete main image
          if (propToDelete.mainImageUrl && !propToDelete.mainImageUrl.startsWith('https://')) {
              await deleteImage(propToDelete.mainImageUrl);
          }
          // Delete all images within sections
          for (const section of propToDelete.sections) {
              if ('backgroundImageUrl' in section && section.backgroundImageUrl) {
                  await deleteImage(section.backgroundImageUrl);
              }
              if ('images' in section && Array.isArray(section.images)) {
                  for (const img of section.images) {
                      await deleteImage(img.url);
                  }
              }
              // Add more checks for other potential image URLs if needed
          }
      }
      setProperties(prev => prev.filter(p => p.id !== id));
      setItemToDelete({});
      setModalState('none');
  };
  
  const handleContactSubmit = (formData: Omit<ContactSubmission, 'id' | 'propertyId' | 'propertyName' | 'submittedAt'>) => {
    if (!selectedPropertyId) return;

    const property = properties.find(p => p.id === selectedPropertyId);
    if (!property) return;

    const newSubmission: ContactSubmission = {
      ...formData,
      id: `sub-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: property.name,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(prev => [...prev, newSubmission]);
  };
  
  const handleExport = async (selectedIds: Set<string>) => {
     try {
        const propertiesToExport = properties.filter(p => selectedIds.has(p.id));
        const submissionsToExport = submissions.filter(s => selectedIds.has(s.propertyId));
        const jsonString = await exportData(propertiesToExport, submissionsToExport, siteName, customLogo);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'viahogar-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Exportación Exitosa', description: `Se guardaron ${selectedIds.size} propiedades.` });
     } catch (e) {
        console.error('Export failed', e);
        toast({ variant: 'destructive', title: 'Error de Exportación', description: 'No se pudo guardar el archivo.' });
     }
     setModalState('none');
  };
  
  const handleImport = async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const jsonString = event.target?.result as string;
              const { properties: importedProps, submissions: importedSubs, siteName: importedSiteName, customLogo: importedLogo } = await importData(jsonString);

              // Basic validation
              if (!Array.isArray(importedProps)) {
                  throw new Error('El archivo no contiene un array de propiedades válido.');
              }

              // Create a map of existing properties for efficient lookup
              const existingPropsMap = new Map(properties.map(p => [p.id, p]));
              
              // Merge properties: update existing, add new
              const updatedProperties = [...properties];
              importedProps.forEach(importedProp => {
                  if (existingPropsMap.has(importedProp.id)) {
                      // It's an update - find index and replace
                      const index = updatedProperties.findIndex(p => p.id === importedProp.id);
                      if (index !== -1) {
                          updatedProperties[index] = importedProp;
                      }
                  } else {
                      // It's a new property
                      updatedProperties.push(importedProp);
                  }
              });

              setProperties(updatedProperties);
              if (importedSubs) setSubmissions(prev => [...prev, ...importedSubs]);
              if (importedSiteName) setSiteName(importedSiteName);
              if (importedLogo) setCustomLogo(importedLogo);

              toast({ title: 'Importación Exitosa', description: 'Se cargaron los datos desde el archivo.' });
          } catch(e) {
              const error = e as Error;
              console.error('Import failed', error);
              toast({ variant: 'destructive', title: 'Error de Importación', description: error.message || 'No se pudo leer el archivo.' });
          }
      };
      reader.readAsText(file);
  };
  
  const handleUpdateAddress = async (newAddress: string): Promise<void> => {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (!property) return;

      try {
          // This should call a geocoding service and get new coordinates.
          // For now, we'll just update the address.
          const { lat, lng } = await generateNearbyPlaces(0,0);
          const newNearby = await generateNearbyPlaces(lat, lng);

          setProperties(prev => prev.map(p => {
              if (p.id === selectedPropertyId) {
                  const locationSection = p.sections.find(s => s.type === 'location');
                  if (locationSection && locationSection.type === 'location') {
                      locationSection.coordinates = { lat, lng };
                      locationSection.nearbyPlaces = newNearby;
                  }
                  return { ...p, address: newAddress, sections: [...p.sections] };
              }
              return p;
          }));
          toast({ title: "Dirección Actualizada", description: "La dirección y el mapa se han actualizado." });
      } catch (error) {
          console.error("Failed to update address and geocode", error);
          toast({ variant: 'destructive', title: "Error al Actualizar", description: "No se pudo actualizar la dirección." });
      }
  };

  const handleMoveSectionUp = (sectionIndex: number) => {
    if (!selectedPropertyId || sectionIndex === 0) return;
    
    setProperties(prev => prev.map(p => {
      if (p.id === selectedPropertyId) {
        const newSections = [...p.sections];
        const [movedSection] = newSections.splice(sectionIndex, 1);
        newSections.splice(sectionIndex - 1, 0, movedSection);
        return { ...p, sections: newSections };
      }
      return p;
    }));
  };

  const handleMoveSectionDown = (sectionIndex: number) => {
      if (!selectedPropertyId) return;

      const property = properties.find(p => p.id === selectedPropertyId);
      if (!property || sectionIndex >= property.sections.length - 1) return;

      setProperties(prev => prev.map(p => {
          if (p.id === selectedPropertyId) {
              const newSections = [...p.sections];
              const [movedSection] = newSections.splice(sectionIndex, 1);
              newSections.splice(sectionIndex + 1, 0, movedSection);
              return { ...p, sections: newSections };
          }
          return p;
      }));
  };

  if (!isClient) return null; // Render nothing on the server

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  
  const getElementData = () => {
    if (!selectedElement || !selectedProperty) return null;

    const { sectionId, elementKey, subElementId, property } = selectedElement;
    const section = selectedProperty.sections.find(s => s.id === sectionId);
    if (!section) return null;

    if (elementKey === 'style' || elementKey === 'backgroundImageUrl') {
        return { type: 'sectionStyle', data: section.style };
    }
    
    if (elementKey === 'mediaWidth' && section.type === 'imageWithFeatures') {
        return { type: 'imageWithFeatures', data: section };
    }
    
    if (subElementId) {
        const list = (section as any)[elementKey];
        if (Array.isArray(list)) {
            const item = list.find(i => i.id === subElementId);
            if(item) {
                 if (elementKey === 'features') return { type: 'feature', data: item, subElementId, property };
                 if (elementKey === 'amenities') return { type: 'amenity', data: item, subElementId };
                 if (elementKey === 'nearbyPlaces') return { type: 'nearbyPlace', data: item, subElementId };
                 if (elementKey === 'tier') return { type: 'pricingTier', data: item, subElementId };
            }
        }
    }

    const data = (section as any)[elementKey];
    if (data) {
        if ('position' in data) { // It's a DraggableTextData
             return { type: 'draggableText', data };
        }
        if ('text' in data && 'fontSize' in data) { // It's a StyledText
             return { type: 'styledText', data };
        }
        if (elementKey === 'text' && section.type === 'button') {
            return { type: 'button', data: section };
        }
        if (elementKey === 'tier' && section.type === 'pricing') {
             return { type: 'pricingTier', data: (section as PricingSectionData).tier };
        }

    }
    return null;
  }
  
  const elementToEdit = getElementData();
  
  const renderSection = (section: AnySectionData, index: number, totalSections: number) => {
    const sectionProps = {
      key: section.id,
      data: section as any,
      onUpdate: (updatedData: any) => handleUpdateSection(section.id, updatedData),
      onDelete: () => handleAttemptDeleteSection(section.id),
      isAdminMode,
      selectedElement,
      onSelectElement: setSelectedElement,
    };
    
     const fullProps = {
      ...sectionProps,
      isDraggingMode,
      onSetDraggingElement: setDraggingElement,
    };

    const sectionWrapper = (content: React.ReactNode) => (
      <div key={section.id} className="relative group/section">
        {isAdminMode && (
          <div className="absolute top-1/2 -left-12 z-20 flex flex-col gap-1 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleMoveSectionUp(index)}
              disabled={index === 0}
            >
              <Icon name="chevron-up" className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleMoveSectionDown(index)}
              disabled={index === totalSections - 1}
            >
              <Icon name="chevron-down" className="h-5 w-5" />
            </Button>
          </div>
        )}
        {content}
      </div>
    );
    
    switch (section.type) {
      case 'hero': return sectionWrapper(<HeroSection {...fullProps} data={section} isFirstSection={index === 0} />);
      case 'gallery': return sectionWrapper(<GallerySection {...fullProps} data={section} />);
      case 'location': return sectionWrapper(<LocationSection {...sectionProps} data={section} propertyAddress={selectedProperty?.address || ''} onUpdateAddress={handleUpdateAddress}/>);
      case 'amenities': return sectionWrapper(<AmenitiesSection {...sectionProps} data={section} />);
      case 'imageWithFeatures': return sectionWrapper(<ImageWithFeaturesSection {...sectionProps} data={section} />);
      case 'pricing': return sectionWrapper(<PricingSection {...sectionProps} data={section} />);
      case 'contact': return sectionWrapper(<ContactSection {...sectionProps} data={section} onSubmit={handleContactSubmit} />);
      case 'button': return sectionWrapper(<ButtonSection {...sectionProps} data={section} />);
      default: return null;
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode}
        onNavigateHome={handleNavigateHome}
        siteName={siteName}
        onSiteNameChange={setSiteName}
        customLogo={customLogo}
        onLogoUpload={setCustomLogo}
      />
      <main className="flex-grow">
        {selectedProperty ? (
          <div>
            {selectedProperty.sections.map((section, index) => (
              <React.Fragment key={section.id}>
                {renderSection(section, index, selectedProperty.sections.length)}
                {isAdminMode && index < selectedProperty.sections.length - 1 && (
                  <AddSectionControl 
                    index={index + 1} 
                    onClick={(idx) => {
                      setAddSectionIndex(idx);
                      setModalState('addSection');
                    }}
                  />
                )}
              </React.Fragment>
            ))}
             {isAdminMode && selectedProperty.sections.length === 0 && (
                <div className="container mx-auto py-20 text-center">
                    <AddSectionControl index={0} onClick={(idx) => {
                        setAddSectionIndex(idx);
                        setModalState('addSection');
                    }} />
                </div>
            )}
          </div>
        ) : (
          <PropertyList
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onAddProperty={() => setModalState('newProperty')}
            onUpdateProperty={handleUpdateProperty}
            onDeleteProperty={(id) => {
                setItemToDelete({ propertyId: id });
                setModalState('confirmDeleteProperty');
            }}
            onUpdatePropertyImage={handleUpdatePropertyImage}
            isAdminMode={isAdminMode}
          />
        )}
      </main>
      <Footer onAdminLoginClick={() => setModalState('login')} />

      {/* Modals */}
      {modalState === 'login' && <AdminLoginModal onLogin={handleLogin} onClose={() => setModalState('none')} />}
      {modalState === 'newProperty' && <NewPropertyModal onCreate={handleCreateProperty} onClose={() => setModalState('none')} />}
      {modalState === 'addSection' && <AddSectionModal onClose={() => setModalState('none')} onSelect={handleAddSection} />}
      {modalState === 'confirmDeleteProperty' && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState('none')}
          onConfirm={() => handleDeleteProperty(itemToDelete.propertyId!)}
          title="¿Estás seguro?"
          message="Esta acción eliminará permanentemente la propiedad y todo su contenido. No se puede deshacer."
        />
      )}
      {modalState === 'confirmDeleteSection' && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModalState('none')}
          onConfirm={() => handleDeleteSection(itemToDelete.sectionId!)}
          title="¿Eliminar Sección?"
          message="¿Estás seguro de que quieres eliminar esta sección? Esta acción es permanente."
        />
      )}
       {modalState === 'contact' && selectedProperty && (
            <ContactModal
                isOpen={true}
                onClose={() => setModalState('none')}
                onSubmit={handleContactSubmit}
                property={selectedProperty}
            />
        )}
       {modalState === 'submissions' && selectedProperty && (
            <SubmissionsModal
                isOpen={true}
                onClose={() => setModalState('none')}
                submissions={submissions.filter(s => s.propertyId === selectedProperty.id)}
            />
        )}
        {modalState === 'export' && (
             <ExportModal
                isOpen={true}
                onClose={() => setModalState('none')}
                properties={properties}
                onExport={handleExport}
            />
        )}
        

      {/* Editing Toolbar */}
      {isAdminMode && elementToEdit && (
        <EditingToolbar
          key={selectedElement ? `${selectedElement.sectionId}-${selectedElement.elementKey}-${selectedElement.subElementId}`: ''}
          element={elementToEdit}
          onUpdate={(updates) => {
             if (!selectedElement || !selectedProperty) return;
             const { sectionId, elementKey, subElementId, property } = selectedElement;

            if (elementKey === 'style') {
                 handleUpdateSection(sectionId, { style: { ...elementToEdit.data, ...updates } });
            } else if (elementKey === 'backgroundImageUrl') {
                handleUpdateSection(sectionId, { backgroundImageUrl: updates.backgroundImageUrl });
            } else if (elementKey === 'mediaWidth' && elementToEdit.type === 'imageWithFeatures') {
                handleUpdateSection(sectionId, { mediaWidth: updates.mediaWidth });
            }
             else if (elementKey === 'text' && elementToEdit.type === 'button') {
                handleUpdateSection(sectionId, { text: updates.text, alignment: updates.alignment, linkTo: updates.linkTo });
             } else if (subElementId && (elementToEdit.type === 'feature' || elementToEdit.type === 'amenity' || elementToEdit.type === 'nearbyPlace')) {
                 const section = selectedProperty.sections.find(s => s.id === sectionId) as any;
                 const list = section[elementKey] as any[];
                 const newList = list.map(item => item.id === subElementId ? {...item, ...updates} : item);
                 handleUpdateSection(sectionId, { [elementKey]: newList });
             } else if (elementToEdit.type === 'pricingTier' && subElementId) {
                const section = selectedProperty.sections.find(s => s.id === sectionId) as PricingSectionData;
                const newTier = { ...section.tier, ...updates };
                handleUpdateSection(sectionId, { tier: newTier });
             } else if (elementToEdit.type === 'draggableText' || elementToEdit.type === 'styledText' || (elementToEdit.type === 'pricingTier' && property)) {
                
                let targetObjectKey: string = elementKey;
                let targetObject: any = (selectedProperty.sections.find(s => s.id === sectionId) as any);
                
                if(elementToEdit.type === 'pricingTier' && subElementId && property) {
                    targetObject = (targetObject.tier as any);
                    targetObjectKey = property as string;
                }

                const updatedObject = { ...targetObject[targetObjectKey], ...updates };
                handleUpdateSection(sectionId, { [targetObjectKey]: updatedObject });
            }
          }}
          onClose={() => setSelectedElement(null)}
        />
      )}
      
       {isAdminMode && selectedPropertyId && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
           <Button onClick={() => setModalState('submissions')} variant="outline" size="sm">
               <Icon name="list" className="mr-2" />
               Ver Contactos ({submissions.filter(s => s.propertyId === selectedPropertyId).length})
           </Button>
        </div>
      )}

      {isAdminMode && (
          <AdminToolbar onExportClick={() => setModalState('export')} onImport={handleImport} />
      )}
    </div>
  );
}

    