'use client';

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import AdminLoginModal from '../modals/admin-login-modal';

interface FooterProps {
  onAdminLogin: (success: boolean) => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminLogin }) => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  const handleAdminClick = () => {
    setIsLoginVisible(true);
  };
  
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold font-headline text-white">Vía Hogar</h3>
            <p className="text-sm">Tu portal inmobiliario de confianza</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleAdminClick}
              className="w-2 h-2 bg-slate-600 rounded-full hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-slate-900"
              aria-label="Admin Login"
              title="Admin Login"
            />
            <p className="text-sm">&copy; {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
      <AdminLoginModal
        isOpen={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
        onLogin={onAdminLogin}
      />
    </footer>
  );
};

export default Footer;

    