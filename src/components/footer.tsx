
"use client";
import React from 'react';
import { Button } from './ui/button';

interface FooterProps {
  onAdminLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminLoginClick }) => {
  return (
    <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
      <div className="container mx-auto flex justify-between items-center">
         <div className="inline-flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
        </div>
        <div>
            <button 
              className="h-2 w-2 rounded-full bg-muted-foreground hover:bg-foreground transition-colors"
              onClick={onAdminLoginClick}
              aria-label="Admin Login"
            />
        </div>
      </div>
    </footer>
  );
};
