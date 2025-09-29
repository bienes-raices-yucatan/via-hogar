
'use client';
import React from 'react';

interface TarjetaDePerfilProps {
  nombre: string;
  titulo: string;
}

const TarjetaDePerfil: React.FC<TarjetaDePerfilProps> = ({ nombre, titulo }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h3 className="text-xl font-bold">{nombre}</h3>
      <p className="text-md text-gray-600">{titulo}</p>
    </div>
  );
};

export default TarjetaDePerfil;
