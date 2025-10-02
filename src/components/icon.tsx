
"use client";
import React from 'react';
import { IconName } from '@/lib/types';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', strokeWidth = 1.5, ...props }) => {
  const icons: { [key in IconName]: React.ReactElement } = {
    bed: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" />,
    bath: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.5 1.5M4.5 11.25l.75 .75M18.75 11.25l-.75 .75m-6 3.75h.008v.008h-.008v-.008zm0-3.75h.008v.008h-.008v-.008z" />,
    area: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m4.5 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />,
    'map-pin': <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
    school: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />,
    store: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0011.25 11.25H4.5A2.25 2.25 0 002.25 13.5V21M3 3h12M3 3v2.25M3 3l3.75 3.75M21 21V3M21 3h-2.25m2.25 0l-3.75 3.75M3 21h18M21 21v-2.25m0 2.25l-3.75-3.75M12 18.75v-3.75a3.375 3.375 0 00-3.375-3.375h-1.5a3.375 3.375 0 00-3.375 3.375v3.75" />,
    bus: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-1.025H9.75a2.056 2.056 0 00-1.58 1.025 17.903 17.903 0 00-3.213 9.193c-.04.62.468 1.124 1.09 1.124h1.125" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />,
    'x-mark': <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    pencil: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
    nearby: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    logo: (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.77 11.45L18.6 7.74L19.52 6.62L15.72 3.7L12 6.87L9.24 4.79L8.32 5.91L3.85 2.5L0 5.68L6.42 10.66L1.7 14.24L4.74 17H7.74V14H5.1L8.71 11.08L12 13.88L15.29 11.08L18.9 14H16.26V17H19.26L22.3 14.24L17.58 10.66L24 5.68L20.15 2.5L15.68 5.91L12 3.12L8.32 5.91L4.71 3.23L8.32 5.91L9.24 4.79L12 6.87L14.76 4.79L15.72 6.62L18.6 7.74L23.77 11.45Z"
          fill="#475569"
        />
        <path d="M4.5 13.5H7.5V16.5H4.5V13.5Z" fill="#FBBF24" />
        <path d="M16.5 13.5H19.5V16.5H16.5V13.5Z" fill="#FBBF24" />
        <path d="M10.29 7.4L12 8.81L13.71 7.4L12.96 6.5L12 7.29L11.04 6.5L10.29 7.4Z" fill="#FBBF24" />
      </>
    ),
    'drag-handle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9 16.5h.01M15 16.5h.01M9 7.5h.01M15 7.5h.01" />,
    'chevron-left': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />,
    'chevron-right': <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
    copyright: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm-1.05-11.25a3.75 3.75 0 115.1 0" />,
    'solar-panel': <><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M3 9h18M3 13.5h18M3 18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 2.25v19.5M10.5 2.25v19.5M15 2.25v19.5" /></>,
    parking: <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 18h-1.5a1.5 1.5 0 01-1.5-1.5v-12a1.5 1.5 0 011.5-1.5h1.5m-1.5 6h-3M6.375 6h1.5a1.5 1.5 0 011.5 1.5v3.375a3.375 3.375 0 003.375 3.375h1.5" />,
    laundry: <><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 15.91a5.25 5.25 0 01-7.42 0 5.25 5.25 0 010-7.42" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01" /></>,
    pool: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-14.25c-2.12 0-3.858 1.13-4.5 2.658M12 17.25c2.12 0 3.858-1.13 4.5-2.658" />,
    'generic-feature': <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h.01M12 12h.01M12 16.5h.01" />,
    'street-view': <><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></>,
    gym: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5A2.25 2.25 0 019 5.25h9A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75h-9A2.25 2.25 0 016.75 16.5v-9zM5.25 9.75A2.25 2.25 0 013 7.5v9A2.25 2.25 0 005.25 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 01-2.25-2.25H5.25z" />,
    park: <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.093l-4.01 4.887a2.25 2.25 0 00-.59 1.48V15.75A2.25 2.25 0 0010.5 18h3a2.25 2.25 0 002.25-2.25V9.46a2.25 2.25 0 00-.59-1.48l-4.01-4.887zM12 21a9 9 0 100-18 9 9 0 000 18z" />,
    whatsapp: <path stroke="none" fill="currentColor" d="M16.6 7.4c-1.6-1.6-3.6-2.4-5.8-2.4c-4.5 0-8.2 3.7-8.2 8.2c0 1.5.4 2.9 1.1 4.2L2 22l4.8-1.2c1.3.7 2.7 1 4.2 1h.1c4.5 0 8.2-3.7 8.2-8.2c0-2.2-.8-4.2-2.4-5.8zm-5.8 13.1c-1.3 0-2.6-.4-3.8-1.1L6.4 19l.3-1.4c-.8-1.2-1.2-2.6-1.2-4.1c0-3.8 3.1-6.9 6.9-6.9c1.9 0 3.6.7 4.9 2c1.3 1.3 2 3 2 4.9c0 3.8-3.1 6.9-6.9 6.9zm4-5.4c-.2-.1-1.3-.6-1.5-.7c-.2-.1-.4-.1-.5.1s-.6.7-.7.8c-.1.1-.2.2-.4.1c-.2-.1-.8-.3-1.5-.9c-.6-.5-1-1.2-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.4c.1-.1 0-.3-.1-.4c-.1-.1-.5-1.3-.7-1.8c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.3c-.1.2-.6.7-.7 1.6c-.1.9.7 1.8.8 2c.1.1 1.3 2 3.2 2.8c.4.2.7.3 1 .4c.5.1.9.1 1.2.1c.4-.1 1.3-.5 1.5-.9c.2-.4.2-.8.1-.9c-.1-.1-.3-.2-.4-.2z" />,
    'arrows-move': <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-3.75-3.75M12 19.5l3.75-3.75M12 4.5L8.25 8.25M12 4.5l3.75 3.75M4.5 12h15m0 0l-3.75 3.75M19.5 12l-3.75-3.75" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
    list: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    camera: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75a2.25 2.25 0 002.25-2.25v-1.125A12.75 12.75 0 0012 15.75a12.75 12.75 0 00-2.25 2.625v1.125a2.25 2.25 0 002.25 2.25zM12 2.25a2.25 2.25 0 012.25 2.25v1.125A12.75 12.75 0 0112 8.25a12.75 12.75 0 01-2.25-2.625V4.5A2.25 2.25 0 0112 2.25z" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
    'message-circle': <path d="M7.9 20.1c-1.3.4-2.7.6-4.2.6-4.5 0-8.2-3.7-8.2-8.2S3.4 4.3 7.9 4.3s8.2 3.7 8.2 8.2c0 2.2-.8 4.2-2.4 5.8l-3.6 2.8z"/>,
    'grip-vertical': <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
  };

  const iconSvg = icons[name as IconName];
  if (!iconSvg) {
    console.warn(`Icon "${name}" not found.`);
    return null; // or a default fallback icon
  }

  if (name === 'logo' || name === 'whatsapp' || name === 'message-circle') {
      return (
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={className}
              aria-hidden="true"
              {...props}
          >
              {iconSvg}
          </svg>
      );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {iconSvg}
    </svg>
  );
};
