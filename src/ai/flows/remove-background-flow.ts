"use server";

import { ai } from "@/ai/genkit";
import { z } from "zod";

const RemoveBackgroundInputSchema = z.object({
  image: z
    .string()
    .describe(
      "A photo of something to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<
  typeof RemoveBackgroundInputSchema
>;

const RemoveBackgroundOutputSchema = z.object({
    imageWithTransparentBg: z
    .string()
    .describe(
      "The generated image with the background removed, as a data URI with a transparent background."
    ),
});

export type RemoveBackgroundOutput = z.infer<
  typeof RemoveBackgroundOutputSchema
>;

export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: "removeBackgroundFlow",
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: "googleai/gemini-2.0-flash-preview-generative-edit",
      prompt: {
        toolRequest: {
          tools: [
            {
              imageEditingTool: {
                edit: "background_removal",
                options: {
                  format: "png",
                  mode: "foreground",
                },
              },
            },
          ],
          context: {
            image: { url: input.image },
          },
        },
      },
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    return {
      imageWithTransparentBg: media.url,
    };
  }
);
