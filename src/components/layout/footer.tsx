'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-slate-100 border-t">
      <div className="container mx-auto px-4 py-6 text-center text-slate-600">
        <div className="flex items-center justify-center gap-2">
           <button
            onClick={onAdminClick}
            className="w-2 h-2 bg-slate-300 rounded-full hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Admin Login"
            title="Admin Login"
          />
          <p>&copy; {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
