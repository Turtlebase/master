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
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectionRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(image);
        setSelectionRect(null);
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
        setSelectionRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !selectionRect) return;
        const pos = getMousePos(e.currentTarget, e);
        setSelectionRect(prev => prev ? { ...prev, w: pos.x - prev.x, h: pos.y - prev.y } : null);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        // We can trigger the blur effect here automatically after selection
        // or wait for the user to click the button. Let's wait.
    };

    const drawSelection = useCallback(() => {
        const canvas = selectionRef.current;
        if (!canvas || !selectionRect) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (selectionRect.w !== 0 || selectionRect.h !== 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            ctx.setLineDash([]);
        }
    }, [selectionRect]);
    
    useEffect(() => {
        drawSelection();
    }, [selectionRect, drawSelection]);

    const processImage = useCallback(() => {
        if (!originalImage || !selectionRect) {
            toast({
                variant: "destructive",
                title: "Selection required",
                description: "Please draw a rectangle on the image to select the area to keep in focus.",
            });
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
             const img = new Image();
             img.crossOrigin = "anonymous";
             img.src = originalImage;
             img.onload = () => {
                const canvas = canvasRef.current;
                if(!canvas) {
                    setIsProcessing(false);
                    return;
                };

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
                
                // Normalize selection rect
                const x = selectionRect.w < 0 ? selectionRect.x + selectionRect.w : selectionRect.x;
                const y = selectionRect.h < 0 ? selectionRect.y + selectionRect.h : selectionRect.y;
                const w = Math.abs(selectionRect.w);
                const h = Math.abs(selectionRect.h);
                
                // Create a clipping path for a soft edge
                const feather = Math.min(w, h) * 0.1; // 10% feathering
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.clip();
                
                // Draw the sharp image inside the clipped area
                ctx.drawImage(img, 0, 0);
                
                // Draw the sharp portion again but slightly smaller for feathering
                 if (feather > 0) {
                    const gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w,h)/2 - feather, x + w / 2, y + h / 2, Math.min(w,h)/2);
                    gradient.addColorStop(0, 'rgba(0,0,0,1)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0,0,canvas.width, canvas.height);
                }
                
                ctx.restore();
                ctx.drawImage(img, x,y,w,h, x,y,w,h);

                setProcessedImage(canvas.toDataURL('image/png'));
                setIsProcessing(false);
             }
             img.onerror = () => {
                toast({
                    variant: "destructive",
                    title: "Image Error",
                    description: "Could not load the image for processing.",
                });
                setIsProcessing(false);
             }
        }, 50);

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

    const hasSelection = selectionRect && (selectionRect.w !== 0 || selectionRect.h !== 0);

    return (
        <ToolLayout
            title="DSLR Blur"
            description="Apply a beautiful, realistic background blur to your photos to make subjects pop."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            processedImage={originalImage ? processedImage : undefined}
            hideUpload={!!originalImage}
            imageContainerChildren={
                originalImage && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={processedImage || originalImage} alt="blur preview" className="max-w-full max-h-[70vh] object-contain" style={{ visibility: isDrawing ? 'visible' : 'visible' }} />
                        <canvas
                            ref={selectionRef}
                            className="absolute top-0 left-0 w-full h-full"
                            width={selectionRef.current?.parentElement?.clientWidth}
                            height={selectionRef.current?.parentElement?.clientHeight}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ cursor: 'crosshair' }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )
            }
        >
            {originalImage ? (
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="intensity" className="flex justify-between">
                            <span>Blur Intensity</span>
                            <span>{blurIntensity}</span>
                        </Label>
                        <Slider 
                            id="intensity" 
                            value={[blurIntensity]} 
                            onValueChange={(val) => setBlurIntensity(val[0])} 
                            max={50} 
                            step={1} 
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                           {hasSelection ? "Adjust intensity, then click Generate." : "Draw a selection on the image to define the focus area."}
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
