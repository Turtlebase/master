import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function CompressPage() {
    return (
        <ToolLayout
            title="Image Compressor"
            description="Reduce the file size of your images without sacrificing quality."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="compression">Compression Level</Label>
                                <Slider id="compression" defaultValue={[80]} max={100} step={1} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
