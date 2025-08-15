
'use server';
/**
 * @fileOverview An AI flow to check an image for potential copyright risks.
 *
 * - checkCopyright - A function that handles the copyright checking process.
 * - CopyrightCheckInput - The input type for the checkCopyright function.
 * - CopyrightCheckOutput - The return type for the checkCopyright function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CopyrightCheckInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be checked, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CopyrightCheckInput = z.infer<typeof CopyrightCheckInputSchema>;

const CopyrightCheckOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe("The assessed risk level of using this image. 'Low' means it is likely safe to use (e.g. original art, simple objects, animals). 'Medium' means there are elements that might be copyrighted, and caution is advised (e.g. contains brand logos in a street scene). 'High' means it contains clearly copyrighted material and should not be used without a license (e.g. a movie poster, a specific character)."),
  reason: z.string().describe('A clear and concise explanation for the assessed risk level.'),
  detectedElements: z.array(z.object({
    name: z.string().describe("The name of the detected element (e.g., 'Nike Logo', 'Mickey Mouse', 'Generic landscape')."),
    description: z.string().describe('A brief description of why this element contributes to the copyright risk.'),
  })).describe("A list of specific elements detected in the image that were considered in the risk assessment. If the image is low risk, this may contain items like 'Animal' or 'Nature scene'"),
});
export type CopyrightCheckOutput = z.infer<typeof CopyrightCheckOutputSchema>;


export async function checkCopyright(input: CopyrightCheckInput): Promise<CopyrightCheckOutput> {
  return copyrightCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'copyrightCheckPrompt',
  input: {schema: CopyrightCheckInputSchema},
  output: {schema: CopyrightCheckOutputSchema},
  prompt: `You are a world-class expert in copyright and intellectual property law, with a specialization in visual media. Your task is to analyze an image and provide a copyright risk assessment.

You must identify any logos, characters, famous artworks, proprietary designs, or other protected elements. Based on your findings, you will determine a risk level and explain your reasoning.

CRITICAL INSTRUCTIONS:
1.  **Analyze the Image**: Scrutinize the provided image for any recognizable copyrighted material.
2.  **Determine Risk Level**:
    *   **High**: Use for images containing blatant, specific copyrighted content (e.g., a clear picture of a famous character like Spider-Man, a movie poster, a direct copy of a famous painting, a prominent and clear brand logo as the main subject).
    *   **Medium**: Use for images where copyrighted material is present but incidental, or where the style is very similar to a famous artist. Examples: a person wearing a t-shirt with a small logo, a cityscape that includes brand logos on buildings, a character that is very similar in style to a known one but not identical.
    *   **Low**: Use for images that are highly unlikely to be copyrighted. Examples: pictures of animals, landscapes, generic objects, original abstract art, a person's portrait with no logos. **Do not give false positives for things like animals, plants, or generic objects.**
3.  **Provide a Reason**: Write a clear, concise summary explaining your risk assessment.
4.  **List Detected Elements**: Detail each element you identified that influenced your decision, or list the safe elements if the risk is low.

The output MUST be in the specified JSON format.

Image: {{media url=photoDataUri}}`,
});

const copyrightCheckFlow = ai.defineFlow(
  {
    name: 'copyrightCheckFlow',
    inputSchema: CopyrightCheckInputSchema,
    outputSchema: CopyrightCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
