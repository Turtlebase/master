
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Download, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Faq } from '@/components/faq';
import { HowToUse } from '@/components/how-to-use';

type FilterType = 'grayscale' | 'sepia' | 'invert' | 'vintage' | null;

const filterMatrix = {
    grayscale: (r: number, g: number, b: number) => {
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        return [avg, avg, avg];
    },
    sepia: (r: number, g: number, b: number) => {
        return [
            (r * 0.393) + (g * 0.769) + (b * 0.189),
            (r * 0.349) + (g * 0.686) + (b * 0.168),
            (r * 0.272) + (g * 0.534) + (b * 0.131)
        ];
    },
    invert: (r: number, g: number, b: number) => {
        return [255 - r, 255 - g, 255 - b];
    },
    vintage: (r: number, g: number, b: number) => {
        const sepia = filterMatrix.sepia(r, g, b);
        const contrast = 1.1;
        const brightness = -10;
        const finalR = Math.max(0, Math.min(255, (sepia[0] - 128) * contrast + 128 + brightness));
        const finalG = Math.max(0, Math.min(255, (sepia[1] - 128) * contrast + 128 + brightness));
        const finalB = Math.max(0, Math.min(255, (sepia[2] - 128) * contrast + 128 + brightness));
        return [finalR, finalG, finalB];
    },
};

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Select the photo you'd like to apply a filter to." },
    { title: "Step 2: Choose a Filter", description: "Click on any of the filter buttons (e.g., Grayscale, Sepia) to instantly see a preview of the effect." },
    { title: "Step 3: Experiment", description: "Feel free to try different filters. You can always go back to the original by clicking 'Revert to Original'." },
    { title: "Step 4: Download Your Image", description: "Once you've chosen a filter you love, click the 'Download Image' button to save your newly styled photo." },
];

const faqItems = [
    { question: "What are image filters?", answer: "Image filters are pre-set effects that change the look and feel of your photo by adjusting its colors, contrast, and tones. They are a quick and easy way to give your image a specific style, like a vintage or black-and-white look." },
    { question: "Is the process destructive to my original photo?", answer: "Not at all. Your original photo is never modified. Our tool applies the filter to a copy of the image, and all processing is done within your browser." },
    { question: "Can I combine multiple filters?", answer: "This tool is designed to apply one filter at a time. To apply multiple effects, you would need to download the image with the first filter and then re-upload it to apply a second one." },
    { question: "Are my images private?", answer: "Yes, 100%. The filtering process happens on your own computer. Your images are never sent to or stored on our servers." },
];

export default function FiltersPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        document.title = "Free Image Filters | ImageCon.pro";
    }, []);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setProcessedImage(image);
        setActiveFilter(null);
        if (image) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = image;
            img.onload = () => {
                imageRef.current = img;
            };
        } else {
            imageRef.current = null;
        }
    };

    const applyFilter = useCallback((filter: FilterType) => {
        if (!originalImage || !imageRef.current) return;
        
        if (filter === null) {
            setProcessedImage(originalImage);
            setActiveFilter(null);
            return;
        }

        setActiveFilter(filter);
        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
             toast({ variant: "destructive", title: "Error", description: "Could not process image." });
            return;
        };

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const filterFn = filterMatrix[filter];

        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = filterFn(data[i], data[i+1], data[i+2]);
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
        setProcessedImage(canvas.toDataURL('image/png'));

    }, [originalImage, toast]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `${activeFilter || 'filtered'}-image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;
    const hasFilter = !!activeFilter;

    return (
        <ToolLayout
            title="Image Filters"
            description="Apply classic and artistic filters to give your photos a new look."
            onImageUpload={handleImageUpload}
            processedImage={processedImage}
            isProcessing={false}
            showReset={hasImage}
            hideUpload={hasImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            {hasImage ? (
                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-medium mb-2">Filters</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Button variant={activeFilter === 'grayscale' ? 'secondary' : 'outline'} onClick={() => applyFilter('grayscale')}>Grayscale</Button>
                           <Button variant={activeFilter === 'sepia' ? 'secondary' : 'outline'} onClick={() => applyFilter('sepia')}>Sepia</Button>
                           <Button variant={activeFilter === 'invert' ? 'secondary' : 'outline'} onClick={() => applyFilter('invert')}>Invert</Button>
                           <Button variant={activeFilter === 'vintage' ? 'secondary' : 'outline'} onClick={() => applyFilter('vintage')}>Vintage</Button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={() => applyFilter(null)} disabled={!hasFilter} variant="outline">
                            <Undo2 />
                            Revert to Original
                        </Button>
                         <Button onClick={handleDownload} disabled={!hasFilter} variant="secondary">
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
