"use client";

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
    var cv: any;
}

export default function TattooStencilPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    
    const [lowerThreshold, setLowerThreshold] = useState(50);
    const [upperThreshold, setUpperThreshold] = useState(100);
    const [blurValue, setBlurValue] = useState(3);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isCvReady, setIsCvReady] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.9.0/opencv.js';
        script.async = true;
        script.onload = () => {
             const checkCv = () => {
                if (window.cv) {
                    setIsCvReady(true);
                } else {
                    setTimeout(checkCv, 100);
                }
            };
            checkCv();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const processImage = useCallback(() => {
        if (!originalImage || !window.cv || !isCvReady) {
             if(originalImage && !isCvReady){
                toast({
                    variant: "destructive",
                    title: "Engine Not Ready",
                    description: "The image processing engine is still loading. Please wait a moment and try again.",
                });
            }
            return;
        }
        setIsProcessing(true);
        // Use a timeout to ensure the loading spinner renders before the heavy processing task
        setTimeout(() => {
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

                    const ksize = new window.cv.Size(blurValue * 2 + 1, blurValue * 2 + 1);
                    window.cv.GaussianBlur(gray, blurred, ksize, 0, 0, window.cv.BORDER_DEFAULT);

                    window.cv.Canny(blurred, dst, lowerThreshold, upperThreshold);
                    window.cv.bitwise_not(dst, dst);
        
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
                        description: error.message || "Something went wrong while creating the stencil. Please try another image.",
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
        }, 50); // Small delay to allow UI update
    }, [originalImage, lowerThreshold, upperThreshold, blurValue, toast, isCvReady]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'tattoo-stencil.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(image); // Show original image initially
    }
    
    return (
        <ToolLayout
            title="Tattoo Stencil Maker"
            description="Convert your photo to a black & white stencil with advanced controls."
            onImageUpload={handleImageUpload}
            processedImage={processedImage}
            isProcessing={isProcessing}
            showReset={!!originalImage}
        >
            <div className="space-y-6">
                {!originalImage && (
                    <div className="space-y-4">
                       {!isCvReady && <p className="text-xs text-muted-foreground mt-2">Initializing stencil engine...</p>}
                    </div>
                )}
                
                {originalImage && (
                    <>
                         <div className="space-y-4">
                            <Label htmlFor="blur" className="flex justify-between">
                                <span>Smoothness</span>
                                <span>{blurValue}</span>
                            </Label>
                            <Slider 
                                id="blur" 
                                value={[blurValue]} 
                                onValueChange={(value) => setBlurValue(value[0])}
                                max={10} 
                                step={1} 
                                disabled={isProcessing}
                            />
                             <p className="text-xs text-muted-foreground">Reduces noise for cleaner lines. Increase for photos, decrease for simple graphics.</p>
                        </div>

                        <div className="space-y-4">
                             <Label htmlFor="lower-threshold" className="flex justify-between">
                                <span>Detail Level</span>
                                <span>{lowerThreshold}</span>
                            </Label>
                            <Slider 
                                id="lower-threshold" 
                                value={[lowerThreshold]} 
                                onValueChange={(value) => setLowerThreshold(value[0])}
                                max={200} 
                                step={1} 
                                disabled={isProcessing}
                            />
                            <p className="text-xs text-muted-foreground">Controls how many faint edges are detected. Higher values mean less detail.</p>
                        </div>

                         <div className="space-y-4">
                             <Label htmlFor="upper-threshold" className="flex justify-between">
                                <span>Edge Strength</span>
                                <span>{upperThreshold}</span>
                            </Label>
                            <Slider 
                                id="upper-threshold" 
                                value={[upperThreshold]} 
                                onValueChange={(value) => setUpperThreshold(value[0])}
                                max={255} 
                                step={1} 
                                disabled={isProcessing}
                            />
                            <p className="text-xs text-muted-foreground">Defines how strong an edge must be to be included. Lower for more delicate lines.</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing || !isCvReady}>
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-5 w-5" />
                                )}
                                Generate Stencil
                            </Button>
                            <Button onClick={handleDownload} disabled={isProcessing} variant="secondary">
                                <Download className="mr-2 h-5 w-5" />
                                Download Stencil
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ToolLayout>
    );
}
