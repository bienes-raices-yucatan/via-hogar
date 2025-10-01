
import {ai, configureGenkit} from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export {ai};
