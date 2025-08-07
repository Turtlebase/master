"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Download, Eraser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DslrBlurPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [blurIntensity, setBlurIntensity] = useState(10);
    
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);


    const handleImageUpload = (img: string | null) => {
        setOriginalImage(img);
        setProcessedImage(img); 
        setSelectionRect(null);
        if (img) {
            const image = new Image();
            image.src = img;
            image.onload = () => {
                imageRef.current = image;
            }
        }
    };


    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;
        setIsSelecting(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setSelectionRect(null);
        setProcessedImage(originalImage);
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelecting || !startPoint || !imageRef.current) return;
    
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
    
        const x = Math.min(startPoint.x, currentX);
        const y = Math.min(startPoint.y, currentY);
        const w = Math.abs(currentX - startPoint.x);
        const h = Math.abs(currentY - startPoint.y);
    
        setSelectionRect({ x, y, w, h });
    };
    
    const handleMouseUp = () => {
        setIsSelecting(false);
        setStartPoint(null);
    };

    const processImage = useCallback(() => {
        if (!originalImage || !imageRef.current || !selectionRect || !canvasContainerRef.current) {
            if (selectionRect) { // Only toast if there's a rect but other things are missing
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: "Something went wrong. Please try uploading the image again.",
                });
            }
            return;
        }

        setIsProcessing(true);

        // Use a timeout to avoid blocking the UI thread on heavy operations
        setTimeout(() => {
            try {
                const img = imageRef.current!;
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error("Could not get canvas context");
                };
                
                const displayRect = canvasContainerRef.current!.getBoundingClientRect();
                const scaleX = img.naturalWidth / displayRect.width;
                const scaleY = img.naturalHeight / displayRect.height;
    
                const scaledRect = {
                    x: selectionRect.x * scaleX,
                    y: selectionRect.y * scaleY,
                    w: selectionRect.w * scaleX,
                    h: selectionRect.h * scaleY,
                };
    
                // Draw blurred image
                ctx.filter = `blur(${blurIntensity}px)`;
                ctx.drawImage(img, 0, 0);
                
                // Draw sharp part on top
                ctx.filter = 'none';
                ctx.drawImage(img, scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h, scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h);
    
                setProcessedImage(canvas.toDataURL('image/png'));
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: error.message || "An unexpected error occurred.",
                });
            } finally {
                setIsProcessing(false);
            }
        }, 50);

    }, [originalImage, selectionRect, blurIntensity, toast]);

    useEffect(() => {
        if (selectionRect) {
            processImage();
        }
    }, [blurIntensity, processImage, selectionRect]);
    
    const handleResetSelection = () => {
        setSelectionRect(null);
        setProcessedImage(originalImage);
    }

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
            isProcessing={isProcessing}
            showReset={!!originalImage}
            processedImage={processedImage}
            hideUpload={!!originalImage}
            imageContainerChildren={
                originalImage && (
                    <div 
                        ref={canvasContainerRef}
                        className="relative w-full h-full cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                         {selectionRect && (
                            <div
                                className="absolute border-2 border-dashed border-primary bg-primary/20 pointer-events-none"
                                style={{
                                    left: `${selectionRect.x}px`,
                                    top: `${selectionRect.y}px`,
                                    width: `${selectionRect.w}px`,
                                    height: `${selectionRect.h}px`,
                                }}
                            />
                        )}
                    </div>
                )
            }
        >
            {originalImage ? (
                <div className="space-y-6">
                     <p className="text-sm text-muted-foreground">
                        {hasSelection ? "Adjust the blur intensity slider to see the effect." : "Draw a rectangle on the image to select the area to keep in focus."}
                     </p>
                    
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
                            disabled={!hasSelection || isProcessing}
                        />
                    </div>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={handleResetSelection} variant="outline" disabled={isProcessing || !hasSelection}>
                           <Eraser />
                           Clear Selection
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
