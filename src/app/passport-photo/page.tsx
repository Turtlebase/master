"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';

const passportOptions = {
    'us': { name: 'US Passport (2x2 in)', width: 600, height: 600, aspect: 1 },
    'uk': { name: 'UK Passport (35x45 mm)', width: 700, height: 900, aspect: 35 / 45 },
    'in': { name: 'India Passport (3.5x4.5 cm)', width: 700, height: 900, aspect: 3.5 / 4.5 },
    'schengen': { name: 'Schengen Visa (35x45 mm)', width: 700, height: 900, aspect: 35/45 },
};

type PassportKey = keyof typeof passportOptions;

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
            imageContainerChildren={
                hasImage && !processedImage && (
                    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px]">
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
                )
            }
        >
            <div className="space-y-6">
                {hasImage && !processedImage && (
                    <div className='absolute -top-16 right-0 flex gap-2 p-4'>
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(1, z - 0.1))}>-</Button>
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => z + 0.1)}>+</Button>
                        <Button variant="outline" size="icon" onClick={() => setRotation(r => r - 90)}><RotateCcw/></Button>
                    </div>
                )}
                
                {hasImage ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="ratio">Choose Format</Label>
                            <Select onValueChange={(value) => setFormat(value as PassportKey)} defaultValue={format}>
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
                            <Switch id="white-bg" checked={addWhiteBg} onCheckedChange={setAddWhiteBg} />
                        </div>

                         <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-5 w-5" />
                                )}
                                Generate Photo
                            </Button>
                           {processedImage && (
                                <Button onClick={handleDownload} disabled={isProcessing} variant="secondary">
                                    <Download className="mr-2 h-5 w-5" />
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
