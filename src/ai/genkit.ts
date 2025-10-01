'use server';

import { genkit, ai } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { ai };
