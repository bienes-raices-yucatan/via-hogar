'use client';

import { Property, AnySectionData } from '@/lib/types';
import HeroSection from './hero-section';
import GallerySection from './gallery-section';
import AmenitiesSection from './amenities-section';
import LocationSection from './location-section';
// Import other section components here as they are created

interface SectionRendererProps {
  property: Property;
  updateProperty: (updatedProperty: Property) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
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
    <div className="space-y-8 md:space-y-16">
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
            return <HeroSection {...componentProps} data={section} />;
          case 'GALLERY':
            return <GallerySection {...componentProps} data={section} />;
          case 'AMENITIES':
             return <AmenitiesSection {...componentProps} data={section} />;
          case 'LOCATION':
            return <LocationSection {...componentProps} data={section} />;
          // Add cases for other sections
          default:
            return <div key={section.id}>Unknown section type: {section.type}</div>;
        }
      })}
    </div>
  );
};

export default SectionRenderer;
