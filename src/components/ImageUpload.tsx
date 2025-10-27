import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ImageUploadProps {
  bucket: "profile-images" | "insight-images" | "testimonial-images";
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  isProfile?: boolean;
  label?: string;
}

export const ImageUpload = ({
  bucket,
  currentImageUrl,
  onUploadComplete,
  isProfile = false,
  label = "Upload Image",
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (5MB for profiles, 10MB for others)
      const maxSize = bucket === "profile-images" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          {isProfile ? (
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} alt="Preview" className="object-cover" />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative w-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-40 w-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}

      {!previewUrl && !uploading && (
        <p className="text-xs text-muted-foreground">
          Upload {isProfile ? "a profile picture" : "an image"} (max {bucket === "profile-images" ? "5" : "10"}MB)
        </p>
      )}
    </div>
  );
};
