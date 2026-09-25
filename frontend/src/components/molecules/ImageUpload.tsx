import { Camera, X, AlertCircle } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

import type { UploadPurpose } from '@/constants/upload';
import { cn } from '@/lib/utils';
import { uploadToS3 } from '@/services/upload.service';
import { compressAndConvertToWebP, validateImage } from '@/utils/imageCompression';

import Button from '../atoms/Button';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  error?: string;
  className?: string;
  maxSizeMB?: number;
  isEditable?: boolean;
  autoCompress?: boolean;
  purpose?: UploadPurpose;
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUpload({
  value,
  onChange,
  error,
  className,
  maxSizeMB = 10,
  isEditable = true,
  autoCompress = true,
  purpose,
  onUploadingChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !purpose) {
      return;
    }
    const error = validateImage(file, maxSizeMB);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      onUploadingChange?.(true);

      let uploadFile = file;
      if (autoCompress) {
        uploadFile = await compressAndConvertToWebP(file, maxSizeMB);
      }
      const url = await uploadToS3({
        file: uploadFile,
        purpose,
        onProgress: p => setUploadProgress(p),
      });

      setPreview(url);
      onChange?.(url);
    } catch (error) {
      console.error(error);
      toast.error('Upload Filed');
      onChange?.('');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      onUploadingChange?.(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2 w-full')}>
      <div
        className={cn(
          'relative h-62.5 rounded-md border overflow-hidden bg-muted',
          error && 'border-destructive',
          className
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className={cn(
              'h-full w-full object-cover transition-opacity',
              isUploading && 'opacity-40'
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
            <Camera className="h-8 w-8 mb-2" />
            <p className="text-sm">Upload image</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 relative flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {preview && isEditable && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input type="file" accept="image/*" hidden ref={inputRef} onChange={handleSelect} />
      {isEditable && (
        <Button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          variant="secondary"
        >
          {preview ? 'Change Image' : 'Upload Image'}
        </Button>
      )}

      <div className="min-h-[1.2rem] flex items-center">
        {error ? (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        ) : (
          <span className="text-sm invisible">placeholder</span>
        )}
      </div>
    </div>
  );
}
