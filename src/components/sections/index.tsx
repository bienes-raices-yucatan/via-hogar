
'use client';

import { Property, AnySectionData, ContactSubmission } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeroSection from './hero-section';
import BannerSection from './banner-section';
import GallerySection from './gallery-section';
import AmenitiesSection from './amenities-section';
import ImageWithFeaturesSection from './image-with-features-section';
import ContactSection from './contact-section';
import LocationSection from './location-section';
import PricingSection from './pricing-section';

interface SectionRendererProps {
  property: Property;
  updateProperty: (updatedProperty: Property) => void;
  localUpdateProperty: (updatedProperty: Property) => void;
  isAdminMode: boolean;
  isDraggingMode: boolean;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  onContactSubmit: (submission: Omit<ContactSubmission, 'id' | 'propertyId' | 'submittedAt'>) => void;
  onNavigateHome: () => void;
}

const SortableSectionWrapper = ({ id, isDraggingMode, children }: { id: string, isDraggingMode: boolean, children: React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: id, disabled: !isDraggingMode});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        boxShadow: isDragging ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/section-wrapper">
             {children}
             {isDraggingMode && (
                <div 
                    {...listeners} 
                    {...attributes}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 p-2 cursor-grab",
                        "left-2 text-slate-400 hover:text-slate-800",
                        "transition-opacity opacity-20 group-hover/section-wrapper:opacity-100 z-30"
                    )}
                >
                    <GripVertical />
                </div>
            )}
        </div>
    );
};


const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  const { property, updateProperty, onContactSubmit, isDraggingMode, localUpdateProperty, ...componentProps } = props;

  const deleteSection = (sectionId: string) => {
    const updatedSections = property.sections.filter(s => s.id !== sectionId);
    updateProperty({ ...property, sections: updatedSections });
  };

  return (
    <div>
      {property.sections.map((section, index) => {
        const isFirstSection = index === 0;
        const commonProps = {
          ...componentProps,
          property,
          data: section,
          updateProperty,
          localUpdateProperty,
          deleteSection,
          isFirstSection,
          isDraggingMode,
        };
        
        let sectionHtmlId = '';
        switch (section.type) {
            case 'IMAGE_WITH_FEATURES':
                sectionHtmlId = 'section-features';
                break;
            case 'LOCATION':
                sectionHtmlId = 'section-location';
                break;
            case 'CONTACT':
                sectionHtmlId = 'section-contact';
                break;
        }

        const sectionWrapper = (content: React.ReactNode) => (
            <div key={section.id} id={sectionHtmlId}>
              <SortableSectionWrapper id={`section-${section.id}`} isDraggingMode={isDraggingMode}>
                {content}
              </SortableSectionWrapper>
            </div>
        );


        switch (section.type) {
          case 'HERO':
            return sectionWrapper(<HeroSection {...commonProps} data={section} />);
          case 'BANNER':
            return sectionWrapper(<BannerSection {...commonProps} data={section} />);
          case 'IMAGE_WITH_FEATURES':
            return sectionWrapper(<ImageWithFeaturesSection {...commonProps} data={section} />);
          case 'GALLERY':
            return sectionWrapper(<GallerySection {...commonProps} data={section} />);
          case 'AMENITIES':
             return sectionWrapper(<AmenitiesSection {...commonProps} data={section} />);
          case 'LOCATION':
            return sectionWrapper(<LocationSection {...commonProps} data={section} />);
          case 'CONTACT':
            return sectionWrapper(<ContactSection {...commonProps} data={section} onContactSubmit={onContactSubmit} />);
          case 'PRICING':
            return sectionWrapper(<PricingSection {...commonProps} data={section} />);
          default:
            return <div key={section.id}>Unknown section type: {(section as any).type}</div>;
        }
      })}
    </div>
  );
};

export default SectionRenderer;
