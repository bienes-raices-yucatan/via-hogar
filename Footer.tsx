import React from 'react';
import { Icon } from './Icon';

interface FooterProps {
    onAdminLoginClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminLoginClick }) => {
    return (
        <footer className="bg-slate-800 text-white w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
                <p className="text-sm text-slate-400 flex items-center">
                    <button 
                        onClick={onAdminLoginClick} 
                        className="mr-2 p-2 rounded-full group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400"
                        aria-label="Acceso de administrador"
                    >
                        <span className="block w-1.5 h-1.5 bg-slate-500 rounded-full group-hover:bg-amber-400 transition-colors"></span>
                    </button>
                    <span>&copy; {new Date().getFullYear()} Vía Hogar. Todos los derechos reservados.</span>
                </p>
            </div>
        </footer>
    );
};
