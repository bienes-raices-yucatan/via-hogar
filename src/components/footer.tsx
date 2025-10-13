
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
            <Icon name="copyright" className="w-4 h-4"/>
            <span>{new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
        </div>
        <Button 
          variant="link" 
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={onAdminLoginClick}
        >
          Admin Login
        </Button>
      </div>
    </footer>
  );
};

    

    