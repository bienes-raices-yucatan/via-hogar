'use client';

import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import HeroSection from './hero-section';
import GallerySection from './gallery-section';
import AmenitiesSection from './amenities-section';
import ImageWithFeaturesSection from './image-with-features-section';
import ContactSection from './contact-section';
import LocationSection from './location-section';
import PricingSection from './pricing-section';

interface SectionRendererProps {
  property: Property;
  updateProperty: (updatedProperty: Property) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  onContactSubmit: (submission: Omit<ContactSubmission, 'id' | 'submittedAt'>) => void;
}

const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  const { property, updateProperty, onContactSubmit, ...componentProps } = props;

  const updateSection = (sectionId: string, updatedData: Partial<AnySectionData>) => {
    const updatedSections = property.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updatedData } : section
    );
    updateProperty({ ...property, sections: updatedSections });
  };
  
  const deleteSection = (sectionId: string) => {
    const updatedSections = property.sections.filter(s => s.id !== sectionId);
    updateProperty({ ...property, sections: updatedSections });
  };

  return (
    <div>
      {property.sections.map((section) => {
        const commonProps = {
          ...componentProps,
          data: section,
          updateSection,
          deleteSection,
        };

        switch (section.type) {
          case 'HERO':
            return <HeroSection key={section.id} {...commonProps} />;
          case 'IMAGE_WITH_FEATURES':
            return <ImageWithFeaturesSection key={section.id} {...commonProps} />;
          case 'GALLERY':
            return <GallerySection key={section.id} {...commonProps} />;
          case 'AMENITIES':
             return <AmenitiesSection key={section.id} {...commonProps} />;
          case 'LOCATION':
            return <LocationSection key={section.id} {...commonProps} />;
          case 'CONTACT':
            return <ContactSection key={section.id} {...commonProps} propertyId={property.id} onContactSubmit={onContactSubmit} />;
          case 'PRICING':
            return <PricingSection key={section.id} {...commonProps} />;
          default:
            return <div key={section.id}>Unknown section type: {(section as any).type}</div>;
        }
      })}
    </div>
  );
};

export default SectionRenderer;
