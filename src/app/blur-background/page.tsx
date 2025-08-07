"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);


    useEffect(() => {
        if (!originalImage) {
            setSelectionRect(null);
            return;
        };
        const image = new Image();
        image.src = originalImage;
        image.onload = () => {
            imageRef.current = image;
        }
    }, [originalImage]);


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
        if (!originalImage || !imageRef.current || !selectionRect) {
            toast({
                variant: "destructive",
                title: "Selection required",
                description: "Please draw a rectangle on the image to select the area to keep in focus.",
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
            
            // The selection rectangle is based on the display size, so we need to scale it to the original image size.
            const displaySize = canvasRef.current!.getBoundingClientRect();
            const scaleX = img.width / displaySize.width;
            const scaleY = img.height / displaySize.height;

            const scaledRect = {
                x: selectionRect.x * scaleX,
                y: selectionRect.y * scaleY,
                w: selectionRect.w * scaleX,
                h: selectionRect.h * scaleY,
            };

            // 1. Draw the blurred background
            ctx.filter = `blur(${blurIntensity}px)`;
            ctx.drawImage(img, 0, 0);

            // 2. Feather the edges of the selection
            const feather = Math.min(scaledRect.w, scaledRect.h) * 0.15; // 15% feathering

            // Use a second canvas for the mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const maskCtx = maskCanvas.getContext('2d')!;

            // Create a blurred rectangle on the mask
            maskCtx.filter = `blur(${feather}px)`;
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h);

            // 3. Composite the sharp image back on top using the feathered mask
            ctx.globalCompositeOperation = 'destination-in';
            ctx.filter = 'none'; // Clear blur filter
            ctx.drawImage(maskCanvas, 0, 0);

            // 4. Draw the original sharp image again over the masked area
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0);

            setProcessedImage(canvas.toDataURL('image/png'));
            setIsProcessing(false);
        }, 100);

    }, [originalImage, selectionRect, blurIntensity, toast]);
    
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
            onImageUpload={(img) => setOriginalImage(img)}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            processedImage={processedImage || (originalImage ?? undefined)}
            hideUpload={!!originalImage}
            imageContainerChildren={
                originalImage && (
                    <div 
                        ref={canvasRef}
                        className="relative w-full h-full cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                         {selectionRect && (
                            <div
                                ref={selectionRef}
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
                        {hasSelection ? "Adjust the blur intensity and click Generate." : "Draw a rectangle on the image to select the area to keep in focus."}
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
                        />
                    </div>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={processImage} disabled={isProcessing || !hasSelection}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            Generate Blur
                        </Button>
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
