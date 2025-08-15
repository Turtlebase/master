'use server';
// IMPORTANT: This file is a convention for hosting Genkit flows on Firebase App Hosting.
//
// It is NOT a conventional Next.js API route that you would create for your app.
//
// This file is used by the Genkit framework to handle requests to your flows.
// You should not need to edit this file.
import {genkit} from 'genkit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set a 60-second timeout

// Increase the body size limit to handle large image uploads for AI flows.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export {genkit as GET, genkit as POST};
