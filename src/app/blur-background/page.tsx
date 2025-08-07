import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function DslrBlurPage() {
    return (
        <ToolLayout
            title="DSLR Blur"
            description="Apply a beautiful, realistic background blur to your photos to make subjects pop."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="intensity">Blur Intensity</Label>
                                <Slider id="intensity" defaultValue={[40]} max={100} step={1} />
                                <p className="text-xs text-muted-foreground mt-2">Draw a selection on the image to blur the background.</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
