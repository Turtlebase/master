"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
    var cv: any;
}

export default function TattooStencilPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [threshold, setThreshold] = useState(50);
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
        if (!originalImage || !window.cv) {
            return;
        }
        setIsProcessing(true);
        
        const imgElement = document.createElement('img');
        imgElement.src = originalImage;
        imgElement.onload = () => {
            try {
                const src = window.cv.imread(imgElement);
                const dst = new window.cv.Mat();
                window.cv.cvtColor(src, src, window.cv.COLOR_RGBA2GRAY, 0);
                window.cv.Canny(src, dst, threshold, threshold * 2);
                window.cv.bitwise_not(dst, dst);
    
                const canvas = document.createElement('canvas');
                window.cv.imshow(canvas, dst);
                setProcessedImage(canvas.toDataURL('image/png'));
                
                src.delete();
                dst.delete();
            } catch (error) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: "Something went wrong while creating the stencil. Please try another image.",
                });
            } finally {
                setIsProcessing(false);
            }
        };
        imgElement.onerror = () => {
             toast({
                variant: "destructive",
                title: "Image Error",
                description: "Could not load the image for processing.",
            });
            setIsProcessing(false);
        }

    }, [originalImage, threshold, toast]);

    useEffect(() => {
        if (originalImage) {
            processImage();
        }
    }, [originalImage, threshold, processImage]);

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
        if(!image){
            setProcessedImage(null);
        }
    }
    
    return (
        <ToolLayout
            title="Tattoo Stencil Maker"
            description="Convert your photo to a black & white stencil with adjustable edge detection."
            onImageUpload={handleImageUpload}
            processedImage={processedImage}
            isProcessing={isProcessing}
            showReset={!!originalImage}
        >
            <div className="space-y-4">
                <div>
                    <Label htmlFor="threshold">Edge Threshold ({threshold})</Label>
                    <Slider 
                        id="threshold" 
                        value={[threshold]} 
                        onValueChange={(value) => setThreshold(value[0])}
                        max={100} 
                        step={1} 
                        disabled={!originalImage || isProcessing}
                    />
                </div>
                <Button onClick={handleDownload} disabled={!processedImage || isProcessing} className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download Stencil
                </Button>
                 {!isCvReady && !originalImage && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-8 w-full" />
                         <p className="text-xs text-muted-foreground mt-2">Initializing stencil engine...</p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
