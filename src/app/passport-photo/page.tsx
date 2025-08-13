
"use client";

import { useState, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';
import { Slider } from '@/components/ui/slider';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';

const passportOptions = {
    'us': { name: 'US Passport (2x2 in)', width: 600, height: 600, aspect: 1 },
    'uk': { name: 'UK Passport (35x45 mm)', width: 700, height: 900, aspect: 35 / 45 },
    'in': { name: 'India Passport (3.5x4.5 cm)', width: 700, height: 900, aspect: 3.5 / 4.5 },
    'schengen': { name: 'Schengen Visa (35x45 mm)', width: 700, height: 900, aspect: 35/45 },
};

type PassportKey = keyof typeof passportOptions;

const howToUseSteps = [
    { title: "Step 1: Upload Your Headshot", description: "Choose a clear, recent photo of yourself with a plain background." },
    { title: "Step 2: Select the Format", description: "Pick the document type from the dropdown menu (e.g., 'US Passport'). The crop area will automatically adjust to the correct aspect ratio." },
    { title: "Step 3: Position Your Photo", description: "Use the zoom and rotation controls to position your head correctly within the frame. Official guidelines often require your head to be centered and a certain size." },
    { title: "Step 4: Generate & Download", description: "Click 'Generate Photo' to create the final image, then click 'Download Photo' to save it." },
];

const faqItems = [
    { question: "Does this tool guarantee my photo will be accepted?", answer: "This tool helps you meet the size and composition requirements (e.g., 2x2 inches), but it cannot check for other issues like improper lighting, shadows, or incorrect facial expressions. Always check the official guidelines for your specific document." },
    { question: "What does the 'White Background' switch do?", answer: "Most passport photos require a plain white or off-white background. If your original photo has a different background, this feature will replace it with a solid white one. This works best if your original background is relatively plain." },
    { question: "Are my photos kept private?", answer: "Yes. All processing is done in your browser. Your photos are never uploaded to our servers, ensuring your data is secure." },
    { question: "Can I use this for other types of ID photos?", answer: "Absolutely. While we have presets for common documents, you can use the Image Cropper and Resizer tools for any custom ID photo dimensions." },
];

export default function PassportPhotoPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [format, setFormat] = useState<PassportKey>('us');
    const [addWhiteBg, setAddWhiteBg] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    }
    
    const processImage = useCallback(async () => {
        if (!originalImage || !croppedAreaPixels) {
             toast({ variant: "destructive", title: "Error", description: "Please upload an image and position it." });
            return;
        }
        setIsProcessing(true);
        try {
            const currentFormat = passportOptions[format];
            const croppedImage = await getCroppedImg(
                originalImage,
                croppedAreaPixels,
                rotation,
                currentFormat.width,
                currentFormat.height,
                addWhiteBg
            );
            setProcessedImage(croppedImage);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Processing Error", description: "Could not process the image." });
        } finally {
            setIsProcessing(false);
        }
    }, [originalImage, croppedAreaPixels, rotation, toast, format, addWhiteBg]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `passport-photo-${format}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;
    const currentFormat = passportOptions[format];

    return (
        <ToolLayout
            title="Passport Photo Tool"
            description="Crop and resize photos for any official ID with standard presets."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
            processedImage={processedImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
            imageContainerChildren={
                hasImage && !processedImage && (
                     <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] bg-muted/30 rounded-lg flex flex-col">
                        <div className="relative flex-grow">
                             <Cropper
                                image={originalImage!}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={currentFormat.aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                         <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 p-2 bg-background/50 backdrop-blur-sm rounded-lg">
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.05))}><ZoomIn/></Button>
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(1, z - 0.05))}><ZoomOut/></Button>
                            <Button variant="outline" size="icon" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw/></Button>
                        </div>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {hasImage ? (
                    <>
                         {!processedImage && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zoom" className="flex justify-between"><span>Zoom</span><span>{zoom.toFixed(2)}x</span></Label>
                                    <Slider id="zoom" value={[zoom]} onValueChange={val => setZoom(val[0])} min={1} max={3} step={0.01} />
                                </div>
                                <div className="space-y-2">
                                     <Label htmlFor="rotation" className="flex justify-between"><span>Rotation</span><span>{rotation}°</span></Label>
                                    <Slider id="rotation" value={[rotation]} onValueChange={val => setRotation(val[0])} min={0} max={360} step={1} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="ratio">Choose Format</Label>
                            <Select onValueChange={(value) => setFormat(value as PassportKey)} defaultValue={format} disabled={isProcessing}>
                                <SelectTrigger id="ratio">
                                    <SelectValue placeholder="Select a format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(passportOptions).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <Label htmlFor="white-bg" className="flex flex-col gap-1">
                                <span>White Background</span>
                                <span className="text-xs text-muted-foreground">Adds a plain white BG</span>
                            </Label>
                            <Switch id="white-bg" checked={addWhiteBg} onCheckedChange={setAddWhiteBg} disabled={isProcessing}/>
                        </div>

                         <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing || !!processedImage}>
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Wand2/>
                                )}
                                Generate Photo
                            </Button>
                           {processedImage && (
                                <Button onClick={handleDownload} disabled={isProcessing} variant="secondary">
                                    <Download/>
                                    Download Photo
                                </Button>
                           )}
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Upload an image to get started.</p>
                )}
            </div>
        </ToolLayout>
    );
}
