
"use client";
import React from 'react';

interface FooterProps {
  onAdminLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminLoginClick }) => {
  return (
    <footer className="bg-muted text-muted-foreground p-4 text-center text-sm">
      <div className="inline-flex items-center gap-2">
        <span>&copy; {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
        <span 
          onClick={onAdminLoginClick} 
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          title="Admin Login"
          aria-label="Admin Login"
        >
          •
        </span>
      </div>
    </footer>
  );
};
