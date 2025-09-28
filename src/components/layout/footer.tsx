'use client';

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface FooterProps {
  onLogin: (success: boolean) => void;
  isAdminMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ onLogin, isAdminMode }) => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminClick = () => {
    if (!isAdminMode) {
      setIsLoginVisible(!isLoginVisible);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = username === 'Admin' && password === 'Aguilar1';
    onLogin(success);
    if (success) {
      setIsLoginVisible(false);
    }
    setUsername('');
    setPassword('');
  };


  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8">
        {isLoginVisible && (
           <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg flex flex-col sm:flex-row items-center gap-4">
              <Input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700 text-white border-slate-600"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 text-white border-slate-600"
              />
              <Button type="submit" className="w-full sm:w-auto">Iniciar Sesión</Button>
          </form>
        )}
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
    </footer>
  );
};

export default Footer;
