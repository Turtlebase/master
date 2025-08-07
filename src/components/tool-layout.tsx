"use client";

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Download } from 'lucide-react';
import Image from 'next/image';
import AiSuggestions from './ai-suggestions';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode | ((image: string | null) => React.ReactNode);
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if(e.target?.result) {
            setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onReset = () => {
    setImage(null);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">{title}</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">{description}</p>
        </div>

        {!image ? (
            <Card 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={onButtonClick}
                className={`relative flex flex-col items-center justify-center w-full p-12 lg:p-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
                <UploadCloud className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Drag & drop your image here</h2>
                <p className="text-muted-foreground">or click to browse</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                />
            </Card>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 relative group bg-card p-4 rounded-lg shadow-sm">
                    <Image
                        src={image}
                        alt="Uploaded image"
                        width={800}
                        height={800}
                        className="rounded-lg object-contain w-full max-h-[70vh]"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={onReset}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {typeof children === 'function' ? children(image) : children}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <AiSuggestions imageDataUri={image} />
                        </CardContent>
                    </Card>

                     <Button size="lg" className="w-full">
                        <Download className="mr-2 h-5 w-5" />
                        Download Image
                    </Button>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}
