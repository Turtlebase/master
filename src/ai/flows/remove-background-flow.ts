'use server';

import { z } from "zod";

const RemoveBackgroundInputSchema = z.object({
    image_file_b64: z.string().describe("The base64 encoded image file."),
});

const RemoveBackgroundOutputSchema = z.object({
    image_file_b64: z.string().describe("The base64 encoded image file with the background removed."),
    error: z.string().optional().describe("An error message if the operation failed."),
});

export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return {
            image_file_b64: '',
            error: 'Remove.bg API key is not configured. Please add it to your .env file.',
        };
    }

    try {
        const response = await fetch('https://api.remove.bg/v1/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_file_b64: input.image_file_b64,
                size: 'auto'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData?.errors?.[0]?.title || 'Failed to remove background.';
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
