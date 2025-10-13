
"use client";
import React from 'react';
import { Icon } from './icon';
import { Button } from './ui/button';

interface FooterProps {
  onAdminLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminLoginClick }) => {
  return (
    <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
      <div className="flex flex-col items-center gap-2">
         <div className="inline-flex items-center gap-1">
            <Button 
              variant="ghost" 
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={onAdminLoginClick}
              aria-label="Admin Login"
            >
              <Icon name="copyright" className="w-2 h-2"/>
            </Button>
            <span>{new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
};
