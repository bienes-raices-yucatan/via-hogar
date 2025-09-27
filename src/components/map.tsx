'use client';
import React from 'react';

interface MapProps {
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ lat, lng }) => {
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=es;z=15&amp;output=embed`;

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
