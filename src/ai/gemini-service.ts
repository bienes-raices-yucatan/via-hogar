
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

const geocodePrompt = ai.definePrompt({
  name: 'geocodePrompt',
  input: { schema: z.string() },
  output: { schema: GeocodeSchema },
  prompt: `
    Convierte la siguiente dirección en coordenadas geográficas (latitud y longitud).
    Dirección: "{{prompt}}"
    Responde únicamente con el objeto JSON que se adhiere al esquema. No incluyas markdown. Si la dirección es ambigua o no se puede encontrar, devuelve la ubicación de Ciudad de México (lat: 19.4326, lng: -99.1332).
  `,
});

export async function geocodeAddress(address: string): Promise<GeocodeOutput> {
  const { output } = await geocodePrompt(address);
  if (!output) {
    throw new Error('No se pudo convertir la dirección a coordenadas.');
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

export async function generateNearbyPlaces(lat: number, lng: number): Promise<NearbyPlacesOutput> {
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
type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;


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

export async function enhanceImageWithAI(imageDataUrl: string): Promise<string> {
    return await enhanceImageFlow({ imageDataUrl });
}
