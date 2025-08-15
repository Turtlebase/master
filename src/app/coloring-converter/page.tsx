
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
    { title: "Step 1: Upload Photo", description: "Select a photo from your device. Complex photos with lots of detail work best." },
    { title: "Step 2: Adjust Settings", description: "Use the 'Smoothness' and 'Line Thickness' sliders to fine-tune the final look of the line art." },
    { title: "Step 3: Generate", description: "Click the 'Generate Page' button to convert your photo into a coloring page." },
    { title: "Step 4: Download & Print", description: "Click 'Download Page' to save the image. You can then print it out and start coloring." },
];

const faqItems = [
    { question: "How does it work?", answer: "The tool uses the OpenCV.js library to perform edge detection on your image. It converts the image to grayscale, blurs it to reduce noise, and then uses an adaptive threshold to create the final black and white line art." },
    { question: "Is it free to use?", answer: "Yes, this tool is 100% free. There are no watermarks or limitations." },
    { question: "What happens to my uploaded image?", answer: "Nothing. The entire process happens in your browser. Your image is never sent to our servers, ensuring your privacy." },
    { question: "What do the sliders do?", answer: "'Smoothness' reduces fine details for a cleaner look. 'Line Thickness' controls how bold the outlines are. Experiment to see what works best for your image!" },
];


export default function ColoringConverterPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    
    const [blurValue, setBlurValue] = useState(7);
    const [lineThickness, setLineThickness] = useState(9);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isCvReady, setIsCvReady] = useState(false);

    useEffect(() => {
        document.title = "Coloring Book Page Converter | ImageCon.pro";
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

                    const ksize = blurValue % 2 === 0 ? blurValue + 1 : blurValue;
                    window.cv.medianBlur(gray, blurred, ksize);

                    const blockSize = lineThickness % 2 === 0 ? lineThickness + 1 : lineThickness;
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
        }, 50); 
    }, [originalImage, blurValue, lineThickness, toast, isCvReady]);

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
        setProcessedImage(image); 
    }
    
    return (
        <ToolLayout
            title="Coloring Book Converter"
            description="Turn any photo into a printable coloring book page for free. Convert your images to line art with adjustable settings and download instantly."
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
                                max={21} 
                                min={1}
                                step={2} 
                                disabled={isProcessing}
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
                                disabled={isProcessing}
                            />
                            <p className="text-xs text-muted-foreground">Controls the thickness of the outlines. Higher values create chunkier lines.</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing || !isCvReady}>
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Wand2 />
                                )}
                                Generate Page
                            </Button>
                            <Button onClick={handleDownload} disabled={isProcessing || !processedImage || processedImage === originalImage} variant="secondary">
                                <Download/>
                                Download Page
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ToolLayout>
    );
}
