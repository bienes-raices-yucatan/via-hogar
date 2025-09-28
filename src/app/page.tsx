'use client';
import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Footer from '@/components/layout/footer';
import PropertyList from '@/components/property-list';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/spinner';
import SectionRenderer from '@/components/sections';
import AdminToolbar from '@/components/toolbars/admin-toolbar';
import EditingToolbar from '@/components/toolbars/editing-toolbar';
import ConfirmationModal from '@/components/modals/confirmation-modal';
import Header from '@/components/layout/header';

import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import { initialProperties } from '@/lib/data';
import { db } from '@/lib/db';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Editing state
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('Vía Hogar');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let props = await db.properties.toArray();
        if (props.length === 0) {
          await db.properties.bulkAdd(initialProperties);
          props = await db.properties.toArray();
        }
        setProperties(props);

        const savedSiteName = await db.getItem('siteName');
        if (savedSiteName) setSiteName(savedSiteName);

        const savedLogoUrl = await db.getItem('logoUrl');
        if (savedLogoUrl) setLogoUrl(savedLogoUrl);

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminMode(true);
    }
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setIsDraggingMode(false);
    setSelectedElement(null);
  };
  
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };
  
  const handleUpdateProperty = async (updatedProperty: Property) => {
    try {
      await db.properties.put(updatedProperty);
      setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  const handleAddNewProperty = async () => {
    const newProperty: Property = {
      id: uuidv4(),
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
              position: { x: 50, y: 40 }
            }
          ]
        }
      ],
      createdAt: new Date(),
    };
    
    try {
        await db.properties.add(newProperty);
        setProperties(prev => [...prev, newProperty]);
        setSelectedPropertyId(newProperty.id);
    } catch (error) {
        console.error("Failed to add new property:", error);
    }
  };

  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      await db.properties.delete(propertyToDelete);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete));
      if (selectedPropertyId === propertyToDelete) {
        setSelectedPropertyId(null);
      }
      setPropertyToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  };

  const handleAddSection = (sectionType: AnySectionData['type']) => {
    const property = properties.find(p => p.id === selectedPropertyId);
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
            newSection = { id: sectionId, type: 'CONTACT', style: {backgroundColor: '#ffffff'}, title: {text: '¿Te interesa la casa para ti o eres vendedor inmobiliario?', fontSize: 2, color: '#1E293B', fontFamily: 'Montserrat'}, buttonText: 'Enviar' };
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
  
  const handleUpdateLogo = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    setLogoUrl(dataUrl);
    await db.setItem('logoUrl', dataUrl);
  };
  
  const handleUpdateSiteName = async (newName: string) => {
    setSiteName(newName);
    await db.setItem('siteName', newName);
  }

  const handleContactSubmit = (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => {
    // In a real app, this would submit to a backend.
    console.log('Contact submission:', submission);
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over) return;
    
    const property = properties.find(p => p.id === selectedPropertyId);
    if (!property) return;
    
    // Handle Section reordering
    if (active.id.toString().startsWith('section-') && over.id.toString().startsWith('section-')) {
        if (active.id !== over.id) {
          const oldIndex = property.sections.findIndex(s => `section-${s.id}` === active.id);
          const newIndex = property.sections.findIndex(s => `section-${s.id}` === over.id);
          
          const updatedSections = arrayMove(property.sections, oldIndex, newIndex);
          handleUpdateProperty({ ...property, sections: updatedSections });
        }
    }
    
    // Handle Draggable Text reordering
    if (active.id.toString().startsWith('text-')) {
        const { delta } = event;
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

        handleUpdateProperty({ ...property, sections: updatedSections });
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`min-h-screen bg-background font-body text-slate-800 flex flex-col ${isAdminMode ? 'admin-mode' : ''}`}>
        <Header 
            siteName={siteName}
            setSiteName={handleUpdateSiteName}
            logoUrl={logoUrl}
            setLogoUrl={handleUpdateLogo}
            isAdminMode={isAdminMode}
            onLogout={handleLogout}
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
                properties={properties}
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
            properties={properties}
            selectedPropertyId={selectedPropertyId}
          />
        )}
        
        <Footer onAdminLogin={handleAdminLogin} />

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

// Helper function to convert file to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

    