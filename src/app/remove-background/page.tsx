
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { removeBackground } from '@/ai/flows/remove-background-flow';

const backgroundOptions = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#22C55E' },
];

const howToUseSteps = [
    { title: "Step 1: Upload Your Subject", description: "Select the main image from which you want to remove the background." },
    { title: "Step 2: AI Processing", description: "The tool will automatically remove the background and show you the result with a transparent background." },
    { title: "Step 3: Choose New Background", description: "Select a new background color from the palette, or click 'Upload Background' to use your own image." },
    { title: "Step 4: Download", description: "Click the 'Download Image' button to save your new composite image." },
];

const faqItems = [
    { question: "How does the background removal work?", answer: "This tool uses a powerful AI API to intelligently identify the foreground (the subject) and separate it from the background." },
    { question: "Are my images stored?", answer: "Your images are sent to a service for processing and are not stored by us. Please refer to our privacy policy for more details." },
    { question: "What is the best type of image to use?", answer: "Images with a clear distinction between the subject and the background yield the best results. The model is very powerful and works on a wide variety of images." },
    { question: "Can I use any image as a custom background?", answer: "Yes, you can upload any JPG, PNG, or WEBP image. The tool will automatically resize it to match the dimensions of your main subject's image." },
];


export default function RemoveBackgroundPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [imageWithTransparentBg, setImageWithTransparentBg] = useState<string | null>(null);
    const [customBg, setCustomBg] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bgColor, setBgColor] = useState('transparent');

    const bgFileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (image: string | null, file: File | null) => {
        if (!image) {
            setOriginalImage(null);
            setImageWithTransparentBg(null);
            setProcessedImage(null);
            setCustomBg(null);
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        setOriginalImage(image);
        setImageWithTransparentBg(null);
        setProcessedImage(null);
        setCustomBg(null);
        setBgColor('transparent');
        
        try {
            const result = await removeBackground({ image_file_b64: image.split(',')[1] });
            if (result.error) {
                throw new Error(result.error);
            }
            const resultUrl = `data:image/png;base64,${result.image_file_b64}`;
            setImageWithTransparentBg(resultUrl);
            setProcessedImage(resultUrl);
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Processing Error",
                description: error.message || "Could not remove background. The API may be unavailable or you may have run out of credits.",
            });
            setOriginalImage(null);
        } finally {
            setIsProcessing(false);
        }
    }, [toast]);
    
    const applyBackground = useCallback(() => {
        if (!imageWithTransparentBg) return;

        const foregroundImg = new Image();
        foregroundImg.crossOrigin = "anonymous";
        foregroundImg.src = imageWithTransparentBg;

        foregroundImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = foregroundImg.naturalWidth;
            canvas.height = foregroundImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (customBg) {
                const backgroundImg = new Image();
                backgroundImg.crossOrigin = "anonymous";
                backgroundImg.src = customBg;
                backgroundImg.onload = () => {
                    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(foregroundImg, 0, 0);
                    setProcessedImage(canvas.toDataURL('image/png'));
                }
            } else {
                 if (bgColor === 'transparent') {
                    setProcessedImage(imageWithTransparentBg);
                    return;
                }
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(foregroundImg, 0, 0);
                setProcessedImage(canvas.toDataURL('image/png'));
            }
        };
    }, [imageWithTransparentBg, bgColor, customBg]);

    useEffect(() => {
        applyBackground();
    }, [imageWithTransparentBg, bgColor, customBg, applyBackground]);
    
    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `background-removed.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setCustomBg(result);
                setBgColor('custom');
            };
            reader.readAsDataURL(file);
        }
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
                        <div className="space-y-4">
                            <div>
                                <Label>Background Color</Label>
                                <div className="flex gap-2 flex-wrap pt-2">
                                    {backgroundOptions.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => { setBgColor(color.value); setCustomBg(null); }}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 transition-all disabled:opacity-50",
                                                bgColor === color.value ? 'border-primary scale-110' : 'border-border',
                                                color.value === 'transparent' && 'bg-transparent bg-cover bg-center [background-image:linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)),linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1))] [background-size:10px_10px] [background-position:0_0,5px_5px]'
                                            )}
                                            style={color.value !== 'transparent' ? { backgroundColor: color.value } : {}}
                                            aria-label={color.name}
                                            disabled={isProcessing || !imageWithTransparentBg}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>Custom Background</Label>
                                 <Button 
                                    variant="outline" 
                                    className="w-full mt-2" 
                                    onClick={() => bgFileInputRef.current?.click()}
                                    disabled={isProcessing || !imageWithTransparentBg}
                                >
                                    <Upload />
                                    Upload Background
                                </Button>
                                <input
                                    type="file"
                                    ref={bgFileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleCustomBgUpload}
                                />
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
