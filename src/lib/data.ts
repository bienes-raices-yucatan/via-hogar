import { Property } from './types';
import { v4 as uuidv4 } from 'uuid';

export const initialSiteName = 'Vía Hogar';
export const initialLogo = '/logo.svg';

export const initialProperties: Property[] = [
  {
    id: 'prop1',
    name: 'Villa Moderna con Vista al Mar',
    address: '123 Ocean Drive, Miami, FL',
    price: 3500000,
    mainImageUrl: 'https://picsum.photos/seed/prop1/800/600',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    sections: [
      {
        id: uuidv4(),
        type: 'HERO',
        style: { backgroundColor: '#e0f2fe' },
        imageUrl: 'https://picsum.photos/seed/hero1/1920/1080',
        title: { id: uuidv4(), text: 'Un Oasis de Lujo y Tranquilidad', fontSize: '52px', color: '#0c4a6e', fontFamily: 'Playfair Display', position: { x: 50, y: 50 } },
        floatingTexts: [],
        useParallax: true,
      },
      {
        id: uuidv4(),
        type: 'GALLERY',
        style: { backgroundColor: '#ffffff' },
        images: [
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1a/800/600', title: 'Sala de Estar' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1b/800/600', title: 'Cocina Gourmet' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1c/800/600', title: 'Dormitorio Principal' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1d/800/600', title: 'Piscina Infinita' },
        ],
      },
      {
        id: uuidv4(),
        type: 'AMENITIES',
        style: { backgroundColor: '#f8fafc' },
        title: 'Características Destacadas',
        amenities: [
          { id: uuidv4(), icon: 'BedDouble', text: '5 Habitaciones' },
          { id: uuidv4(), icon: 'Bath', text: '6 Baños' },
          { id: uuidv4(), icon: 'Car', text: 'Garaje para 3 autos' },
          { id: uuidv4(), icon: 'Film', text: 'Cine en casa' },
          { id: uuidv4(), icon: 'Waves', text: 'Acceso a la playa' },
        ],
      },
    ],
  },
  {
    id: 'prop2',
    name: 'Apartamento Urbano en el Corazón de la Ciudad',
    address: '456 Central Ave, New York, NY',
    price: 1800000,
    mainImageUrl: 'https://picsum.photos/seed/prop2/800/600',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    sections: [
      {
        id: uuidv4(),
        type: 'HERO',
        style: { backgroundColor: '#f3f4f6' },
        imageUrl: 'https://picsum.photos/seed/hero2/1920/1080',
        title: { id: uuidv4(), text: 'Vive el Estilo de Vida Urbano', fontSize: '48px', color: '#1f2937', fontFamily: 'Montserrat', position: { x: 50, y: 45 } },
        floatingTexts: [],
      },
      {
        id: uuidv4(),
        type: 'LOCATION',
        style: { backgroundColor: '#ffffff' },
        coordinates: { lat: 40.7128, lng: -74.0060 },
        nearbyPlaces: [
          { id: uuidv4(), icon: 'Trees', name: 'Central Park', type: 'Park', distance: '1.5 miles' },
          { id: uuidv4(), icon: 'Theater', name: 'Broadway', type: 'Theater', distance: '0.8 miles' },
          { id: uuidv4(), icon: 'ShoppingBasket', name: 'Gourmet Market', type: 'Store', distance: '0.2 miles' },
        ],
      },
    ],
  },
];
