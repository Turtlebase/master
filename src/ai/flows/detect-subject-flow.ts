"use server";
/**
 * @fileOverview An AI flow to detect the main subject in a photo.
 *
 * - detectSubject - A function that handles the subject detection process.
 * - DetectSubjectInput - The input type for the detectSubject function.
 * - DetectSubjectOutput - The return type for the detectSubject function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const DetectSubjectInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of something, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectSubjectInput = z.infer<typeof DetectSubjectInputSchema>;

const DetectSubjectOutputSchema = z.object({
  box: z.object({
    x1: z.number().describe("The normalized top-left x-coordinate of the bounding box."),
    y1: z.number().describe("The normalized top-left y-coordinate of the bounding box."),
    x2: z.number().describe("The normalized bottom-right x-coordinate of the bounding box."),
    y2: z.number().describe("The normalized bottom-right y-coordinate of the bounding box."),
  }).optional().describe("The bounding box of the main subject."),
});
export type DetectSubjectOutput = z.infer<typeof DetectSubjectOutputSchema>;

export async function detectSubject(input: DetectSubjectInput): Promise<DetectSubjectOutput> {
  return detectSubjectFlow(input);
}

const prompt = ai.definePrompt({
  name: "detectSubjectPrompt",
  input: { schema: DetectSubjectInputSchema },
  output: { schema: DetectSubjectOutputSchema },
  prompt: `You are an expert at object detection. Your task is to identify the main subject in the provided image and return a bounding box for it. 
  
  The bounding box coordinates must be normalized to be between 0 and 1.
  
  If no clear subject can be identified, do not return a bounding box.

Image: {{media url=photoDataUri}}`,
});

const detectSubjectFlow = ai.defineFlow(
  {
    name: "detectSubjectFlow",
    inputSchema: DetectSubjectInputSchema,
    outputSchema: DetectSubjectOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
