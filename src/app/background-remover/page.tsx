"use client";

import { useState, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { removeBackground } from '@/ai/flows/remove-background-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function BackgroundRemoverPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
    }
    
    const processImage = useCallback(async () => {
        if (!originalImage) {
            toast({
                variant: "destructive",
                title: "No Image",
                description: "Please upload an image first.",
            });
            return;
        }

        setIsProcessing(true);
        setProcessedImage(null);

        try {
            const result = await removeBackground({ image: originalImage });
            if (result.imageWithTransparentBg) {
                setProcessedImage(result.imageWithTransparentBg);
            } else {
                throw new Error("The AI model did not return an image.");
            }
        } catch(e: any) {
            console.error(e);
            const errorMessage = e.message || "Could not process the image with the AI.";
            if (errorMessage.includes('overloaded') || errorMessage.includes('Unavailable')) {
                 toast({
                    variant: "destructive",
                    title: "AI Service Busy",
                    description: "The AI service is currently busy. Please wait a moment and try again.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "AI Error",
                    description: errorMessage,
                });
            }
        } finally {
            setIsProcessing(false);
        }

    }, [originalImage, toast]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'background-removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;

    return (
        <ToolLayout
            title="AI Background Remover"
            description="Automatically remove the background from any image with a single click."
            onImageUpload={(img) => handleImageUpload(img, null)}
            processedImage={processedImage || originalImage}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
        >
            {hasImage ? (
                <div className="space-y-6">
                    <Alert>
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Powered by AI</AlertTitle>
                      <AlertDescription>
                        This tool uses generative AI to remove the background. The results are usually great, but can sometimes be unexpected.
                      </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={processImage} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            Remove Background
                        </Button>
                        <Button onClick={handleDownload} disabled={isProcessing || !processedImage} variant="secondary">
                            <Download />
                            Download Image
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Upload an image to get started.</p>
            )}
        </ToolLayout>
    );
}
