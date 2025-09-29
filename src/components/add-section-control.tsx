
"use client";

import React from 'react';
import { Button } from './ui/button';
import { Icon } from './icon';

interface AddSectionControlProps {
  index: number;
  onClick: (index: number) => void;
}

export const AddSectionControl: React.FC<AddSectionControlProps> = ({ index, onClick }) => {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-dashed border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <Button
          variant="outline"
          className="bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          onClick={() => onClick(index)}
        >
          <Icon name="plus" className="mr-2" />
          Añadir Sección Aquí
        </Button>
      </div>
    </div>
  );
};
