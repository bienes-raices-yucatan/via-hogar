import React from 'react';
import { Button } from '../ui/button';
import { Move } from 'lucide-react';

interface AdminToolbarProps {
  isDraggingMode: boolean;
  onToggleDragMode: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ isDraggingMode, onToggleDragMode }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        size="icon"
        onClick={onToggleDragMode}
        variant={isDraggingMode ? 'default' : 'secondary'}
        title={isDraggingMode ? 'Desactivar modo arrastrar' : 'Activar modo arrastrar'}
      >
        <Move />
      </Button>
    </div>
  );
};

export default AdminToolbar;
