
"use client";

import { useState, useCallback, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { Download, Loader2, CropIcon, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../passport-photo/cropUtils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Faq } from '@/components/faq';
import { HowToUse } from '@/components/how-to-use';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Online Image Cropper',
//   description: 'Crop images online for free. Use presets like square and widescreen, or crop freely. Features include zoom and rotation for precise editing.',
// };

const aspectRatios = [
    { value: 0, name: 'Freeform' },
    { value: 1 / 1, name: '1:1 Square' },
    { value: 4 / 3, name: '4:3 Standard' },
    { value: 16 / 9, name: '16:9 Widescreen' },
];

const howToUseSteps = [
    { title: "Step 1: Upload Image", description: "Select the image you wish to crop from your device." },
    { title: "Step 2: Set Aspect Ratio", description: "Choose a preset aspect ratio (like Square or Widescreen) or select 'Freeform' for a custom crop." },
    { title: "Step 3: Adjust Crop Area", description: "Drag the corners of the crop box to resize it. You can also use the zoom slider and rotation button for fine adjustments." },
    { title: "Step 4: Crop & Download", description: "Click 'Crop Image' to see the result. If you like it, click 'Download Image'." },
];

const faqItems = [
    { question: "What is an aspect ratio?", answer: "An aspect ratio is the proportional relationship between the width and height of an image. For example, a 1:1 ratio is a perfect square, while 16:9 is standard for HD video." },
    { question: "Will cropping reduce my image quality?", answer: "Cropping itself doesn't reduce quality, but it does reduce the number of pixels in your image. If you crop a small section from a large image and then enlarge it, it may appear blurry." },
    { question: "Can I undo a crop?", answer: "If you don't like the result, you can simply click the 'Reset' (X) button on the image preview to start over with the original photo." },
    { question: "Is this service private?", answer: "Yes. All cropping is performed in your browser. Your images are never uploaded to any server, ensuring your data remains private." },
];


export default function CropPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState<number>(aspectRatios[0].value);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        document.title = "Online Image Cropper | ImageCon.pro";
    }, []);

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
             toast({ variant: "destructive", title: "Error", description: "Please upload an image and position the crop area." });
            return;
        }
        if (croppedAreaPixels.width === 0 || croppedAreaPixels.height === 0) {
            toast({ variant: "destructive", title: "Error", description: "The cropped area is empty. Please select a valid area." });
            return;
        }
        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(
                originalImage,
                croppedAreaPixels,
                rotation,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                false
            );
            setProcessedImage(croppedImage);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Processing Error", description: "Could not process the image." });
        } finally {
            setIsProcessing(false);
        }
    }, [originalImage, croppedAreaPixels, rotation, toast]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `cropped-image.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleRotate = () => {
        setRotation((prevRotation) => (prevRotation + 90) % 360);
    }

    const hasImage = !!originalImage;
    const currentAspect = aspect === 0 ? undefined : aspect;

    return (
        <ToolLayout
            title="Image Cropper"
            description="Crop images with precision using presets, rotation, and zoom."
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
                                aspect={currentAspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                         <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 p-2 bg-background/50 backdrop-blur-sm rounded-lg">
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.2))}><ZoomIn/></Button>
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(1, z - 0.2))}><ZoomOut/></Button>
                            <Button variant="outline" size="icon" onClick={handleRotate}><RotateCw/></Button>
                        </div>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {hasImage ? (
                    <>
                        <div className="space-y-4">
                            <Label>Aspect Ratio</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {aspectRatios.map(ratio => (
                                    <Button key={ratio.name} variant={aspect === ratio.value ? "secondary" : "outline"} onClick={() => setAspect(ratio.value)}>
                                        {ratio.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zoom" className="flex justify-between"><span>Zoom</span><span>{zoom.toFixed(2)}x</span></Label>
                            <Slider id="zoom" value={[zoom]} onValueChange={val => setZoom(val[0])} min={1} max={3} step={0.1} />
                        </div>
                        
                         <div className="flex flex-col gap-4 !mt-8">
                            <Button onClick={processImage} disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <CropIcon />
                                )}
                                Crop Image
                            </Button>
                           {processedImage && (
                                <Button onClick={handleDownload} disabled={isProcessing} variant="secondary">
                                    <Download />
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
