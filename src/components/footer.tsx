
"use client";
import React from 'react';

interface FooterProps {
  onAdminLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminLoginClick }) => {
  return (
    <footer className="bg-muted text-muted-foreground p-4 text-center">
      <p>&copy; {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</p>
      <button onClick={onAdminLoginClick} className="text-xs mt-2 opacity-50 hover:opacity-100">
        Admin Login
      </button>
    </footer>
  );
};
