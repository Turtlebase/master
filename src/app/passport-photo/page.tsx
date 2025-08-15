
"use client";

import { useState, useCallback } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Sparkles, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCroppedImg } from './cropUtils';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import { cn } from '@/lib/utils';
import Cropper from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { removeBackground } from '@/ai/flows/remove-background-flow';


const passportOptions = {
    'us': { name: 'US Passport (2x2 in)', width: 600, height: 600, aspect: 1 },
    'uk': { name: 'UK Passport (35x45 mm)', width: 700, height: 900, aspect: 35 / 45 },
    'in': { name: 'India Passport (3.5x4.5 cm)', width: 700, height: 900, aspect: 3.5 / 4.5 },
    'schengen': { name: 'Schengen Visa (35x45 mm)', width: 700, height: 900, aspect: 35/45 },
};

type PassportKey = keyof typeof passportOptions;

const backgroundColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Light Blue', value: '#E1F5FE' },
    { name: 'Gray', value: '#F5F5F5' },
    { name: 'Black', value: '#000000' },
];

const howToUseSteps = [
    { title: "Step 1: Upload Your Headshot", description: "Choose a clear, recent photo of yourself against any background." },
    { title: "Step 2: AI Background Removal", description: "The tool will automatically remove the background. This can take a moment." },
    { title: "Step 3: Position Your Photo", description: "Use the zoom and rotation controls to position your head correctly within the frame. Official guidelines often require your head to be centered and a certain size." },
    { title: "Step 4: Select Format & Background", description: "Pick the document type and choose a background color from the palette." },
    { title: "Step 5: Generate & Download", description: "Click 'Generate Photo' to create the final image, then click 'Download Photo' to save it." },
];

const faqItems = [
    { question: "How does the background removal work?", answer: "This tool uses a powerful AI to automatically detect the subject and remove the background. For best results, use a clear image." },
    { question: "Does this tool guarantee my photo will be accepted?", answer: "This tool helps you meet the size, composition, and background color requirements, but it cannot check for other issues like improper lighting or incorrect facial expressions. Always double-check the official guidelines for your specific document." },
    { question: "Are my photos kept private?", answer: "Your photos are processed on our servers and are not stored. Please refer to our privacy policy for more details." },
];

export default function PassportPhotoPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [imageWithBgRemoved, setImageWithBgRemoved] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [format, setFormat] = useState<PassportKey>('us');
    const [bgColor, setBgColor] = useState<string>('#FFFFFF');

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = async (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(null);
        setImageWithBgRemoved(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);

        if (image) {
            setIsProcessing(true);
            try {
                const result = await removeBackground({ image_file_b64: image.split(',')[1] });
                 if (result.error) {
                    throw new Error(result.error);
                }
                const resultUrl = `data:image/png;base64,${result.image_file_b64}`;
                setImageWithBgRemoved(resultUrl);
            } catch (error: any) {
                 toast({ variant: "destructive", title: "Background Removal Failed", description: error.message || "Could not automatically remove background. The original image will be used." });
                 // Fallback to original if server fails, but let user know.
                 setImageWithBgRemoved(image); 
            } finally {
                setIsProcessing(false);
            }
        }
    }
    
    const processImage = useCallback(async () => {
        if (!imageWithBgRemoved || !croppedAreaPixels) {
             toast({ variant: "destructive", title: "Error", description: "Please upload an image and position it." });
            return;
        }
        setIsProcessing(true);
        try {
            const currentFormat = passportOptions[format];
            const croppedImage = await getCroppedImg(
                imageWithBgRemoved,
                croppedAreaPixels,
                rotation,
                currentFormat.width,
                currentFormat.height,
                bgColor
            );
            setProcessedImage(croppedImage);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Processing Error", description: "Could not process the image." });
        } finally {
            setIsProcessing(false);
        }
    }, [imageWithBgRemoved, croppedAreaPixels, rotation, toast, format, bgColor]);

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
            description="Create compliant passport photos with AI background removal."
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
            processedImage={processedImage || imageWithBgRemoved}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
            imageContainerChildren={
                hasImage && !processedImage && imageWithBgRemoved && (
                     <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] bg-muted/30 rounded-lg flex flex-col">
                        <div className="relative flex-grow">
                             <Cropper
                                image={imageWithBgRemoved}
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
                            <Select onValueChange={(value) => setFormat(value as PassportKey)} defaultValue={format} disabled={isProcessing || !imageWithBgRemoved}>
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
                        
                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2">
                                {backgroundColors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setBgColor(color.value)}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 transition-all",
                                            bgColor === color.value ? 'border-primary scale-110' : 'border-border'
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        aria-label={color.name}
                                        disabled={isProcessing || !imageWithBgRemoved}
                                    />
                                ))}
                            </div>
                        </div>

                         <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing || !!processedImage || !imageWithBgRemoved}>
                                {isProcessing && !imageWithBgRemoved ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Sparkles/>
                                )}
                                {isProcessing && !imageWithBgRemoved ? 'Removing Background...' : 'Generate Photo'}
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
