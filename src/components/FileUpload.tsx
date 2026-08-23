"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  bucket: string;
  path?: string;
  onUpload: (url: string) => void;
  accept?: string;
  className?: string;
  multiple?: boolean;
}

export function FileUpload({
  bucket,
  path,
  onUpload,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  className = "",
  multiple = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File, keepDropzone: boolean) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        if (path) formData.append("path", path);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "បញ្ហាក្នុងការបញ្ចូលរូបភាព");
          return;
        }

        if (!keepDropzone) setPreview(data.url);
        onUpload(data.url);
      } catch {
        alert("បញ្ហាក្នុងការភ្ជាប់ទៅម៉ាស៊ីនមេ");
      }
    },
    [bucket, path, onUpload]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      setProgress({ done: 0, total: files.length });
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], multiple);
        setProgress({ done: i + 1, total: files.length });
      }
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [uploadFile, multiple]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      uploadFiles(Array.from(e.target.files || []));
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/")));
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const removePreview = useCallback(() => {
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  }, [onUpload]);

  if (!multiple && preview) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={preview}
          alt="រូបភាព"
          className="w-full aspect-square object-cover rounded-lg border border-gold-200"
        />
        <button
          type="button"
          onClick={removePreview}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-primary bg-gold-50"
          : "border-gold-200 hover:bg-gold-50/50"
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {progress.total > 1 ? `កំពុងបញ្ចូល ${progress.done}/${progress.total}...` : "កំពុងបញ្ចូល..."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {multiple ? "ចុច ឬអូសរូបភាពមកទីនេះ (ជ្រើសច្រើនរូបបាន)" : "ចុច ឬអូសរូបភាពមកទីនេះ"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP ឬ GIF (អតិបរិមា 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
