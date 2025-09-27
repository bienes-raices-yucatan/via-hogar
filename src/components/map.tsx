'use client';
import React from 'react';

interface MapProps {
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ lat, lng }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&maptype=roadmap`;

  if (!apiKey) {
    return (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <p className="text-slate-600 text-center p-4">La clave API de Google Maps no está configurada.<br/>Añada NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a sus variables de entorno.</p>
        </div>
    )
  }

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={mapSrc}
    ></iframe>
  );
};

export default Map;
