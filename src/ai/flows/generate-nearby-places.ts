'use server';

/**
 * @fileOverview An AI agent for generating nearby places of interest for a property.
 *
 * - generateNearbyPlaces - A function that generates a list of nearby places of interest based on latitude and longitude.
 * - GenerateNearbyPlacesInput - The input type for the generateNearbyPlaces function.
 * - GenerateNearbyPlacesOutput - The return type for the generateNearbyPlaces function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNearbyPlacesInputSchema = z.object({
  latitude: z.number().describe('The latitude of the property.'),
  longitude: z.number().describe('The longitude of the property.'),
});
export type GenerateNearbyPlacesInput = z.infer<typeof GenerateNearbyPlacesInputSchema>;

const NearbyPlaceSchema = z.object({
  name: z.string().describe('The name of the place.'),
  type: z.string().describe('The type of place (e.g., school, park, store).'),
  distance: z.string().describe('The distance to the place from the property.'),
});

const GenerateNearbyPlacesOutputSchema = z.array(NearbyPlaceSchema).describe('A list of nearby places of interest.');
export type GenerateNearbyPlacesOutput = z.infer<typeof GenerateNearbyPlacesOutputSchema>;

export async function generateNearbyPlaces(input: GenerateNearbyPlacesInput): Promise<GenerateNearbyPlacesOutput> {
  return generateNearbyPlacesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNearbyPlacesPrompt',
  input: {schema: GenerateNearbyPlacesInputSchema},
  output: {schema: GenerateNearbyPlacesOutputSchema},
  prompt: `You are a real estate expert. Generate a list of nearby places of interest (e.g., schools, parks, stores) for a property at the following coordinates:

Latitude: {{latitude}}
Longitude: {{longitude}}

Return the list in a JSON format.

Each place should have the following information:
- name: The name of the place.
- type: The type of place (e.g., school, park, store).
- distance: The distance to the place from the property.

{
  "name": "Central Park",
  "type": "Park",
  "distance": "0.5 miles"
}`,  
});

const generateNearbyPlacesFlow = ai.defineFlow(
  {
    name: 'generateNearbyPlacesFlow',
    inputSchema: GenerateNearbyPlacesInputSchema,
    outputSchema: GenerateNearbyPlacesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
