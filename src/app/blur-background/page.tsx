
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Faq } from '@/components/faq';
import { HowToUse } from '@/components/how-to-use';

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Click the upload area and select the photo you want to edit." },
    { title: "Step 2: Select Your Subject", description: "Click and drag on the image to draw a rectangle around the person or object you want to keep in sharp focus." },
    { title: "Step 3: Adjust Blur Intensity", description: "Use the 'Blur Intensity' slider to control how blurry the background becomes. The effect updates in real-time." },
    { title: "Step 4: Download", description: "Once you're happy with the result, click the 'Download Image' button." },
];

const faqItems = [
    { question: "How does this tool work?", answer: "This tool uses client-side processing to apply a blur filter to your image. When you draw a rectangle, it keeps that area sharp and blurs everything else, simulating the depth-of-field effect of a DSLR camera." },
    { question: "Is my image uploaded to a server?", answer: "No. All processing happens directly in your browser for maximum privacy. Your images never leave your computer." },
    { question: "What's the best type of image to use?", answer: "Images with a clear subject in the foreground and a distinct background work best. High-resolution images will also produce better results." },
    { question: "Can I clear my selection and start over?", answer: "Yes, just click the 'Clear Selection' button to remove the focus area and reset the blur." },
];


export default function DslrBlurPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [blurIntensity, setBlurIntensity] = useState(10);
    
    const imageRef = useRef<HTMLImageElement | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
    const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number} | null>(null);

    const processTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleImageUpload = (img: string | null) => {
        if (processTimeoutRef.current) {
            clearTimeout(processTimeoutRef.current);
        }
        setOriginalImage(img);
        setProcessedImage(img); 
        setSelectionRect(null);
        if (img) {
            const image = new Image();
            image.src = img;
            image.onload = () => {
                imageRef.current = image;
            }
        } else {
            imageRef.current = null;
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current || isProcessing) return;
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
            return;
        }

        setIsProcessing(true);

        if (processTimeoutRef.current) {
            clearTimeout(processTimeoutRef.current);
        }

        processTimeoutRef.current = setTimeout(() => {
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
    
                ctx.filter = `blur(${blurIntensity}px)`;
                ctx.drawImage(img, 0, 0);
                
                ctx.filter = 'none';
                ctx.drawImage(img, scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h, scaledRect.x, scaledRect.y, scaledRect.w, scaledRect.h);
    
                setProcessedImage(canvas.toDataURL('image/png'));
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: error.message || "An unexpected error occurred.",
                });
                setProcessedImage(originalImage);
            } finally {
                setIsProcessing(false);
            }
        }, 50);

    }, [originalImage, selectionRect, blurIntensity, toast]);

    useEffect(() => {
        if (selectionRect && originalImage) {
            processImage();
        }
    }, [blurIntensity, processImage, selectionRect, originalImage]);
    
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
    const isReadyToDownload = processedImage !== originalImage;

    return (
        <ToolLayout
            title="DSLR Blur"
            description="Apply a beautiful, realistic background blur to your photos to make subjects pop."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            processedImage={processedImage}
            hideUpload={!!originalImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
            imageContainerChildren={
                originalImage && (
                    <div 
                        ref={canvasContainerRef}
                        className={`relative w-full h-full ${isProcessing ? 'cursor-wait' : 'cursor-crosshair'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                         {selectionRect && !isProcessing && (
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
                           <Undo2 />
                           Clear Selection
                        </Button>
                        <Button onClick={handleDownload} disabled={isProcessing || !isReadyToDownload} variant="secondary">
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
