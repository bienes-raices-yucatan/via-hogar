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
        buttonText: 'Contáctanos',
        height: '75vh',
        borderRadius: '3rem',
        draggableTexts: [
          {
            id: uuidv4(),
            text: 'Elegancia y confort: Una casa diseñada para quienes buscan lo mejor.',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: '#ffffff',
            fontFamily: 'Playfair Display',
            position: { x: 50, y: 40 }
          }
        ]
      },
      {
        id: uuidv4(),
        type: 'IMAGE_WITH_FEATURES',
        style: { backgroundColor: '#ffffff' },
        media: {
            type: 'image',
            url: 'https://picsum.photos/seed/features1/800/1000'
        },
        features: [
            { id: uuidv4(), icon: 'Home', title: 'Diseño Moderno', subtitle: 'Espacios abiertos y acabados de lujo.'},
            { id: uuidv4(), icon: 'Sun', title: 'Vistas Panorámicas', subtitle: 'Disfruta de amaneceres y atardeceres sobre el océano.'},
            { id: uuidv4(), icon: 'Waves', title: 'Acceso Privado', subtitle: 'Acceso directo y privado a la playa.'},
        ]
      },
      {
        id: uuidv4(),
        type: 'GALLERY',
        style: { backgroundColor: '#f8fafc' },
        title: 'Explora la Propiedad',
        images: [
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1a/800/600', title: 'Sala de Estar' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1b/800/600', title: 'Cocina Gourmet' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1c/800/600', title: 'Dormitorio Principal' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1d/800/600', title: 'Baño de Lujo' },
          { id: uuidv4(), url: 'https://picsum.photos/seed/gallery1e/800/600', title: 'Piscina Infinita' },
        ],
      },
      {
        id: uuidv4(),
        type: 'AMENITIES',
        style: { backgroundColor: '#ffffff' },
        title: 'Características Destacadas',
        amenities: [
          { id: uuidv4(), icon: 'BedDouble', text: '5 Habitaciones' },
          { id: uuidv4(), icon: 'Bath', text: '6 Baños' },
          { id: uuidv4(), icon: 'Car', text: 'Garaje para 3 autos' },
          { id: uuidv4(), icon: 'Film', text: 'Cine en casa' },
          { id: uuidv4(), icon: 'Waves', text: 'Acceso a la playa' },
          { id: uuidv4(), icon: 'Wifi', text: 'Wi-Fi de Alta Velocidad'},
          { id: uuidv4(), icon: 'Wind', text: 'Aire Acondicionado Central'},
          { id: uuidv4(), icon: 'SwimmingPool', text: 'Piscina Privada'}
        ],
      },
      {
        id: uuidv4(),
        type: 'LOCATION',
        style: { backgroundColor: '#f8fafc' },
        coordinates: { lat: 25.7617, lng: -80.1918 },
        nearbyPlaces: [
            { id: uuidv4(), name: 'South Pointe Park', type: 'Parque', distance: '5 min', icon: 'Trees' },
            { id: uuidv4(), name: 'Joe\'s Stone Crab', type: 'Restaurante', distance: '10 min', icon: 'Utensils' },
            { id: uuidv4(), name: 'Lincoln Road Mall', type: 'Centro Comercial', distance: '15 min', icon: 'ShoppingBag' },
            { id: uuidv4(), name: 'Miami International Airport', type: 'Aeropuerto', distance: '25 min', icon: 'Plane' },
        ]
       },
       {
        id: uuidv4(),
        type: 'CONTACT',
        style: { backgroundColor: '#ffffff' },
        title: { text: '¿Te interesa la casa para ti o eres vendedor inmobiliario?', fontSize: '2rem', color: '#1E293B', fontFamily: 'Montserrat' },
        buttonText: 'Enviar',
      },
    ],
  },
];
