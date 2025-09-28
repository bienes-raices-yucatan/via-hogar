'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import AdminLoginModal from '../modals/admin-login-modal';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const Footer: React.FC = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleAdminLogin = async (credentials: {username: string, password: string})=> {
    try {
        // Firebase Auth requires an email format. We'll append a dummy domain if it's not an email.
        const email = credentials.username.includes('@') ? credentials.username : `${credentials.username}@viahogar.com`;
        await signInWithEmailAndPassword(auth, email, credentials.password);
        setIsLoginVisible(false);
    } catch(error: any) {
        console.error("Login failed:", error);
        toast({
            variant: "destructive",
            title: "Error de inicio de sesión",
            description: "Usuario o contraseña incorrectos.",
        });
    }
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
              onClick={() => setIsLoginVisible(true)}
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
        onLogin={handleAdminLogin}
      />
    </footer>
  );
};

export default Footer;
