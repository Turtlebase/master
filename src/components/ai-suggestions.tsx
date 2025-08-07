"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import { suggestImprovements } from '@/ai/flows/suggest-improvements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AiSuggestionsProps {
    imageDataUri: string | null;
}

export default function AiSuggestions({ imageDataUri }: AiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuggest = async () => {
        if (!imageDataUri) return;
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const result = await suggestImprovements({ imageDataUri });
            if (result.suggestions) {
                setSuggestions(result.suggestions);
            } else {
                setError('AI could not generate suggestions for this image.');
            }
        } catch (e) {
            setError('Failed to get suggestions. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button onClick={handleSuggest} disabled={isLoading || !imageDataUri} className="w-full">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Improvements
            </Button>
            
            {error && !isLoading && (
                 <div className="mt-4 text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                 </div>
            )}

            {suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Here are some ideas:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <Badge key={index} variant="secondary" className="text-sm bg-accent/20 text-accent-foreground hover:bg-accent/30 border border-accent/30">
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
