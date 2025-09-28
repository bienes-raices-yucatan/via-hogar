import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Move, Plus } from 'lucide-react';
import { AnySectionData } from '@/lib/types';
import AddSectionModal from '../modals/add-section-modal';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  onToggleDragMode: () => void;
  onAddSection: (sectionType: AnySectionData['type']) => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, onToggleDragMode, onAddSection }) => {
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Button
          size="icon"
          variant="default"
          className="bg-primary hover:bg-amber-600 rounded-full h-12 w-12 shadow-lg"
          title="Añadir nueva sección"
          onClick={() => setIsAddSectionModalOpen(true)}
        >
          <Plus />
        </Button>

        <Button
          size="icon"
          onClick={onToggleDragMode}
          variant={isDraggingMode ? 'default' : 'secondary'}
          className="rounded-full h-12 w-12 shadow-lg"
          title={isDraggingMode ? 'Desactivar modo arrastrar' : 'Activar modo arrastrar'}
        >
          <Move />
        </Button>
      </div>

      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={onAddSection}
      />
    </>
  );
};

export default AdminToolbar;

    