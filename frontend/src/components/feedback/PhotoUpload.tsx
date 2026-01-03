import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 5,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG, WebP, and SVG images are allowed');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const newPhotos = [...photos, ...filesToAdd];
      onChange(newPhotos);

      // Create previews
      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onChange(newPhotos);
    setPreviews(newPreviews);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Upload button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleUploadClick}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed',
              'flex flex-col items-center justify-center gap-2',
              'transition-colors hover:border-primary/50',
              'bg-[rgb(209,215,224)] hover:bg-[rgb(209,215,224)]/80'
            )}
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Add Photo
            </span>
          </button>
        )}

        {/* Photo previews */}
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border"
          >
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemovePhoto(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-muted-foreground">
        {photos.length} / {maxPhotos} photos uploaded
      </p>
    </div>
  );
}
