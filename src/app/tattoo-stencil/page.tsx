"use client";

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';


declare global {
    var cv: any;
}

const howToUseSteps = [
    { title: "Step 1: Upload Your Design", description: "Choose a clear image. High-contrast designs with bold lines work best." },
    { title: "Step 2: Fine-Tune the Stencil", description: "Use the sliders for Smoothness, Detail, and Edge Strength to get the perfect stencil." },
    { title: "Step 3: Generate", description: "Click 'Generate Stencil'. The tool will process the image into a black and white outline." },
    { title: "Step 4: Download", description: "Save the generated stencil to your device. It's now ready to be printed on transfer paper." },
];

const faqItems = [
    { question: "How does this tool work?", answer: "This tool uses the Canny edge detection algorithm from the OpenCV.js computer vision library. It identifies the edges in your photo and converts them into lines to create a stencil." },
    { question: "What do the different sliders do?", answer: " 'Smoothness' reduces image noise. 'Detail Level' controls how many faint edges are detected. 'Edge Strength' defines how strong an edge must be to be included. Experiment to see what works best for your art." },
    { question: "Can I use this for complex photos?", answer: "Yes, but results may vary. The tool is optimized for converting drawings, logos, and graphics into stencils. For photorealistic stencils, you may need to adjust the sliders carefully." },
    { question: "Is my artwork uploaded to a server?", answer: "No. For your privacy and security, all image processing is done directly in your web browser. Your files never leave your computer." },
];

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
        const scriptId = 'opencv-script';
        if (document.getElementById(scriptId)) {
            setIsCvReady(!!window.cv);
            return;
        };

        const script = document.createElement('script');
        script.id = scriptId;
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
        }, 50); 
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
        setProcessedImage(image); 
    }
    
    return (
        <ToolLayout
            title="Tattoo Stencil Maker"
            description="Convert your photo to a black & white stencil with advanced controls."
            onImageUpload={handleImageUpload}
            processedImage={processedImage}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            hideUpload={!isCvReady || !!originalImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            <div className="space-y-6">
                {!originalImage && (
                     <div className="text-center">
                        {!isCvReady ? (
                             <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Initializing engine...</p>
                            </div>
                        ) : (
                           <p className="text-sm text-muted-foreground">Upload an image to get started.</p>
                        )}
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
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Wand2 />
                                )}
                                Generate Stencil
                            </Button>
                            <Button onClick={handleDownload} disabled={isProcessing || !processedImage || processedImage === originalImage} variant="secondary">
                                <Download />
                                Download Stencil
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ToolLayout>
    );
}
