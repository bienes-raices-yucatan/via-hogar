"use client";

import { useState, useEffect } from 'react';
import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
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
      }

      if (storedSiteName) {
        setSiteName(storedSiteName);
      } else {
        setSiteName(initialSiteName);
      }

      if (storedLogoKey) {
        const logo = await db.getImage(storedLogoKey);
        if (logo) setLogoUrl(URL.createObjectURL(logo));
      } else {
        setLogoUrl(initialLogo);
      }

      if (storedSubmissions) {
        setContactSubmissions(JSON.parse(storedSubmissions));
      }

      setIsLoading(false);
    };

    loadData();
  }, []);
  
  // Persist data to localStorage whenever it changes
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
    setProperties(prevProperties => prevProperties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const handleAddNewProperty = (newPropertyData: { name: string, address: string, price: number, lat: number, lng: number }) => {
    setIsNewPropertyModalOpen(false);
    try {
      const { name, address, price, lat, lng } = newPropertyData;
      
      const newProperty: Property = {
        id: uuidv4(),
        name,
        address,
        price,
        mainImageUrl: 'https://picsum.photos/seed/newprop/800/600',
        coordinates: { lat, lng },
        sections: [
          {
            id: uuidv4(),
            type: 'HERO',
            style: { backgroundColor: '#e0f2fe' },
            imageUrl: 'https://picsum.photos/seed/newhero/1920/1080',
            title: { text: `Bienvenido a ${name}`, fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#ffffff', fontFamily: 'Playfair Display' },
            subtitle: { text: 'Una nueva propiedad increíble te espera.', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#e2e8f0', fontFamily: 'Roboto' },
            buttonText: 'Contactar',
            parallaxEnabled: true,
          }
        ]
      };
      
      setProperties(prevProperties => [...prevProperties, newProperty]);
      setSelectedPropertyId(newProperty.id);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear la propiedad.", variant: "destructive" });
    }
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(prevProperties => prevProperties.filter(p => p.id !== id));
    if (selectedPropertyId === id) {
      setSelectedPropertyId(null);
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
            newSection = { id: sectionId, type: 'CONTACT', style: {backgroundColor: '#e0f2fe'}, imageUrl: 'https://picsum.photos/seed/newcontact/1920/1080', title: {text: '¿Interesado?', fontSize: '36px', color: '#1E293B', fontFamily: 'Montserrat'}, subtitle: {text: 'Ponte en contacto con nosotros.', fontSize: '18px', color: '#475569', fontFamily: 'Roboto'}, buttonText: 'Enviar Mensaje', parallaxEnabled: false };
            break;
        case 'PRICING':
            newSection = { id: sectionId, type: 'PRICING', style: {backgroundColor: '#F9FAFA'}, title: 'Planes de Precios', tiers: [{id: uuidv4(), name: 'Básico', price: '$100', frequency: '/mes', features: ['Característica 1', 'Característica 2'], buttonText: 'Seleccionar', isFeatured: false }] };
            break;
        default:
             toast({ title: "Error", description: "Tipo de sección no válido.", variant: "destructive" });
            return;
    }
    
    const updatedProperty = { ...property, sections: [...property.sections, newSection] };
    handleUpdateProperty(updatedProperty);
    setIsAddSectionModalOpen(false);
  };
  
  const handleUpdateLogo = async (file: File) => {
    try {
        const key = `logo-${uuidv4()}`;
        await db.saveImage(key, file);
        localStorage.setItem('logoKey', key);
        setLogoUrl(URL.createObjectURL(file));
    } catch (error) {
        console.error("Failed to update logo:", error);
        toast({ title: "Error", description: "No se pudo actualizar el logo.", variant: "destructive" });
    }
  };
  
  const handleContactSubmit = (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ContactSubmission = {
      ...submission,
      id: uuidv4(),
      submittedAt: new Date().toISOString(),
    };
    setContactSubmissions(prevSubmissions => [...prevSubmissions, newSubmission]);
    toast({ title: "Mensaje Enviado", description: "Gracias por tu interés. Nos pondremos en contacto contigo pronto." });
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

      <main>
        {selectedProperty ? (
          <div>
            {isAdminMode && (
              <div className="container mx-auto px-4 py-4 flex justify-between items-center sticky top-[65px] bg-background/80 backdrop-blur-sm z-30">
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
              onContactSubmit={handleContactSubmit}
            />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <PropertyList
              properties={properties}
              onSelectProperty={handleSelectProperty}
              onDeleteProperty={handleDeleteProperty}
              onUpdateProperty={handleUpdateProperty}
              isAdminMode={isAdminMode}
              onAddNew={() => setIsNewPropertyModalOpen(true)}
            />
          </div>
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
