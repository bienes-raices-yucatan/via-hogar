'use client';

import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import HeroSection from './hero-section';
import GallerySection from './gallery-section';
import AmenitiesSection from './amenities-section';
import LocationSection from './location-section';
import ImageWithFeaturesSection from './image-with-features-section';
import ContactSection from './contact-section';

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
  const { property, updateProperty } = props;

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
        const componentProps = {
          ...props,
          key: section.id,
          data: section as any, // Cast to specific type in component
          updateSection,
          deleteSection,
        };

        switch (section.type) {
          case 'HERO':
            return <HeroSection {...componentProps} />;
          case 'IMAGE_WITH_FEATURES':
            return <ImageWithFeaturesSection {...componentProps} />;
          case 'GALLERY':
            return <GallerySection {...componentProps} />;
          case 'AMENITIES':
             return <AmenitiesSection {...componentProps} />;
          case 'LOCATION':
            return <LocationSection {...componentProps} />;
          case 'CONTACT':
            return <ContactSection {...componentProps} />;
          default:
            return <div key={section.id}>Unknown section type: {section.type}</div>;
        }
      })}
    </div>
  );
};

export default SectionRenderer;
