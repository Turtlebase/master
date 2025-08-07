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
    const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);
    const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        setSelectionRect(null);
        const img = new Image();
        img.src = image || '';
        img.onload = () => {
            imageRef.current = img;
        }
    }

    const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!originalImage) return;
        const pos = getMousePos(e.currentTarget, e);
        setStartPoint(pos);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;
        const pos = getMousePos(e.currentTarget, e);
        setSelectionRect({ 
            x: Math.min(pos.x, startPoint.x), 
            y: Math.min(pos.y, startPoint.y), 
            w: Math.abs(pos.x - startPoint.x), 
            h: Math.abs(pos.y - startPoint.y) 
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setStartPoint(null);
    };

    const drawSelection = useCallback(() => {
        const canvas = selectionCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (selectionRect && (selectionRect.w > 0 || selectionRect.h > 0)) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        }
    }, [selectionRect]);
    
    useEffect(() => {
        const canvas = selectionCanvasRef.current;
        const image = imageRef.current;
        if (canvas && image) {
            const parent = canvas.parentElement;
            if (parent) {
                const { clientWidth, clientHeight } = parent;
                const imageAspectRatio = image.width / image.height;
                const parentAspectRatio = clientWidth / clientHeight;

                let renderWidth, renderHeight;

                if (imageAspectRatio > parentAspectRatio) {
                    renderWidth = clientWidth;
                    renderHeight = clientWidth / imageAspectRatio;
                } else {
                    renderHeight = clientHeight;
                    renderWidth = clientHeight * imageAspectRatio;
                }
                canvas.style.width = `${renderWidth}px`;
                canvas.style.height = `${renderHeight}px`;
                canvas.width = renderWidth;
                canvas.height = renderHeight;
                drawSelection();
            }
        }
    }, [originalImage, drawSelection]);

    useEffect(() => {
        drawSelection();
    }, [selectionRect, drawSelection]);

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
            
            // Map selection from rendered size to original image size
            const selectionCanvas = selectionCanvasRef.current!;
            const scaleX = img.width / selectionCanvas.width;
            const scaleY = img.height / selectionCanvas.height;

            const originalSelection = {
                x: selectionRect.x * scaleX,
                y: selectionRect.y * scaleY,
                w: selectionRect.w * scaleX,
                h: selectionRect.h * scaleY,
            }

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
            
            const feather = Math.min(originalSelection.w, originalSelection.h) * 0.2;
            const gradient = maskCtx.createLinearGradient(0, originalSelection.y, 0, originalSelection.y + feather);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,1)');

            maskCtx.fillStyle = 'black'; // Opaque
            maskCtx.fillRect(
                originalSelection.x + feather, 
                originalSelection.y + feather, 
                originalSelection.w - feather * 2, 
                originalSelection.h - feather * 2
            );

            // Create feathered edges
            const outerRect = new Path2D();
            outerRect.rect(0, 0, img.width, img.height);
            const innerRect = new Path2D();
            innerRect.rect(
                originalSelection.x, 
                originalSelection.y, 
                originalSelection.w, 
                originalSelection.h
            );

            maskCtx.save();
            maskCtx.clip(outerRect);
            maskCtx.clip(innerRect, 'evenodd');
            
            // Apply blur to the mask itself to create the feather
            maskCtx.filter = `blur(${feather}px)`;
            maskCtx.fillStyle = "black";
            maskCtx.fillRect(
                originalSelection.x,
                originalSelection.y,
                originalSelection.w,
                originalSelection.h,
            );
            maskCtx.restore();

            // Use mask to composite sharp image onto blurred image
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0);
             
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

    const hasSelection = selectionRect && (selectionRect.w > 0 || selectionRect.h > 0);
    const onResetSelection = () => setSelectionRect(null);

    return (
        <ToolLayout
            title="DSLR Blur"
            description="Apply a beautiful, realistic background blur to your photos to make subjects pop."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            processedImage={processedImage || (originalImage ?? undefined)}
            hideUpload={!!originalImage}
            imageContainerChildren={
                originalImage && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={processedImage || originalImage} alt="blur preview" className="max-w-full max-h-[70vh] object-contain" style={{opacity: isProcessing ? 0.5 : 1}} />
                        <canvas
                            ref={selectionCanvasRef}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ cursor: 'crosshair' }}
                        />
                    </div>
                )
            }
        >
            {originalImage ? (
                <div className="space-y-6">
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
                           <span>{hasSelection ? "Adjust intensity, then click Generate." : "Draw on the image to select focus area."}</span>
                           {hasSelection && (
                                <Button onClick={onResetSelection} variant="ghost" size="icon" className="h-6 w-6">
                                    <Eraser className="h-4 w-4" />
                                </Button>
                           )}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={processImage} disabled={isProcessing || !hasSelection}>
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
