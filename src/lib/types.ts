

// A type for the icon names available in the Icon component
export type IconName = 'bed' | 'bath' | 'area' | 'map-pin' | 'school' | 'store' | 'bus' | 'sparkles' | 'x-mark' | 'chevron-down' | 'plus' | 'pencil' | 'trash' | 'nearby' | 'logo' | 'drag-handle' | 'chevron-left' | 'chevron-right' | 'copyright' | 'solar-panel' | 'parking' | 'laundry' | 'pool' | 'generic-feature' | 'street-view' | 'gym' | 'park' | 'whatsapp' | 'arrows-move' | 'check' | 'list' | 'camera';

export type FontFamily = 'Roboto' | 'Montserrat' | 'Lora' | 'Playfair Display';
export type TextAlign = 'left' | 'center' | 'right';

export interface StyledText {
    text: string;
    fontSize: number; // in rem
    color: string;
    fontFamily: FontFamily;
    textAlign?: TextAlign;
}

// Data for an editable text field that is also draggable and resizable
export interface DraggableTextData extends StyledText {
    id: string; // Unique ID for selection
    position: {
        x: number; // percentage from left
        y: number; // percentage from top
    };
    width?: number; // percentage of parent
}

// Base structure for any section on the page
export interface PageSection {
  id: string;
  type: 'hero' | 'imageWithFeatures' | 'gallery' | 'location' | 'amenities' | 'contact' | 'pricing';
  style?: {
    backgroundColor?: string;
  };
  floatingTexts?: DraggableTextData[];
}

// Data for the Hero (main banner) section
export interface HeroSectionData extends PageSection {
  type: 'hero';
  title: DraggableTextData;
  backgroundImageUrl: string;
}

// Data for a single feature item (e.g., '3 Bedrooms', 'Solar Panels')
export interface FeatureItem {
  id: string;
  icon: IconName;
  imageUrl?: string;
  title: StyledText;
  description: StyledText;
}

// Data for the section containing an image and a list of features
export interface ImageWithFeaturesSectionData extends PageSection {
  type: 'imageWithFeatures';
  title?: StyledText;
  media: {
    type: 'image' | 'video';
    url: string;
  };
  features: FeatureItem[];
}

// Data for a single image in the gallery, with an optional title
export interface GalleryImage {
    id:string;
    url: string;
    title: string;
}

// Data for the image gallery section
export interface GallerySectionData extends PageSection {
  type: 'gallery';
  title?: StyledText;
  images: GalleryImage[];
}

// Data for a single point of interest near the property
export interface NearbyPlace {
    id: string;
    icon: IconName;
    imageUrl?: string;
    text: string;
}

// Data for the map/location section
export interface LocationSectionData extends PageSection {
  type: 'location';
  title?: StyledText;
  coordinates: {
    lat: number; // Represents geographic latitude
    lng: number; // Represents geographic longitude
  };
  nearbyPlaces: NearbyPlace[];
}

// Data for a single amenity item in the Amenities section
export interface AmenityItem {
  id: string;
  text: string;
  icon: IconName;
  imageUrl?: string;
}

// Data for the contact section
export interface ContactSectionData extends PageSection {
    type: 'contact';
    title?: StyledText;
    subtitle?: StyledText;
    backgroundImageUrl: string;
}

// Data for a single pricing tier in the Pricing section
export interface PricingTier {
    id: string;
    title: StyledText;
    price: StyledText;
    currency: StyledText;
    description: StyledText;
    buttonText: string;
    oldPrice?: StyledText;
}

// Data for the section listing pricing plans
export interface PricingSectionData extends PageSection {
    type: 'pricing';
    backgroundImageUrl: string;
    tier: PricingTier;
}

// Union type for any possible section
export type AnySectionData = HeroSectionData | ImageWithFeaturesSectionData | GallerySectionData | LocationSectionData | AmenitiesSectionData | ContactSectionData | PricingSectionData;

// Represents a full property listing
export interface Property {
    id: string;
    name: string;
    address: string;
    price: string;
    mainImageUrl: string;
    sections: AnySectionData[];
}

// Represents the currently selected UI element for editing
export type SelectedElement = {
    sectionId: string;
    elementKey: 'title' | 'subtitle' | 'media' | 'features' | 'amenities' | 'tier' | 'floatingTexts' | 'style' | 'backgroundImageUrl' | 'mainImageUrl';
    subElementId?: string; // For items within an array (e.g., a specific feature ID)
    property?: 'icon' | 'title' | 'description' | 'price' | 'oldPrice' | 'currency' | 'text'; // For nested properties within an item
};

// Data structure for a contact form submission
export interface ContactSubmission {
    id: string;
    propertyId: string;
    propertyName: string;
    name: string;
    phone: string;
    userType: 'buyer' | 'broker';
    submittedAt: string;
}
