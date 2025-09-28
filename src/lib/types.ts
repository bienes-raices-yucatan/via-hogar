export interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  mainImageUrl: string;
  coordinates: { lat: number; lng: number };
  sections: AnySectionData[];
  createdAt: any; // Using 'any' for Firestore ServerTimestamp compatibility
}

export type SectionType = 
  | 'HERO'
  | 'IMAGE_WITH_FEATURES'
  | 'GALLERY'
  | 'LOCATION'
  | 'AMENITIES'
  | 'PRICING'
  | 'CONTACT'
  | 'BANNER';

export interface PageSection<T extends SectionType> {
  id: string;
  type: T;
  style: {
    backgroundColor: string;
  };
}

export interface StyledText {
  text: string;
  fontSize: number; // Represents rem
  color: string;
  fontFamily: 'Montserrat' | 'Roboto' | 'Lora' | 'Playfair Display';
}

export interface DraggableTextData extends StyledText {
  id: string;
  position: { x: number; y: number; }; // Percentage based
}

export interface HeroSectionData extends PageSection<'HERO'> {
  imageUrl?: string;
  buttonText?: string;
  parallaxEnabled?: boolean;
  draggableTexts: DraggableTextData[];
  height?: string; // e.g., '75vh', '500px'
  borderRadius?: string; // e.g., '3rem', '0px'
}

export interface BannerSectionData extends PageSection<'BANNER'> {
  imageUrl?: string;
  buttonText?: string;
  parallaxEnabled?: boolean;
  draggableTexts: DraggableTextData[];
  height?: string;
  borderRadius?: string;
}

export interface ImageWithFeaturesSectionData extends PageSection<'IMAGE_WITH_FEATURES'> {
  title?: string;
  media: {
    type: 'image' | 'video';
    url?: string;
  };
  features: {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
  }[];
}

export interface GallerySectionData extends PageSection<'GALLERY'> {
  title: string;
  images: {
    id: string;
    url?: string;
    title: string;
  }[];
}

export interface LocationSectionData extends PageSection<'LOCATION'> {
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyPlaces: {
    id: string;
    name: string;
    type: string;
    distance: string;
    icon: string;
  }[];
}

export interface AmenitiesSectionData extends PageSection<'AMENITIES'> {
  title?: string;
  amenities: {
    id: string;
    icon?: string;
    text: string;
    imageUrl?: string;
  }[];
}

export interface PricingSectionData extends PageSection<'PRICING'> {
  icon: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  buttonText: string;
}

export interface ContactSectionData extends PageSection<'CONTACT'> {
  title?: StyledText;
  buttonText?: string;
}

export type AnySectionData =
  | HeroSectionData
  | BannerSectionData
  | ImageWithFeaturesSectionData
  | GallerySectionData
  | LocationSectionData
  | AmenitiesSectionData
  | PricingSectionData
  | ContactSectionData;

export interface ContactSubmission {
  id: string;
  propertyId: string;
  name: string;
  phone: string;
  userType: 'buyer' | 'broker';
  submittedAt: any; // Using 'any' for Firestore ServerTimestamp compatibility
}

export type EditableElement = 
    | { type: 'SITE_NAME' }
    | { type: 'PROPERTY_TEXT'; propertyId: string; field: 'name' | 'address' | 'price' }
    | { type: 'SECTION_STYLE'; propertyId: string; sectionId: string; field: 'backgroundColor' }
    | { type: 'DRAGGABLE_TEXT'; propertyId: string; sectionId: string; textId: string; }
    | { type: 'STYLED_TEXT'; sectionId: string; field: 'title' | 'subtitle' };

export interface SiteConfig {
  siteName: string;
  logoUrl: string;
}
