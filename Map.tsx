
import React from 'react';

interface MapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const Map: React.FC<MapProps> = ({ coordinates }) => {
  // Construye la URL para la inserción de Google Maps. Este método no requiere una clave de API.
  // 'q' define el punto para el marcador, 'z' es el zoom y 'output=embed' genera el mapa incrustable.
  const mapSrc = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&hl=es&z=15&output=embed`;

  return (
    <div className="w-full h-full">
      <iframe
        title="Ubicación de la propiedad"
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};
