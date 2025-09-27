# **App Name**: Vía Hogar CMS

## Core Features:

- Admin Mode: Password-protected admin mode for in-place content editing, accessible via hidden footer button.
- In-Place Editing: WYSIWYG editing of all text content directly on the page, with live updates and formatting options.
- AI Image Enhancement: Image enhancement using Gemini API to improve image quality, brightness, and clarity.
- AI Geocoding: Geocode addresses into latitude and longitude coordinates using Gemini.
- AI Nearby Places Generation: Use the tool to find nearby places (schools, parks, stores) based on coordinates using Gemini and the Google Search tool.
- Image Storage in IndexedDB: Store images as Blobs in IndexedDB to avoid localStorage quota issues, referencing images with UUIDs.
- Property List and Detail Views: Display a grid of properties, and a detailed view constructed dynamically from modular sections.

## Style Guidelines:

- Primary color: Amber (#FFB300) for main buttons and highlights, evoking professionalism.
- Background color: Off-white (#F9FAFA), a light, neutral background to ensure readability.
- Accent color: A slightly desaturated orange (#FF8F00) to complement the amber without overpowering it.
- Headline Font: 'Montserrat' sans-serif, for main titles and headers.
- Body Font: 'Roboto' sans-serif, used for body text, descriptions, and UI.
- Simple, professional icons, with a style consistent with real estate apps; custom icons loaded as SVGs.
- Responsive layout adapting to different screen sizes; property grid transitions from 4 to 1 columns on smaller screens.
- Subtle transitions and animations to enhance user experience, like smooth hover effects and loading indicators.