"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Download, Eraser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectSubject } from '@/ai/flows/detect-subject-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function DslrBlurPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    
    const [blurIntensity, setBlurIntensity] = useState(10);
    
    const imageRef = useRef<HTMLImageElement>(null);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);

    const handleImageUpload = useCallback(async (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        setSelectionRect(null);

        if (image) {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                imageRef.current = img;
            }

            setIsDetecting(true);
            try {
                const result = await detectSubject({ photoDataUri: image });
                if (result.box) {
                    // The AI returns normalized coordinates (0-1), so we scale them to the image size.
                    setSelectionRect({
                        x: result.box.x1 * img.width,
                        y: result.box.y1 * img.height,
                        w: (result.box.x2 - result.box.x1) * img.width,
                        h: (result.box.y2 - result.box.y1) * img.height,
                    });
                     toast({
                        title: "Subject Detected",
                        description: "The main subject has been automatically selected. Adjust the blur and click Generate.",
                    });
                } else {
                     toast({
                        variant: "destructive",
                        title: "Detection Failed",
                        description: "The AI could not detect a main subject. Please try a different image.",
                    });
                }
            } catch (e: any) {
                 toast({
                    variant: "destructive",
                    title: "AI Error",
                    description: "An error occurred while detecting the subject.",
                });
                console.error(e);
            } finally {
                setIsDetecting(false);
            }
        }
    }, [toast]);


    const processImage = useCallback(() => {
        if (!originalImage || !imageRef.current || !selectionRect) {
            toast({
                variant: "destructive",
                title: "Selection required",
                description: "Please wait for the AI to detect a subject before generating.",
            });
            return;
        }

        setIsProcessing(true);
        setProcessedImage(null);

        setTimeout(() => {
             const img = imageRef.current!;
             const canvas = document.createElement('canvas');
             canvas.width = img.width;
             canvas.height = img.height;
             const ctx = canvas.getContext('2d');
             if (!ctx) {
                setIsProcessing(false);
                return;
             };

            // Draw blurred background
            ctx.filter = `blur(${blurIntensity}px)`;
            ctx.drawImage(img, 0, 0);
            
            // Draw the sharp foreground on top
            ctx.filter = 'none';

            // Create a feathered mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const maskCtx = maskCanvas.getContext('2d')!;
            
            const feather = Math.min(selectionRect.w, selectionRect.h) * 0.2;

            maskCtx.fillStyle = 'black'; // Opaque
            const innerX = selectionRect.x + feather;
            const innerY = selectionRect.y + feather;
            const innerW = selectionRect.w - feather * 2;
            const innerH = selectionRect.h - feather * 2;
            maskCtx.fillRect(innerX, innerY, innerW, innerH);

            // Apply blur to the mask itself to create the feather
            maskCtx.save();
            maskCtx.globalCompositeOperation = 'destination-out';
            const outerRectPath = new Path2D();
            outerRectPath.rect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            maskCtx.clip(outerRectPath);
            maskCtx.filter = `blur(${feather}px)`;
            maskCtx.fillStyle = "black";
            maskCtx.fillRect(0, 0, img.width, img.height);
            maskCtx.restore();

            // Composite original image using the feathered mask
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0, img.width, img.height);
             
            setProcessedImage(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        }, 100);

    }, [originalImage, selectionRect, blurIntensity, toast]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'blurred-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasSelection = !!selectionRect;

    return (
        <ToolLayout
            title="DSLR Blur"
            description="Apply a beautiful, realistic background blur to your photos to make subjects pop."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing || isDetecting}
            showReset={!!originalImage}
            processedImage={processedImage || (originalImage ?? undefined)}
            hideUpload={!!originalImage}
        >
            {originalImage ? (
                <div className="space-y-6">
                     <Alert>
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>AI Subject Detection</AlertTitle>
                      <AlertDescription>
                        {isDetecting ? "Finding the main subject in your image..." : (hasSelection ? "Subject detected! Adjust blur and generate." : "Upload an image to start.")}
                      </AlertDescription>
                    </Alert>

                    <div>
                        <Label htmlFor="intensity" className="flex justify-between items-center mb-2">
                            <span>Blur Intensity</span>
                            <span className="font-bold">{blurIntensity}</span>
                        </Label>
                        <Slider 
                            id="intensity" 
                            value={[blurIntensity]} 
                            onValueChange={(val) => setBlurIntensity(val[0])} 
                            max={50} 
                            step={1} 
                        />
                         <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                           Adjust intensity, then click Generate.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={processImage} disabled={isProcessing || isDetecting || !hasSelection}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            Generate Blur
                        </Button>
                        <Button onClick={handleDownload} disabled={isProcessing || !processedImage || processedImage === originalImage} variant="secondary">
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
