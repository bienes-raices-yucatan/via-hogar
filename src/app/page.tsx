
'use client';
import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

import Footer from '@/components/layout/footer';
import PropertyList from '@/components/property-list';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/spinner';
import SectionRenderer from '@/components/sections';
import AdminToolbar from '@/components/toolbars/admin-toolbar';
import EditingToolbar from '@/components/toolbars/editing-toolbar';
import ConfirmationModal from '@/components/modals/confirmation-modal';
import Header from '@/components/layout/header';

import { Property, AnySectionData, ContactSubmission, SiteConfig } from '@/lib/types';
import { initialProperties, initialSiteConfig } from '@/lib/data';
import { useFirestore, useCollection, useDoc, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const propertiesRef = useMemoFirebase(() => collection(firestore, 'properties'), [firestore]);
  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesRef);
  
  const siteConfigRef = useMemoFirebase(() => doc(firestore, 'config', 'site'), [firestore]);
  const { data: siteConfig, isLoading: isLoadingSiteConfig } = useDoc<SiteConfig>(siteConfigRef);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [localProperties, setLocalProperties] = useState<Property[] | null>(null);

  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    if (properties) {
      setLocalProperties(properties);
    }
  }, [properties]);

  useEffect(() => {
    const seedData = async () => {
      if (isUserLoading || !auth) return;
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
          return;
        }
      }

      if (!isLoadingProperties && properties && properties.length === 0 && propertiesRef) {
        console.log("Seeding initial properties...");
        const batch = writeBatch(firestore);
        initialProperties.forEach(propData => {
          const propRef = doc(propertiesRef);
          batch.set(propRef, { ...propData, createdAt: serverTimestamp() });
        });
        await batch.commit();
      }
      
      if (!isLoadingSiteConfig && siteConfig === null && siteConfigRef) {
        console.log("Seeding initial site config...");
        await setDocumentNonBlocking(siteConfigRef, initialSiteConfig);
      }
    };

    if (!isLoadingProperties && !isLoadingSiteConfig && !isUserLoading) {
      seedData();
    }
  }, [properties, siteConfig, isLoadingProperties, isLoadingSiteConfig, firestore, propertiesRef, siteConfigRef, auth, user, isUserLoading]);

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };
  
  const handleUpdateProperty = async (updatedProperty: Property) => {
    if (!firestore) return;
    const propRef = doc(firestore, 'properties', updatedProperty.id);
    updateDocumentNonBlocking(propRef, updatedProperty);
  };
  
  const handleLocalUpdateProperty = (updatedProperty: Property) => {
    setLocalProperties(prev => prev ? prev.map(p => p.id === updatedProperty.id ? updatedProperty : p) : null);
  };

  const handleUpdateSection = (sectionId: string, sectionData: Partial<AnySectionData>) => {
    const property = localProperties?.find(p => p.id === selectedPropertyId);
    if (!property) return;

    const updatedSections = property.sections.map(s => 
        s.id === sectionId ? { ...s, ...sectionData } : s
    );
    const updatedProperty = { ...property, sections: updatedSections };
    
    handleUpdateProperty(updatedProperty);
  };


  const handleAddNewProperty = async () => {
    if (!propertiesRef) return;
    const newProperty: Omit<Property, 'id' | 'createdAt'> = {
      name: "Nueva Propiedad",
      address: "Dirección de la nueva propiedad",
      price: 0,
      mainImageUrl: 'https://picsum.photos/seed/newprop/800/600',
      coordinates: { lat: 0, lng: 0 },
      sections: [
        {
          id: uuidv4(),
          type: 'HERO',
          style: { backgroundColor: '#e0f2fe' },
          imageUrl: 'https://picsum.photos/seed/newhero/1920/1080',
          buttonText: 'Contáctanos',
          parallaxEnabled: true,
          height: '75vh',
          borderRadius: '3rem',
          draggableTexts: [
            {
              id: uuidv4(),
              text: 'Elegancia y confort: Una casa diseñada para quienes buscan lo mejor.',
              fontSize: 4,
              color: '#ffffff',
              fontFamily: 'Playfair Display',
              position: { x: 50, y: 40 },
              width: 500,
              height: 100,
            }
          ]
        }
      ],
    };
    
    const newDocRef = await addDocumentNonBlocking(propertiesRef, newProperty as any);
    if(newDocRef) {
      setSelectedPropertyId(newDocRef.id);
    }
  };

  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete || !propertiesRef) return;
    const propRef = doc(firestore, 'properties', propertyToDelete);
    deleteDocumentNonBlocking(propRef);
    if (selectedPropertyId === propertyToDelete) {
      setSelectedPropertyId(null);
    }
    setPropertyToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddSection = (sectionType: AnySectionData['type']) => {
    const property = localProperties?.find(p => p.id === selectedPropertyId);
    if (!property) return;

    let newSection: AnySectionData;
    const sectionId = uuidv4();

    switch (sectionType) {
        case 'IMAGE_WITH_FEATURES':
            newSection = { id: sectionId, type: 'IMAGE_WITH_FEATURES', style: {backgroundColor: '#ffffff'}, media: { type: 'image', url: 'https://picsum.photos/seed/newfeatures/800/1000' }, features: [{id: uuidv4(), icon: 'Home', title: 'Característica Principal', subtitle: 'Descripción de la característica.' }] };
            break;
        case 'GALLERY':
            newSection = { id: sectionId, type: 'GALLERY', style: {backgroundColor: '#ffffff'}, title: 'Galería de Imágenes', images: [{id: uuidv4(), url: 'https://picsum.photos/seed/gallery1/800/600', title: 'Nueva Imagen'}] };
            break;
        case 'AMENITIES':
            newSection = { id: sectionId, type: 'AMENITIES', style: {backgroundColor: '#F9FAFA'}, title: 'Comodidades', amenities: [{id: uuidv4(), icon: 'BedDouble', text: 'Habitaciones'}] };
            break;
        case 'LOCATION':
            newSection = { id: sectionId, type: 'LOCATION', style: {backgroundColor: '#ffffff'}, coordinates: property.coordinates, nearbyPlaces: [] };
            break;
        case 'CONTACT':
            newSection = {
              id: sectionId,
              type: 'CONTACT',
              style: { backgroundColor: '#ffffff' },
              title: {
                text: 'Completa y envía el formulario para contactarte.',
                fontSize: 2,
                color: '#1E293B',
                fontFamily: 'Montserrat',
              },
              subtitle: {
                text: 'Resolveremos tus dudas y podrás agendar una visita.',
                fontSize: 1.1,
                color: '#475569',
                fontFamily: 'Roboto',
              },
              buttonText: 'Enviar',
            };
            break;
        case 'PRICING':
            newSection = { id: sectionId, type: 'PRICING', style: {backgroundColor: '#f8fafc'}, icon: 'Home', title: 'Precio de la propiedad', price: '5,500,000 MDP', originalPrice: '6,500,000 MDP', subtitle: 'Lista para escriturar y con entrega inmediata.', buttonText: 'ME INTERESA' };
            break;
        case 'BANNER':
            newSection = {
              id: sectionId,
              type: 'BANNER',
              style: { backgroundColor: '#000000' },
              imageUrl: 'https://picsum.photos/seed/newbanner/1920/600',
              buttonText: 'Llamada a la acción',
              parallaxEnabled: true,
              height: '50vh',
              borderRadius: '3rem',
              draggableTexts: []
            };
            break;
        default:
            return;
    }
    
    const updatedProperty = { ...property, sections: [...property.sections, newSection] };
    handleUpdateProperty(updatedProperty);
  };
  
  const handleUpdateLogo = async (newLogoUrl: string) => {
    if (!siteConfigRef) return;
    updateDocumentNonBlocking(siteConfigRef, { logoUrl: newLogoUrl });
  };
  
  const handleUpdateSiteName = async (newName: string) => {
    if (!siteConfigRef) return;
    updateDocumentNonBlocking(siteConfigRef, { siteName: newName });
  }

  const handleContactSubmit = (submission: Omit<ContactSubmission, 'id' | 'propertyId' | 'submittedAt'>) => {
    if (!selectedPropertyId) return;
    const submissionsRef = collection(firestore, 'contactSubmissions');
    addDocumentNonBlocking(submissionsRef, { ...submission, propertyId: selectedPropertyId, submittedAt: serverTimestamp() });
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
  };
  
   const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event;
    if (!localProperties) return;

    const property = localProperties.find(p => p.id === selectedPropertyId);
    if (!property) return;
    
    if (active.id.toString().startsWith('text-')) {
        const [_, sectionId, textId] = active.id.toString().split('-');

        const updatedSections = property.sections.map(section => {
            if (section.id === sectionId && 'draggableTexts' in section && section.draggableTexts) {
                const updatedTexts = section.draggableTexts.map(text => {
                    if (text.id === textId) {
                      const container = document.querySelector(`.draggable-text-container[data-section-id="${section.id}"]`);
                      if (container) {
                          const containerRect = container.getBoundingClientRect();
                          const newX = text.position.x + (delta.x / containerRect.width) * 100;
                          const newY = text.position.y + (delta.y / containerRect.height) * 100;
                          return { ...text, position: { x: newX, y: newY } };
                      }
                    }
                    return text;
                });
                return { ...section, draggableTexts: updatedTexts };
            }
            return section;
        });

        handleLocalUpdateProperty({ ...property, sections: updatedSections as AnySectionData[] });
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || !localProperties) return;
    
    const property = localProperties.find(p => p.id === selectedPropertyId);
    if (!property) return;
    
    if (active.id.toString().startsWith('section-') && over.id.toString().startsWith('section-')) {
        if (active.id !== over.id) {
          const oldIndex = property.sections.findIndex(s => `section-${s.id}` === active.id);
          const newIndex = property.sections.findIndex(s => `section-${s.id}` === over.id);
          
          const updatedSections = arrayMove(property.sections, oldIndex, newIndex);
          handleUpdateProperty({ ...property, sections: updatedSections });
        }
    } else if (active.id.toString().startsWith('text-')) {
        const finalPropertyState = localProperties.find(p => p.id === selectedPropertyId);
        if (finalPropertyState) {
          handleUpdateProperty(finalPropertyState);
        }
    }
  }
  
  if (isLoadingProperties || isLoadingSiteConfig || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const selectedProperty = localProperties?.find(p => p.id === selectedPropertyId);
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
    >
      <div className={`min-h-screen bg-background font-body text-slate-800 flex flex-col ${isAdminMode ? 'admin-mode' : ''}`}>
        <Header 
            siteName={siteConfig?.siteName || ''}
            setSiteName={handleUpdateSiteName}
            logoUrl={siteConfig?.logoUrl || '/logo.svg'}
            setLogoUrl={handleUpdateLogo}
            isAdminMode={isAdminMode}
            onLogout={() => setIsAdminMode(false)}
          />
        <main className="flex-grow pt-20">
          {selectedProperty ? (
            <div>
                <SortableContext
                  items={selectedProperty.sections.map(s => `section-${s.id}`)}
                  strategy={verticalListSortingStrategy}
                  disabled={!isDraggingMode}
                >
                   <SectionRenderer
                      property={selectedProperty}
                      updateProperty={handleUpdateProperty}
                      updateSection={handleUpdateSection}
                      isAdminMode={isAdminMode}
                      isDraggingMode={isDraggingMode}
                      selectedElement={selectedElement}
                      setSelectedElement={setSelectedElement}
                      onContactSubmit={handleContactSubmit}
                      onNavigateHome={() => setSelectedPropertyId(null)}
                    />
                </SortableContext>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8">
              <PropertyList
                properties={localProperties || []}
                onSelectProperty={handleSelectProperty}
                onDeleteProperty={handleDeleteProperty}
                onUpdateProperty={handleUpdateProperty}
                isAdminMode={isAdminMode}
                onAddNew={handleAddNewProperty}
              />
            </div>
          )}
        </main>
        
        {isAdminMode && selectedElement && (
          <EditingToolbar 
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            updateProperty={handleUpdateProperty}
            properties={localProperties || []}
            selectedPropertyId={selectedPropertyId}
          />
        )}
        
        <Footer onAdminLogin={() => setIsAdminMode(true)} />

        {isAdminMode && selectedProperty && (
          <AdminToolbar 
              onAddSection={handleAddSection} 
              isDraggingMode={isDraggingMode}
              onToggleDragMode={() => setIsDraggingMode(prev => !prev)}
          />
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteProperty}
          title="¿Estás seguro?"
          description="Esta acción no se puede deshacer. Esto eliminará permanentemente la propiedad."
        />
      </div>
    </DndContext>
  );
}
