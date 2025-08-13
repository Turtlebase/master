
"use client";

import { useState, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import removeBackground from "@imgly/background-removal";
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';


const backgroundColors = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#22C55E' },
];

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Select any image from which you want to remove the background. Clear subjects work best." },
    { title: "Step 2: Processing", description: "The tool will automatically detect the main subject and remove the background. This may take a few moments depending on your computer's speed." },
    { title: "Step 3: Choose New Background", description: "Once processed, you can choose a new background color from the palette or keep it transparent." },
    { title: "Step 4: Download", description: "Click the 'Download Image' button to save your new image with the background removed." },
];

const faqItems = [
    { question: "How does the background removal work?", answer: "This tool uses a state-of-the-art, browser-based AI model (@imgly/background-removal) to intelligently identify the foreground (the subject) and separate it from the background. All processing happens on your computer." },
    { question: "Are my images uploaded to a server?", answer: "Absolutely not. Your privacy is paramount. The entire process, from loading the AI model to processing the image, happens locally in your browser." },
    { question: "What is the best type of image to use?", answer: "Images with a clear distinction between the subject and the background yield the best results. The model is very powerful and works on a wide variety of images." },
    { question: "Why is it slow the first time?", answer: "The first time you use the tool, your browser needs to download and initialize the AI model. Subsequent uses will be much faster as the model will be cached." },
];


export default function RemoveBackgroundPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bgColor, setBgColor] = useState('transparent');
    
    const handleImageUpload = async (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        setBgColor('transparent');
        if (image) {
            await processImage(image);
        }
    }

    const processImage = useCallback(async (image: string, newBgColor?: string) => {
        const finalBgColor = newBgColor || bgColor;
        setIsProcessing(true);
        setProcessedImage(null);

        try {
            const resultBlob = await removeBackground(image, {
                onProgress: (progress) => {
                    console.log(`Loading model: ${progress.toFixed(2)}%`);
                     toast({
                        title: "Initializing AI Engine...",
                        description: `The AI model is loading. Progress: ${progress.toFixed(0)}%`,
                    });
                },
            });
            const resultUrl = URL.createObjectURL(resultBlob);
            
            if(finalBgColor && finalBgColor !== 'transparent') {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if(ctx) {
                        ctx.fillStyle = finalBgColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        setProcessedImage(canvas.toDataURL('image/png'));
                    } else {
                         setProcessedImage(resultUrl);
                    }
                    URL.revokeObjectURL(resultUrl);
                }
                img.src = resultUrl;

            } else {
                setProcessedImage(resultUrl);
            }

        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Processing Error",
                description: "Could not remove background. The AI model may have failed. Please try a different image.",
            });
             setProcessedImage(originalImage);
        } finally {
            setIsProcessing(false);
        }
    }, [toast, bgColor]);


    const handleBgColorChange = (color: string) => {
        setBgColor(color);
        if(originalImage){
             processImage(originalImage, color);
        }
    }

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `background-removed.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;

    return (
        <ToolLayout
            title="AI Background Remover"
            description="Automatically remove the background from any image with a single click."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
            processedImage={processedImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            <div className="space-y-6">
                {hasImage ? (
                    <>
                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2 flex-wrap">
                                {backgroundColors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleBgColorChange(color.value)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 transition-all disabled:opacity-50",
                                            bgColor === color.value ? 'border-primary scale-110' : 'border-border',
                                            color.value === 'transparent' && 'bg-transparent bg-cover bg-center [background-image:linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)),linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1))] [background-size:10px_10px] [background-position:0_0,5px_5px]'
                                        )}
                                        style={color.value !== 'transparent' ? { backgroundColor: color.value } : {}}
                                        aria-label={color.name}
                                        disabled={isProcessing}
                                    />
                                ))}
                            </div>
                        </div>
                         <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={handleDownload} disabled={isProcessing || !processedImage} variant="secondary">
                                <Download />
                                Download Image
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Upload an image to see the magic.</p>
                )}
            </div>
        </ToolLayout>
    );
}
