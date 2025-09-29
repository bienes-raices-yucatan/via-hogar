
import { AnySectionData, NearbyPlace, Property, PricingSectionData, StyledText, DraggableTextData, ContactSubmission } from './types';

// Default styled text for titles
const defaultTitleStyle: Omit<StyledText, 'text'> = {
    fontSize: 3,
    color: '#1e293b', // slate-800
    fontFamily: 'Montserrat',
};

// Default styled text for subtitles
const defaultSubtitleStyle: Omit<StyledText, 'text'> = {
    fontSize: 1.125, // text-lg
    color: '#475569', // slate-600
    fontFamily: 'Roboto',
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
        nearbyPlaces?: NearbyPlace[];
    } = {}
): AnySectionData => {
    const base = { 
        id: `${type}-${uniqueSuffix}`, 
        type,
        floatingTexts: [],
        style: {},
    };

    switch (type) {
        case 'hero':
            return {
                ...base,
                type: 'hero',
                title: { 
                    id: `title-${uniqueSuffix}`,
                    text: 'Título Impactante de la Propiedad', 
                    fontSize: 5, 
                    position: { x: 50, y: 50 },
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat',
                },
                backgroundImageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                parallaxEffect: false,
            };
        case 'imageWithFeatures':
            return {
                ...base,
                type: 'imageWithFeatures',
                style: { backgroundColor: '#FFFFFF' },
                title: getDefaultTitle('Descubre Más Sobre la Propiedad'),
                media: { type: 'image', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
                features: [],
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
            };
        case 'pricing':
            return {
                ...base,
                type: 'pricing',
                style: { backgroundColor: '#F9FAFB' }, // gray-50
                title: getDefaultTitle('Opciones de Precios'),
                tiers: [
                    { id: `tier-${uniqueSuffix}-1`, name: 'Básico', price: '1,000', frequency: '/mes', features: [{id: 'f1', text:'Característica 1'}, {id: 'f2', text:'Característica 2'}], buttonText: 'Elegir Plan', isFeatured: false },
                    { id: `tier-${uniqueSuffix}-2`, name: 'Popular', price: '1,500', frequency: '/mes', features: [{id: 'f3', text:'Característica A'}, {id: 'f4', text:'Característica B'}, {id: 'f5', text:'Característica C'}], buttonText: 'Elegir Plan', isFeatured: true },
                    { id: `tier-${uniqueSuffix}-3`, name: 'Premium', price: '2,000', frequency: '/mes', features: [{id: 'f6', text:'Beneficio X'}, {id: 'f7', text:'Beneficio Y'}], buttonText: 'Elegir Plan', isFeatured: false },
                ],
            } as PricingSectionData;
        case 'contact':
            return {
                ...base,
                type: 'contact',
                title: { text: '¿Te interesa esta propiedad?', fontSize: 2.5, color: '#FFFFFF', fontFamily: 'Montserrat' },
                subtitle: { text: 'Contáctanos para obtener más información o para agendar una visita. ¡Estamos listos para ayudarte!', fontSize: 1.25, color: '#E2E8F0', fontFamily: 'Roboto' },
                backgroundImageUrl: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                parallaxEffect: false,
            };
        case 'location':
            return {
                ...base,
                type: 'location',
                style: { backgroundColor: '#FFFFFF' },
                title: getDefaultTitle('Ubicación y Alrededores'),
                coordinates: options.coordinates || { lat: 19.4326, lng: -99.1332 },
                nearbyPlaces: options.nearbyPlaces || [],
            };
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
    'contact',
    'location'
];

// The initial state for the entire application is an empty list of properties.
export const INITIAL_PROPERTIES_DATA: Property[] = [];
export const INITIAL_SUBMISSIONS_DATA: ContactSubmission[] = [];

// Utility function to create a new property object with a unique ID and default content.
export const createNewProperty = (address: string, coordinates: { lat: number; lng: number }, nearbyPlaces: NearbyPlace[]): Property => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const uniqueSections = DEFAULT_SECTIONS_FOR_NEW_PROPERTY.map(type => 
        createSectionData(type, uniqueSuffix, { coordinates, nearbyPlaces })
    );

    return {
        id: `prop-${uniqueSuffix}`,
        name: 'Nombre de la Propiedad',
        address: address,
        price: '$0',
        mainImageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        sections: uniqueSections,
    };
};
