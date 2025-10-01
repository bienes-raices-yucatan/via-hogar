

import { AnySectionData, NearbyPlace, Property, PricingSectionData, StyledText, DraggableTextData, ContactSubmission, FeatureItem, AmenitiesSectionData, HeroSectionData, ButtonSectionData } from './types';

// Default styled text for titles
const defaultTitleStyle: Omit<StyledText, 'text'> = {
    fontSize: 3,
    color: '#1e293b', // slate-800
    fontFamily: 'Montserrat',
    textAlign: 'center',
    fontWeight: 'bold',
};

// Default styled text for subtitles
const defaultSubtitleStyle: Omit<StyledText, 'text'> = {
    fontSize: 1.125, // text-lg
    color: '#475569', // slate-600
    fontFamily: 'Poppins',
    textAlign: 'center',
    fontWeight: 'normal'
};

// Utility functions to create default styled text objects
export const getDefaultTitle = (text: string): StyledText => ({
    ...defaultTitleStyle,
    text,
});

export const getDefaultSubtitle = (text: string): StyledText => ({
    ...defaultSubtitleStyle,
    text,
});


// Centralized factory function to create default data for any section type.
export const createSectionData = (
    type: AnySectionData['type'], 
    uniqueSuffix: string,
    options: {
        coordinates?: { lat: number; lng: number };
    } = {}
): AnySectionData => {
    const base = { 
        id: `${type}-${uniqueSuffix}`, 
        type,
        style: {},
    };

    switch (type) {
        case 'hero':
            return {
                ...base,
                type: 'hero',
                style: { height: 80 }, // Default height for new hero sections
                title: { 
                    id: `title-${uniqueSuffix}`,
                    text: 'Título Impactante de la Propiedad', 
                    fontSize: 5, 
                    position: { x: 50, y: 50 },
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat',
                    textAlign: 'center',
                    fontWeight: 'bold'
                },
                backgroundImageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            } as HeroSectionData;
        case 'imageWithFeatures':
             const defaultFeatures: FeatureItem[] = [
                { id: `feat-1-${uniqueSuffix}`, icon: 'bed', title: { text: '3 Dormitorios', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: 'Todos con su propio baño y guardarropa.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
                { id: `feat-2-${uniqueSuffix}`, icon: 'bath', title: { text: '5 baños', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: 'Baños con acabados de alta calidad.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
                { id: `feat-3-${uniqueSuffix}`, icon: 'pool', title: { text: 'Piscina totalmente equipada', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: 'Con cascada, sistema de filtrado automático y calentador de agua.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
                { id: `feat-4-${uniqueSuffix}`, icon: 'parking', title: { text: '2 espacios de estacionamiento', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: 'Techados y cerrados, para que tus vehículos estén a resguardo.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
                { id: `feat-5-${uniqueSuffix}`, icon: 'solar-panel', title: { text: 'Paneles solares', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: '18 paneles solares, suficientes para abastecer toda la casa.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
                { id: `feat-6-${uniqueSuffix}`, icon: 'laundry', title: { text: 'Lavandería equipada', fontSize: 1.125, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'left', fontWeight: 'bold' }, description: { text: 'Cuarto de lavado con lavadora, secadora y gabinetes.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'left', fontWeight: 'normal' } },
            ];
            return {
                ...base,
                type: 'imageWithFeatures',
                style: { backgroundColor: '#FFFFFF' },
                title: getDefaultTitle('Características Principales'),
                media: { type: 'image', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
                features: defaultFeatures,
            };
        case 'gallery':
            return {
                ...base,
                type: 'gallery',
                style: { backgroundColor: '#F9FAFB' }, // gray-50
                title: getDefaultTitle('Galería de la Propiedad'),
                images: [],
            };
        case 'amenities':
            return {
                ...base,
                type: 'amenities',
                style: { backgroundColor: '#F9FAFB' }, // gray-50
                title: getDefaultTitle('Amenidades Exclusivas'),
                amenities: [],
            } as AmenitiesSectionData;
        case 'pricing':
            return {
                ...base,
                type: 'pricing',
                backgroundImageUrl: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                tier: {
                    id: `tier-${uniqueSuffix}`,
                    title: { text: 'Precio de la propiedad', fontSize: 1.25, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'center', fontWeight: 'bold'},
                    oldPrice: { text: '6,500,000', fontSize: 1.5, color: '#EF4444', fontFamily: 'Poppins', textAlign: 'center', fontWeight: 'normal'},
                    price: { text: '5,500,000', fontSize: 2.25, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'center', fontWeight: 'bold'},
                    currency: { text: 'MXN', fontSize: 1.875, color: '#1E293B', fontFamily: 'Montserrat', textAlign: 'center', fontWeight: 'normal'},
                    description: { text: 'Lista para escriturar y con entrega inmediata.', fontSize: 1, color: '#475569', fontFamily: 'Poppins', textAlign: 'center', fontWeight: 'normal'},
                    buttonText: 'Me Interesa',
                },
            } as PricingSectionData;
        case 'contact':
            return {
                ...base,
                type: 'contact',
                title: { text: 'Completa y envía el formulario para contactarte.', fontSize: 2.5, color: '#FFFFFF', fontFamily: 'Montserrat', textAlign: 'center', fontWeight: 'bold' },
                subtitle: { text: 'Resolveremos tus dudas y podrás agendar una visita.', fontSize: 1.25, color: '#E2E8F0', fontFamily: 'Poppins', textAlign: 'center', fontWeight: 'normal' },
                backgroundImageUrl: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            };
        case 'location':
            return {
                ...base,
                type: 'location',
                style: { backgroundColor: '#FFFFFF' },
                title: getDefaultTitle('Ubicación y Alrededores'),
                coordinates: options.coordinates || { lat: 19.4326, lng: -99.1332 },
                nearbyPlaces: [],
            };
        case 'button':
            return {
                ...base,
                type: 'button',
                style: { backgroundColor: '#FFFFFF' },
                text: 'Contáctanos',
                alignment: 'center',
            } as ButtonSectionData;
        default:
            const _exhaustiveCheck: never = type;
            throw new Error(`Unknown section type: ${type}`);
    }
};

// Default sections for a newly created property.
const DEFAULT_SECTIONS_FOR_NEW_PROPERTY: AnySectionData['type'][] = [
    'hero',
    'imageWithFeatures',
    'gallery',
    'amenities',
    'pricing',
    'contact',
    'location'
];

export const INITIAL_PROPERTIES_DATA: Property[] = [];
export const INITIAL_SUBMISSIONS_DATA: ContactSubmission[] = [];

// Utility function to create a new property object with a unique ID and default content.
export const createNewProperty = (address: string, coordinates: { lat: number; lng: number }): Property => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const uniqueSections = DEFAULT_SECTIONS_FOR_NEW_PROPERTY.map(type => 
        createSectionData(type, uniqueSuffix, { coordinates })
    );

    return {
        id: `prop-${uniqueSuffix}`,
        name: 'Nueva Propiedad',
        address: address,
        price: '$5,500,000 MXN',
        mainImageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        sections: uniqueSections,
    };
};
