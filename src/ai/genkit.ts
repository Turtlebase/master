import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit and configure plugins.
export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini API key is read from the GCE metadata server.
    }),
  ],
  // Log developer-friendly errors to the console.
  devLogger: true,
  // Log structured JSON to the console.
  logJson: true,
});
