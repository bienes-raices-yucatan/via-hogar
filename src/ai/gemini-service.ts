
'use server';
/**
 * @fileOverview AI services using Genkit for geocoding, nearby places generation, and image enhancement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { NearbyPlace } from '@/lib/types';

// --- Geocoding ---

const GeocodeSchema = z.object({
  lat: z.number().describe('La latitud geográfica.'),
  lng: z.number().describe('La longitud geográfica.'),
});
type GeocodeOutput = z.infer<typeof GeocodeSchema>;

export async function geocodeAddress(address: string): Promise<GeocodeOutput> {
  const geocodePrompt = ai.definePrompt({
    name: 'geocodePrompt',
    input: { schema: z.string() },
    output: { schema: GeocodeSchema },
    prompt: `
      Eres un asistente experto en geolocalización. Tu tarea es convertir una dirección proporcionada por el usuario en coordenadas geográficas (latitud y longitud).
      Actúa como si estuvieras introduciendo la dirección en la barra de búsqueda de Google Maps. Utiliza tu conocimiento del mundo para encontrar la ubicación más probable y precisa.

      Dirección: "{{prompt}}"

      Tu respuesta DEBE ser únicamente un objeto JSON que se adhiere al esquema de salida. No incluyas markdown, texto introductorio ni explicaciones.
      Si la dirección es muy ambigua o imposible de localizar, haz tu mejor esfuerzo para inferir la ubicación o, como último recurso, devuelve coordenadas para una ubicación central relevante si es posible (por ejemplo, el centro de una ciudad mencionada).
    `,
  });

  const { output } = await geocodePrompt(address);
  if (!output) {
    throw new Error('No se pudo convertir la dirección a coordenadas. Inténtalo de nuevo con una dirección más específica.');
  }
  return output;
}


// --- Nearby Places ---

const NearbyPlaceSchema = z.object({
  id: z.string().describe('Un ID único para este lugar.'),
  icon: z.enum(['school', 'store', 'park', 'bus', 'gym']).describe('El icono que mejor representa el lugar.'),
  title: z.string().describe('Una breve descripción del lugar (ej. "Parque Central").'),
  travelTime: z.string().describe('El tiempo de viaje hasta el lugar (ej. "a 5 min").'),
});

const NearbyPlacesSchema = z.array(NearbyPlaceSchema);

const GenerateNearbyPlacesInputSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const nearbyPlacesPrompt = ai.definePrompt({
    name: 'nearbyPlacesPrompt',
    input: { schema: GenerateNearbyPlacesInputSchema },
    output: { schema: NearbyPlacesSchema },
    prompt: `
        Dadas las coordenadas (lat: {{lat}}, lng: {{lng}}), genera una lista de 5 puntos de interés relevantes cercanos (como parques, supermercados, escuelas, gimnasios, paradas de transporte).
        Para cada lugar, proporciona un ID único, un icono adecuado de la lista [school, store, park, bus, gym], un título descriptivo breve (ej. "Parque Central") y el tiempo de viaje (ej. "a 5 min").
        Tu respuesta DEBE ser únicamente un array de objetos JSON.
    `,
});

export async function generateNearbyPlaces(lat: number, lng: number): Promise<NearbyPlace[]> {
    const { output } = await nearbyPlacesPrompt({ lat, lng });
    return output || [];
}
