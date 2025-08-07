"use client";

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
    var cv: any;
}

export default function ColoringConverterPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    
    const [blurValue, setBlurValue] = useState(7);
    const [lineThickness, setLineThickness] = useState(9);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isCvReady, setIsCvReady] = useState(false);

    useEffect(() => {
        const checkCv = () => {
            if (window.cv) {
                setIsCvReady(true);
            } else {
                setTimeout(checkCv, 100);
            }
        };
        checkCv();
    }, []);

    const processImage = useCallback(() => {
        if (!originalImage || !window.cv || !isCvReady) {
            return;
        }
        setIsProcessing(true);
        setProcessedImage(null);
        
        const imgElement = document.createElement('img');
        imgElement.crossOrigin = "anonymous";
        imgElement.src = originalImage;
        imgElement.onload = () => {
            try {
                const src = window.cv.imread(imgElement);
                const gray = new window.cv.Mat();
                const blurred = new window.cv.Mat();
                const dst = new window.cv.Mat();
                
                window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);

                // Use median blur which is good for reducing noise while keeping edges sharp
                const ksize = blurValue % 2 === 0 ? blurValue + 1 : blurValue; // must be odd
                window.cv.medianBlur(gray, blurred, ksize);

                // Use adaptive thresholding to create the line art effect
                const blockSize = lineThickness % 2 === 0 ? lineThickness + 1 : lineThickness; // must be odd
                window.cv.adaptiveThreshold(blurred, dst, 255, window.cv.ADAPTIVE_THRESH_MEAN_C, window.cv.THRESH_BINARY, blockSize, 2);
    
                const canvas = document.createElement('canvas');
                window.cv.imshow(canvas, dst);
                setProcessedImage(canvas.toDataURL('image/png'));
                
                src.delete();
                gray.delete();
                blurred.delete();
                dst.delete();
            } catch (error: any) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: error.message || "Something went wrong while creating the coloring page.",
                });
            } finally {
                setIsProcessing(false);
            }
        };
        imgElement.onerror = () => {
             toast({
                variant: "destructive",
                title: "Image Error",
                description: "Could not load the image for processing. Please check the image format.",
            });
            setIsProcessing(false);
        }

    }, [originalImage, blurValue, lineThickness, toast, isCvReady]);

    useEffect(() => {
        if (originalImage && isCvReady) {
            const handler = setTimeout(() => {
                processImage();
            }, 300); // Debounce processing
            return () => clearTimeout(handler);
        }
    }, [originalImage, blurValue, lineThickness, processImage, isCvReady]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'coloring-page.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        if(!image){
            setProcessedImage(null);
        }
    }
    
    return (
        <ToolLayout
            title="Coloring Book Converter"
            description="Turn any image into a line-art sketch, ready to be colored in."
            onImageUpload={handleImageUpload}
            processedImage={processedImage}
            isProcessing={isProcessing || (!isCvReady && !!originalImage)}
            showReset={!!originalImage}
        >
            <div className="space-y-6">
                 {!originalImage && !isCvReady && (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-8 w-full" />
                         <p className="text-xs text-muted-foreground mt-2">Initializing engine...</p>
                    </div>
                )}

                <div className="space-y-4">
                    <Label htmlFor="blur" className="flex justify-between">
                        <span>Smoothness</span>
                        <span>{blurValue}</span>
                    </Label>
                    <Slider 
                        id="blur" 
                        value={[blurValue]} 
                        onValueChange={(value) => setBlurValue(value[0])}
                        max={21} 
                        min={1}
                        step={2} 
                        disabled={!originalImage || isProcessing}
                    />
                     <p className="text-xs text-muted-foreground">Reduces detail for a simpler drawing. Higher values make it more abstract.</p>
                </div>

                <div className="space-y-4">
                     <Label htmlFor="line-thickness" className="flex justify-between">
                        <span>Line Thickness</span>
                        <span>{lineThickness}</span>
                    </Label>
                    <Slider 
                        id="line-thickness" 
                        value={[lineThickness]} 
                        onValueChange={(value) => setLineThickness(value[0])}
                        max={35} 
                        min={3}
                        step={2} 
                        disabled={!originalImage || isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">Controls the thickness of the outlines. Higher values create chunkier lines.</p>
                </div>

                <Button onClick={handleDownload} disabled={!processedImage || isProcessing} className="w-full !mt-8">
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-5 w-5" />
                    )}
                    Download Page
                </Button>
            </div>
        </ToolLayout>
    );
}
