import {
  Upload,
  X,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

import type { UploadPurpose } from '@/constants/upload';
import { uploadToS3 } from '@/services/upload.service';
import { handleApiError } from '@/utils/handleApiError';
import { compressAndConvertToWebP } from '@/utils/imageCompression';

interface FileState {
  id: string;
  file?: File;
  url?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  type: 'image' | 'video';
  error?: string;
}

interface MultiUploadProps {
  value?: { url: string; type: 'image' | 'video' }[];
  onChange?: (files: { url: string; type: 'image' | 'video' }[]) => void;
  maxFiles?: number;
  maxImageSizeMB?: number;
  onUploadingChange?: (isUploading: boolean) => void;
  onPreview?: (index: number) => void;
  maxVideoSizeMB?: number;
  purpose: UploadPurpose;
  label?: string;
  disabled?: boolean;
  autoCompress?: boolean;
}

export function MultiUpload({
  value = [],
  onChange,
  maxFiles = 4,
  maxImageSizeMB = 10,
  maxVideoSizeMB = 50,
  onUploadingChange,
  onPreview,
  purpose,
  label,
  disabled = false,
  autoCompress = true,
}: MultiUploadProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (files.length === 0 && value.length > 0) {
      setFiles(
        value.map((v, i) => ({
          id: `val-${i}`,
          url: v.url,
          status: 'success',
          progress: 100,
          type: v.type,
        }))
      );
    }
  }, [value, files.length]);

  useEffect(() => {
    const uploading = files.some(f => f.status === 'uploading' || f.status === 'pending');
    onUploadingChange?.(uploading);
  }, [files, onUploadingChange]);

  const notifyChange = (currentFiles: FileState[]) => {
    const successful = currentFiles
      .filter(f => f.status === 'success' && f.url)
      .map(f => ({ url: f.url!, type: f.type }));
    onChange?.(successful);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) {
      return;
    }

    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: FileState[] = [];
    for (const file of selected.slice(0, remaining)) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const maxSize = type === 'image' ? maxImageSizeMB : maxVideoSizeMB;

      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSize}MB`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
        type,
      });
    }

    if (!validFiles.length) {
      return;
    }
    setFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(f => void uploadFile(f));

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const uploadFile = async (fileState: FileState) => {
    if (!fileState.file) {
      return;
    }
    updateFile(fileState.id, { status: 'uploading' });
    try {
      let fileToUpload = fileState.file;
      if (autoCompress && fileState.type === 'image') {
        fileToUpload = await compressAndConvertToWebP(fileState.file, maxImageSizeMB);
      }
      const url = await uploadToS3({
        file: fileToUpload,
        purpose,
        onProgress: p => updateFile(fileState.id, { progress: p }),
      });
      updateFile(fileState.id, { status: 'success', url, progress: 100 });
    } catch (error) {
      toast.error(handleApiError(error) || `Upload failed: ${fileState.file.name}`);
      setFiles(prev => {
        const next = prev.filter(f => f.id !== fileState.id);
        notifyChange(next);
        return next;
      });
    }
  };

  const updateFile = (id: string, updates: Partial<FileState>) => {
    setFiles(prev => {
      const next = prev.map(f => (f.id === id ? { ...f, ...updates } : f));
      notifyChange(next);
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      notifyChange(next);
      return next;
    });
  };
  const successFiles = files.filter(f => f.status === 'success' && f.url);

  return (
    <div className="space-y-3 w-full">
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {files.map(file => {
          const previewIdx = successFiles.findIndex(f => f.id === file.id);
          return (
            <div
              key={file.id}
              onClick={() => file.status === 'success' && file.url && onPreview?.(previewIdx)}
              className="group relative aspect-square rounded-xl border border-border bg-muted cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all hover:border-primary/30"
            >
              {file.status === 'success' && file.url ? (
                file.type === 'video' ? (
                  <video src={file.url} className="h-full w-full object-cover" />
                ) : (
                  <img src={file.url} alt="preview" className="h-full w-full object-cover" />
                )
              ) : file.file ? (
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                  {file.type === 'video' ? (
                    <Film size={24} className="text-primary" />
                  ) : (
                    <ImageIcon size={24} className="text-primary" />
                  )}
                  <span className="text-[10px] text-muted-foreground truncate max-w-full">
                    {file.file.name}
                  </span>
                </div>
              ) : (
                <FileText size={24} className="text-muted-foreground" />
              )}

              {file.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3">
                  <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white font-medium mt-2">{file.progress}%</span>
                </div>
              )}

              {file.status === 'error' && (
                <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center p-2 text-center">
                  <AlertCircle size={20} className="text-destructive mb-1" />
                  <span className="text-[10px] text-destructive leading-tight">
                    {file.error || 'Failed'}
                  </span>
                </div>
              )}

              {file.status === 'success' && (
                <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={12} />
                </div>
              )}

              {!disabled && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                  <X size={14} />
                </button>
              )}

              {file.type === 'video' && file.status === 'success' && (
                <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white rounded px-1 py-0.5 text-[8px] font-bold flex items-center gap-1">
                  <Film size={8} /> VIDEO
                </div>
              )}
            </div>
          );
        })}

        {!disabled && files.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 hover:border-primary/50 transition-all group"
          >
            <div className="p-2.5 rounded-full bg-primary/5 text-primary group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-foreground">Add Files</span>
              <span className="text-[9px] text-muted-foreground">Images or Video</span>
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      {!disabled && (
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files (Images: {maxImageSizeMB}MB, Videos: {maxVideoSizeMB}MB)
        </p>
      )}
    </div>
  );
}
