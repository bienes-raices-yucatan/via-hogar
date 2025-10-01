
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
