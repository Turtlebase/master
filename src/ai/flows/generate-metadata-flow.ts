
'use server';
/**
 * @fileOverview An AI flow to generate SEO-optimized metadata for an image.
 *
 * - generateMetadata - A function that handles the metadata generation process.
 * - GenerateMetadataInput - The input type for the generateMetadata function.
 * - GenerateMetadataOutput - The return type for the generateMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetadataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a subject, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateMetadataInput = z.infer<typeof GenerateMetadataInputSchema>;

const GenerateMetadataOutputSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title for the image, under 60 characters.'),
  description: z.string().describe('A compelling, descriptive paragraph for the image, around 150-160 characters long.'),
  tags: z.array(z.string()).describe('An array of 5-10 relevant, trending keywords and hashtags (including the # prefix).'),
});
export type GenerateMetadataOutput = z.infer<typeof GenerateMetadataOutputSchema>;

// This is the exported function that the frontend will call.
export async function generateMetadata(input: GenerateMetadataInput): Promise<GenerateMetadataOutput> {
  return generateMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetadataPrompt',
  input: {schema: GenerateMetadataInputSchema},
  output: {schema: GenerateMetadataOutputSchema},
  model: 'googleai/gemini-2.0-flash-preview',
  prompt: `You are an expert SEO and digital marketing specialist. Your task is to analyze the provided image and generate metadata that will maximize its online visibility.

Analyze the image provided and generate the following:
1.  **Title**: A catchy, SEO-friendly title for the image. It should be descriptive but concise (under 60 characters).
2.  **Description**: A compelling paragraph that describes the image. It should be engaging and include relevant keywords (around 150-160 characters).
3.  **Tags**: A list of 5 to 10 of the most relevant and trending keywords and hashtags for this image. Include hashtags with the '#' prefix.

The output must be in the specified JSON format.

Image: {{media url=photoDataUri}}`,
});

const generateMetadataFlow = ai.defineFlow(
  {
    name: 'generateMetadataFlow',
    inputSchema: GenerateMetadataInputSchema,
    outputSchema: GenerateMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
