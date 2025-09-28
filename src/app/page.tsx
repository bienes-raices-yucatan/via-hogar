"use client";

import { useState, useEffect } from 'react';
import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import { initialProperties, initialSiteName, initialLogo } from '@/lib/data';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

import Footer from '@/components/layout/footer';
import PropertyList from '@/components/property-list';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/spinner';
import SectionRenderer from '@/components/sections';
import AdminToolbar from '@/components/toolbars/admin-toolbar';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siteName, setSiteName] = useState('Vía Hogar');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  // Editing state
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  
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
    }
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setIsDraggingMode(false);
  };
  
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };
  
  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(prevProperties => prevProperties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const handleAddNewProperty = () => {
    try {
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
            title: { text: "Bienvenido a tu Nueva Propiedad", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#ffffff', fontFamily: 'Playfair Display' },
            subtitle: { text: 'Empieza a personalizar esta página.', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#e2e8f0', fontFamily: 'Roboto' },
            buttonText: 'Contactar',
            parallaxEnabled: true,
          }
        ]
      };
      
      setProperties(prevProperties => [...prevProperties, newProperty]);
      setSelectedPropertyId(newProperty.id);
    } catch (error) {
      console.error(error);
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
            return;
    }
    
    const updatedProperty = { ...property, sections: [...property.sections, newSection] };
    handleUpdateProperty(updatedProperty);
  };
  
  const handleUpdateLogo = async (file: File) => {
    try {
        const key = `logo-${uuidv4()}`;
        await db.saveImage(key, file);
        localStorage.setItem('logoKey', key);
        setLogoUrl(URL.createObjectURL(file));
    } catch (error) {
        console.error("Failed to update logo:", error);
    }
  };
  
  const handleContactSubmit = (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: ContactSubmission = {
      ...submission,
      id: uuidv4(),
      submittedAt: new Date().toISOString(),
    };
    setContactSubmissions(prevSubmissions => [...prevSubmissions, newSubmission]);
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
    <div className={`min-h-screen bg-background font-body text-slate-800 flex flex-col ${isAdminMode ? 'admin-mode' : ''}`}>
      <main className="flex-grow">
        {selectedProperty ? (
          <div>
            <SectionRenderer
              property={selectedProperty}
              updateProperty={handleUpdateProperty}
              isAdminMode={isAdminMode}
              isDraggingMode={isDraggingMode}
              setSelectedElement={() => {}}
              onContactSubmit={handleContactSubmit}
              siteName={siteName}
              setSiteName={setSiteName}
              logoUrl={logoUrl}
              setLogoUrl={handleUpdateLogo}
              onLogout={handleLogout}
              onNavigateHome={() => setSelectedPropertyId(null)}
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
              onAddNew={handleAddNewProperty}
            />
          </div>
        )}
      </main>
      
      <Footer onLogin={handleLogin} isAdminMode={isAdminMode} />

      {isAdminMode && selectedProperty && <AdminToolbar isDraggingMode={isDraggingMode} onToggleDragMode={() => setIsDraggingMode(!isDraggingMode)} onAddSection={handleAddSection} />}
    </div>
  );
}
