"use client";

import { useState, useEffect } from 'react';
import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import { geocodeAddress } from '@/ai/flows/geocode-address';
import { generateNearbyPlaces } from '@/ai/flows/generate-nearby-places';
import { initialProperties, initialSiteName, initialLogo } from '@/lib/data';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PropertyList from '@/components/property-list';
import AdminLoginModal from '@/components/modals/admin-login-modal';
import AddSectionModal from '@/components/modals/add-section-modal';
import NewPropertyModal from '@/components/modals/new-property-modal';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/spinner';
import SectionRenderer from '@/components/sections';
import AdminToolbar from '@/components/toolbars/admin-toolbar';
import EditingToolbar from '@/components/toolbars/editing-toolbar';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siteName, setSiteName] = useState('Vía Hogar');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  // Editing state
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      await db.initDB();
      
      const storedProperties = localStorage.getItem('properties');
      const storedSiteName = localStorage.getItem('siteName');
      const storedLogoKey = localStorage.getItem('logoKey');
      const storedSubmissions = localStorage.getItem('contactSubmissions');

      if (storedProperties) {
        setProperties(JSON.parse(storedProperties));
      } else {
        setProperties(initialProperties);
        localStorage.setItem('properties', JSON.stringify(initialProperties));
      }

      if (storedSiteName) {
        setSiteName(storedSiteName);
      } else {
        setSiteName(initialSiteName);
        localStorage.setItem('siteName', initialSiteName);
      }

      if (storedLogoKey) {
        const logo = await db.getImage(storedLogoKey);
        if (logo) setLogoUrl(URL.createObjectURL(logo));
      } else {
        // For initial load, we don't have a blob, so we just use the public path
        setLogoUrl(initialLogo);
      }

      if (storedSubmissions) {
        setContactSubmissions(JSON.parse(storedSubmissions));
      }

      setIsLoading(false);
    };

    loadData();
  }, []);
  
  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('properties', JSON.stringify(properties));
    }
  }, [properties, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('siteName', siteName);
      document.title = siteName;
    }
  }, [siteName, isLoading]);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));
    }
  }, [contactSubmissions, isLoading]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAdminMode(true);
      setIsLoginModalOpen(false);
      toast({ title: "Modo Administrador Activado" });
    } else {
      toast({ title: "Error", description: "Usuario o contraseña incorrectos.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setSelectedElement(null);
    setIsDraggingMode(false);
    toast({ title: "Has salido del modo administrador." });
  };
  
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };
  
  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const handleAddNewProperty = async (address: string) => {
    setIsNewPropertyModalOpen(false);
    setIsLoading(true);
    try {
      const coords = await geocodeAddress({ address });
      const nearbyPlaces = await generateNearbyPlaces({ latitude: coords.latitude, longitude: coords.longitude });
      
      const newProperty: Property = {
        id: uuidv4(),
        name: `Propiedad en ${address.split(',')[0]}`,
        address,
        price: 500000,
        mainImageUrl: 'https://picsum.photos/seed/newprop/800/600',
        coordinates: { lat: coords.latitude, lng: coords.longitude },
        sections: [
          {
            id: uuidv4(),
            type: 'HERO',
            style: { backgroundColor: '#ffffff' },
            imageUrl: 'https://picsum.photos/seed/newhero/1920/1080',
            title: { id: uuidv4(), text: 'Bienvenido a tu Nuevo Hogar', fontSize: '48px', color: '#1E293B', fontFamily: 'Montserrat', position: { x: 50, y: 40 } },
            floatingTexts: [],
          },
          {
            id: uuidv4(),
            type: 'LOCATION',
            style: { backgroundColor: '#F9FAFA' },
            coordinates: { lat: coords.latitude, lng: coords.longitude },
            nearbyPlaces: nearbyPlaces.map(p => ({...p, id: uuidv4()})),
          }
        ],
      };
      setProperties([...properties, newProperty]);
      setSelectedPropertyId(newProperty.id);
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo crear la propiedad.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
    if (selectedPropertyId === id) {
      setSelectedPropertyId(null);
    }
  };

  const handleAddSection = (sectionType: AnySectionData['type']) => {
    const property = properties.find(p => p.id === selectedPropertyId);
    if (!property) return;

    let newSection: AnySectionData;
    const sectionId = uuidv4();

    // Default data for new sections
    switch (sectionType) {
        // Add cases for other section types here
        case 'GALLERY':
            newSection = { id: sectionId, type: 'GALLERY', style: {backgroundColor: '#ffffff'}, images: [{id: uuidv4(), url: 'https://picsum.photos/seed/gallery1/800/600', title: 'Nueva Imagen'}] };
            break;
        case 'AMENITIES':
            newSection = { id: sectionId, type: 'AMENITIES', style: {backgroundColor: '#F9FAFA'}, title: 'Comodidades', amenities: [{id: uuidv4(), icon: 'Bed', text: 'Habitaciones'}] };
            break;
        // ... other cases
        default:
             toast({ title: "Error", description: "Tipo de sección no válido.", variant: "destructive" });
            return;
    }
    
    const updatedProperty = { ...property, sections: [...property.sections, newSection] };
    handleUpdateProperty(updatedProperty);
    setIsAddSectionModalOpen(false);
  };
  
  const handleUpdateLogo = async (file: File) => {
    const key = `logo-${uuidv4()}`;
    await db.saveImage(key, file);
    localStorage.setItem('logoKey', key);
    setLogoUrl(URL.createObjectURL(file));
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className={`min-h-screen bg-background font-body text-slate-800 ${isAdminMode ? 'admin-mode' : ''}`}>
      <Header
        siteName={siteName}
        setSiteName={setSiteName}
        logoUrl={logoUrl}
        setLogoUrl={handleUpdateLogo}
        isAdminMode={isAdminMode}
        onLogout={handleLogout}
        onNavigateHome={() => setSelectedPropertyId(null)}
      />

      <main className="container mx-auto px-4 py-8">
        {selectedProperty ? (
          <div>
            {isAdminMode && (
              <div className="mb-4 flex justify-between items-center">
                <Button variant="outline" onClick={() => setSelectedPropertyId(null)}>
                  &larr; Volver al Listado
                </Button>
                <Button onClick={() => setIsAddSectionModalOpen(true)}>Añadir Sección</Button>
              </div>
            )}
            <SectionRenderer
              property={selectedProperty}
              updateProperty={handleUpdateProperty}
              isAdminMode={isAdminMode}
              isDraggingMode={isDraggingMode}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
            />
          </div>
        ) : (
          <PropertyList
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onDeleteProperty={handleDeleteProperty}
            onUpdateProperty={handleUpdateProperty}
            isAdminMode={isAdminMode}
            onAddNew={() => setIsNewPropertyModalOpen(true)}
          />
        )}
      </main>
      
      <Footer onAdminClick={() => setIsLoginModalOpen(true)} />

      {isAdminMode && <AdminToolbar isDraggingMode={isDraggingMode} onToggleDragMode={() => setIsDraggingMode(!isDraggingMode)} />}
      
      {isAdminMode && selectedElement && (
        <EditingToolbar
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          updateProperty={handleUpdateProperty}
          properties={properties}
          selectedPropertyId={selectedPropertyId}
        />
      )}

      <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      {isAdminMode && <NewPropertyModal isOpen={isNewPropertyModalOpen} onClose={() => setIsNewPropertyModalOpen(false)} onSubmit={handleAddNewProperty} />}
      {isAdminMode && selectedPropertyId && <AddSectionModal isOpen={isAddSectionModalOpen} onClose={() => setIsAddSectionModalOpen(false)} onAddSection={handleAddSection} />}
    </div>
  );
}
