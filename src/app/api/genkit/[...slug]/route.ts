// IMPORTANT: This file is a convention for hosting Genkit flows on Firebase App Hosting.
//
// It is NOT a conventional Next.js API route that you would create for your app.
//
// This file is used by the Genkit framework to handle requests to your flows.
// You should not need to edit this file.
import {createApiRoute} from 'genkitx-next';
import {ai} from '@/ai/genkit';

export const {GET, POST} = createApiRoute({
  ai,
});
