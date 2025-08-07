"use client";

import ToolLayout from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ResizePage() {
    return (
        <ToolLayout
            title="Image Resizer"
            description="Quickly resize any image to your specified dimensions."
        >
            {(image) => (
                <>
                    {image && (
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="width">Width (px)</Label>
                                    <Input id="width" type="number" placeholder="e.g., 1920" />
                                </div>
                                 <div>
                                    <Label htmlFor="height">Height (px)</Label>
                                    <Input id="height" type="number" placeholder="e.g., 1080" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <Label htmlFor="aspect-ratio">Keep Aspect Ratio</Label>
                                <Switch id="aspect-ratio" defaultChecked />
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
