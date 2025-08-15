
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Faq } from '@/components/faq';
import { HowToUse } from '@/components/how-to-use';

const howToUseSteps = [
    { title: "Step 1: Upload an Image", description: "Select the image you want to resize." },
    { title: "Step 2: Enter New Dimensions", description: "Type your desired width or height in pixels into the input fields. If 'Keep Aspect Ratio' is on, the other dimension will update automatically." },
    { title: "Step 3: Keep Aspect Ratio (Optional)", description: "Toggle the switch to lock or unlock the aspect ratio. Keeping it on prevents your image from being stretched or distorted." },
    { title: "Step 4: Generate and Download", description: "Click 'Generate' to see the resized image. Then, click 'Download Image' to save it." },
];

const faqItems = [
    { question: "What does 'Keep Aspect Ratio' do?", answer: "It maintains the original proportions of your image. If you change the width, the height adjusts automatically to prevent the image from looking stretched or squashed. It is highly recommended to keep this on." },
    { question: "Will resizing make my image lose quality?", answer: "Making an image smaller usually doesn't result in significant quality loss. However, making an image much larger than its original size can cause it to look blurry or pixelated." },
    { question: "What units are the width and height in?", answer: "The dimensions are in pixels (px), which is the standard unit for digital images on screens." },
    { question: "Is this tool private?", answer: "Yes. The resizing process happens entirely within your web browser. Your images are never uploaded to a server, ensuring your privacy." },
];

export default function ResizePage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [width, setWidth] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [keepAspectRatio, setKeepAspectRatio] = useState(true);
    const [originalDimensions, setOriginalDimensions] = useState<{w: number, h: number} | null>(null);
    
    const aspectRatio = useRef<number>(1);

    useEffect(() => {
        document.title = "Free Image Resizer | ImageCon.pro";
    }, []);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        if (image) {
            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ w: img.width, h: img.height });
                setWidth(img.width);
                setHeight(img.height);
                aspectRatio.current = img.width / img.height;
            };
            img.src = image;
        } else {
            setOriginalDimensions(null);
            setWidth('');
            setHeight('');
        }
    }

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWidth = e.target.value === '' ? '' : parseInt(e.target.value, 10);
        setWidth(newWidth);
        if (keepAspectRatio && newWidth !== '' && !isNaN(newWidth)) {
            setHeight(Math.round(newWidth / aspectRatio.current));
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeight = e.target.value === '' ? '' : parseInt(e.target.value, 10);
        setHeight(newHeight);
        if (keepAspectRatio && newHeight !== '' && !isNaN(newHeight)) {
            setWidth(Math.round(newHeight * aspectRatio.current));
        }
    };

    const processImage = useCallback(() => {
        if (!originalImage || !width || !height || +width <= 0 || +height <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Dimensions",
                description: "Please enter valid positive numbers for width and height.",
            });
            return;
        }

        setIsProcessing(true);
        setProcessedImage(null);

        setTimeout(() => {
            const img = new Image();
            img.src = originalImage;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = +width;
                canvas.height = +height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsProcessing(false);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not process the image.",
                    });
                    return;
                }
                ctx.drawImage(img, 0, 0, +width, +height);
                setProcessedImage(canvas.toDataURL('image/png'));
                setIsProcessing(false);
            }
            img.onerror = () => {
                setIsProcessing(false);
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load the original image for processing.",
                });
            }
        }, 100);

    }, [originalImage, width, height, toast]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'resized-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ToolLayout
            title="Image Resizer"
            description="Quickly resize any image to your specified dimensions. Maintain aspect ratio to prevent distortion. Free, fast, and secure online tool."
            onImageUpload={handleImageUpload}
            processedImage={processedImage || originalImage}
            isProcessing={isProcessing}
            showReset={!!originalImage}
            hideUpload={!!originalImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            {originalImage ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="width">Width (px)</Label>
                            <Input id="width" type="number" placeholder="e.g., 1920" value={width} onChange={handleWidthChange} />
                        </div>
                         <div>
                            <Label htmlFor="height">Height (px)</Label>
                            <Input id="height" type="number" placeholder="e.g., 1080" value={height} onChange={handleHeightChange}/>
                        </div>
                    </div>
                    {originalDimensions && (
                         <p className="text-xs text-muted-foreground -mt-2 text-center">
                            Original: {originalDimensions.w} x {originalDimensions.h}
                         </p>
                    )}
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="aspect-ratio" className="flex flex-col gap-1">
                           <span>Keep Aspect Ratio</span>
                           <span className="text-xs font-normal text-muted-foreground">Prevents distortion</span>
                        </Label>
                        <Switch id="aspect-ratio" checked={keepAspectRatio} onCheckedChange={setKeepAspectRatio} />
                    </div>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={processImage} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            Generate
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
