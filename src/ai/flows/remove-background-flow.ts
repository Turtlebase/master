'use server';
/**
 * @fileOverview A flow that removes the background from an image using the remove.bg API.
 */
import {z} from 'zod';
import {ai} from '@/ai/genkit';

const RemoveBackgroundInputSchema = z.object({
  image_file_b64: z.string().describe('The base64 encoded image file.'),
});

const RemoveBackgroundOutputSchema = z.object({
  image_file_b64: z
    .string()
    .describe(
      'The base64 encoded image file with the background removed.'
    ),
  error: z
    .string()
    .optional()
    .describe('An error message if the operation failed.'),
});

export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;
export type RemoveBackgroundOutput = z.infer<
  typeof RemoveBackgroundOutputSchema
>;

// This is the exported function that the frontend will call.
export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}


const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input: RemoveBackgroundInput) => {
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || !apiKey.trim()) {
      return {
        image_file_b64: '',
        error:
          'The Remove.bg API key is not configured. Please add it to your .env file to use this feature.',
      };
    }

    try {
      const formData = new FormData();
      formData.append('image_file_b64', input.image_file_b64);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to parse the error message from remove.bg
        const errorText = await response.text();
        let errorMessage = 'Failed to remove background due to an API error.';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors[0]?.title) {
            errorMessage = errorJson.errors[0].title;
          }
        } catch (e) {
          // If parsing fails, use the raw text if it's not too long
          errorMessage = errorText.substring(0, 100) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');

      return {
        image_file_b64: base64Image,
      };
    } catch (error: any) {
      console.error('Error removing background:', error);
      return {
        image_file_b64: '',
        error: error.message || 'An unknown error occurred.',
      };
    }
  }
);
