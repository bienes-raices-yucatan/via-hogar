import { GoogleGenAI, Type, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the expected JSON schema for the geocoding AI response
const geocodeSchema = {
    type: Type.OBJECT,
    properties: {
        lat: { 
            type: Type.NUMBER,
            description: 'La latitud geográfica.'
        },
        lng: { 
            type: Type.NUMBER,
            description: 'La longitud geográfica.'
        }
    },
    required: ["lat", "lng"]
};


interface NearbyPlaceAIResponse {
    description: string;
    category: string;
}

/**
 * Converts a street address into geographic coordinates using Gemini.
 * @param address The address string to geocode.
 * @returns A promise that resolves to an object with lat and lng.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    const prompt = `
        Convierte la siguiente dirección en coordenadas geográficas (latitud y longitud).
        Dirección: "${address}"
        Responde únicamente con el objeto JSON que se adhiere al esquema. No incluyas markdown. Si la dirección es ambigua o no se puede encontrar, devuelve la ubicación de Ciudad de México (lat: 19.4326, lng: -99.1332).
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geocodeSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { lat: number; lng: number };
    } catch (error) {
        console.error("Error geocoding address with Gemini:", error);
        throw new Error("No se pudo convertir la dirección a coordenadas. Verifica que la dirección sea válida.");
    }
};

/**
 * Generates a list of nearby points of interest using the Gemini AI and Google Search.
 * @param lat - Latitude of the property.
 * @param lng - Longitude of the property.
 * @returns A promise that resolves to an array of nearby places.
 */
export const generateNearbyPlaces = async (lat: number, lng: number): Promise<NearbyPlaceAIResponse[]> => {
    const prompt = `
        Eres un experto agente inmobiliario local. Utilizando tus herramientas de búsqueda, identifica entre 5 y 7 puntos de interés reales y verificables cercanos a las coordenadas geográficas: latitud ${lat}, longitud ${lng}.
        Concéntrate en servicios importantes: supermercados, gimnasios, escuelas, parques, transporte público y tiendas.
        Para cada lugar, proporciona una descripción muy concisa que incluya solo el nombre del lugar y el tiempo de viaje o la distancia. Por ejemplo: "Supermercado Chedraui - 5 min en coche", "Parque La Mexicana - 800m". No añadas texto de marketing.

        Tu respuesta DEBE ser únicamente un objeto JSON válido con el siguiente formato:
        {
          "places": [
            {
              "description": "string",
              "category": "supermarket' | 'gym' | 'school' | 'park' | 'transport' | 'store' | 'restaurant' | 'hospital' | 'generic'"
            }
          ]
        }
        No incluyas markdown (como \`\`\`json), comentarios, ni ningún otro texto fuera del objeto JSON.
        Si no puedes encontrar ningún lugar relevante, devuelve un objeto JSON con una lista de "places" vacía. No respondas con texto explicativo ni disculpas, solo con el JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const rawText = response.text.trim();
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        
        // If the response is not a JSON object, it might be a refusal or conversational text.
        // We log it and return an empty array to prevent the app from crashing.
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.warn("AI response did not contain a valid JSON object. Response:", rawText);
            return [];
        }
        
        const jsonText = rawText.substring(startIndex, endIndex + 1);
        
        const parsedResponse = JSON.parse(jsonText) as { places: NearbyPlaceAIResponse[] };
        
        if (parsedResponse && Array.isArray(parsedResponse.places)) {
             return parsedResponse.places;
        } else {
            throw new Error("La respuesta de la IA no tenía el formato esperado.");
        }

    } catch (error) {
        console.error("Error generating nearby places with Gemini and Search:", error);
        // Provide a more specific error message if it's a parsing issue
        if (error instanceof SyntaxError) {
             throw new Error("No se pudo interpretar la respuesta de la IA. El formato JSON podría ser inválido.");
        }
        throw new Error("No se pudieron generar los puntos de interés cercanos. Por favor, inténtalo de nuevo.");
    }
};

/**
 * Enhances an image using the Gemini AI.
 * @param imageDataUrl The data URL of the image to enhance.
 * @returns A promise that resolves to the data URL of the enhanced image.
 */
export const enhanceImageWithAI = async (imageDataUrl: string): Promise<string> => {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Formato de URL de datos de imagen no válido.");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const imagePart = {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };

    const textPart = {
        text: 'Mejora la calidad de esta imagen. Aumenta la nitidez, el brillo y la vitalidad de los colores, manteniendo un aspecto fotorrealista. Si es posible, aumenta la resolución sin introducir artefactos. No recortes ni cambies la relación de aspecto.',
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const newMimeType = part.inlineData.mimeType;
                return `data:${newMimeType};base64,${base64ImageBytes}`;
            }
        }

        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`La IA respondió con texto en lugar de una imagen: ${textResponse}`);
        }

        throw new Error("La IA no devolvió una imagen mejorada.");
    } catch (error) {
        console.error("Error enhancing image with Gemini:", error);
        if (error instanceof Error && error.message.includes("La IA respondió con texto")) {
            throw error;
        }
        throw new Error("No se pudo mejorar la imagen con IA. Por favor, inténtalo de nuevo.");
    }
};

// --- Image Store (IndexedDB) ---

let db: IDBDatabase;

const DB_NAME = 'ImageStoreDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
        resolve(true);
        return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
         throw new Error('Could not parse MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}


export const saveImage = (dataURL: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('DB not initialized');
            return;
        }
        try {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const key = crypto.randomUUID();
            const blob = dataURLToBlob(dataURL);
            
            const request = store.put(blob, key);

            request.onsuccess = () => {
                resolve(key);
            };
            request.onerror = () => {
                console.error('Error saving image blob:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Error preparing to save image:', error);
            reject(error);
        }
    });
};

export const getImageBlob = (key: string): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('DB not initialized');
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        // FIX: Add explicit type to IDBRequest to ensure `request.result` is typed correctly.
        const request: IDBRequest<Blob | undefined> = store.get(key);

        request.onsuccess = () => {
            resolve(request.result ? request.result : null);
        };
        request.onerror = () => {
            console.error('Error getting image blob:', request.error);
            reject(request.error);
        };
    });
};

export const deleteImage = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db || !key || key.startsWith('http') || key.startsWith('data:')) {
            resolve();
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            console.error('Error deleting image blob:', request.error);
            reject(request.error);
        };
    });
};