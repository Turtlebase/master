import ToolLayout from "@/components/tool-layout";
import { Button } from "@/components/ui/button";

export default function CropPage() {
    return (
        <ToolLayout
            title="Image Cropper"
            description="Crop your images with precision using presets or custom dimensions."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Draw a crop area on the image or use a preset.</p>
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline">1:1</Button>
                                <Button variant="outline">4:3</Button>
                                <Button variant="outline">16:9</Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
