
'use server';
/**
 * @fileOverview AI services using Genkit for geocoding, nearby places generation, and image enhancement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  description: z.string(),
  category: z.enum(['supermarket', 'gym', 'school', 'park', 'transport', 'store', 'restaurant', 'hospital', 'generic']),
});

const NearbyPlacesSchema = z.object({
  places: z.array(NearbyPlaceSchema),
});
type NearbyPlacesOutput = z.infer<typeof NearbyPlacesSchema>;

export async function generateNearbyPlaces(lat: number, lng: number): Promise<NearbyPlacesOutput> {
  const nearbyPlacesPrompt = ai.definePrompt({
    name: 'nearbyPlacesPrompt',
    input: { schema: z.object({ lat: z.number(), lng: z.number() }) },
    output: { schema: NearbyPlacesSchema },
    prompt: `
      Eres un experto agente inmobiliario local. Utilizando tus herramientas de búsqueda, identifica entre 5 y 7 puntos de interés reales y verificables cercanos a las coordenadas geográficas: latitud {{lat}}, longitud {{lng}}.
      Concéntrate en servicios importantes: supermercados, gimnasios, escuelas, parques, transporte público y tiendas.
      Para cada lugar, proporciona una descripción muy concisa que incluya solo el nombre del lugar y el tiempo de viaje o la distancia. Por ejemplo: "Supermercado Chedraui - 5 min en coche", "Parque La Mexicana - 800m". No añadas texto de marketing.

      Tu respuesta DEBE ser únicamente un objeto JSON válido con el formato especificado.
      No incluyas markdown (como \`\`\`json), comentarios, ni ningún otro texto fuera del objeto JSON.
      Si no puedes encontrar ningún lugar relevante, devuelve un objeto JSON con una lista de "places" vacía. No respondas con texto explicativo ni disculpas, solo con el JSON.
    `,
    config: {
      // tools: [{ googleSearch: {} }], // This would require a tool definition, let's rely on model knowledge for now
    }
  });

  const { output } = await nearbyPlacesPrompt({ lat, lng });
  if (!output) {
    throw new Error('No se pudieron generar los puntos de interés cercanos.');
  }
  return output;
}

// --- Image Enhancement ---

const EnhanceImageInputSchema = z.object({
    imageDataUrl: z.string().describe("A photo of a property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export async function enhanceImageWithAI(imageDataUrl: string): Promise<string> {
    const enhanceImageFlow = ai.defineFlow(
        {
            name: 'enhanceImageFlow',
            inputSchema: EnhanceImageInputSchema,
            outputSchema: z.string(),
        },
        async ({ imageDataUrl }) => {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.5-flash-image-preview',
                prompt: [
                    { media: { url: imageDataUrl } },
                    { text: 'Mejora la calidad de esta imagen. Aumenta la nitidez, el brillo y la vitalidad de los colores, manteniendo un aspecto fotorrealista. Si es posible, aumenta la resolución sin introducir artefactos. No recortes ni cambies la relación de aspecto.' },
                ],
                config: {
                    responseModalities: ['IMAGE', 'TEXT'],
                },
            });

            if (media.url) {
                return media.url;
            }

            throw new Error("La IA no devolvió una imagen mejorada.");
        }
    );

    return await enhanceImageFlow({ imageDataUrl });
}
