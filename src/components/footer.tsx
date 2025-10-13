
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
      <div className="container mx-auto flex justify-between items-center">
         <div className="inline-flex items-center gap-1">
            <Icon name="copyright" className="w-4 h-4"/>
            <span>{new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
        </div>
        <div>
            <Button 
              variant="ghost" 
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={onAdminLoginClick}
              aria-label="Admin Login"
            >
              Admin
            </Button>
        </div>
      </div>
    </footer>
  );
};
