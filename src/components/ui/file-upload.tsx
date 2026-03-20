"use client";

import * as React from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/cn";

export interface FileUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  accept?: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  className?: string;
  compact?: boolean;
}

export function FileUpload({
  label,
  error,
  hint,
  accept = "image/*",
  value,
  onChange,
  className,
  compact = false,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | undefined>(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange?.(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange?.(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  React.useEffect(() => {
    setPreview(value);
  }, [value]);

  if (compact) {
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="mb-1.5 block text-xs font-semibold text-warm-600">{label}</label>
        )}
        <div className="flex items-center gap-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="size-16 rounded-xl border border-warm-200 object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-warm-700 text-white shadow-sm transition hover:bg-warm-900"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-warm-200 bg-warm-50 transition hover:border-brand-400 hover:bg-brand-50/50">
              <ImagePlus className="size-5 text-warm-400" />
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <div className="text-[11px] text-warm-400">
            {hint || "PNG, JPG (max 5MB)"}
          </div>
        </div>
        {error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-warm-600">{label}</label>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-all",
          error
            ? "border-red-300 bg-red-50/50"
            : preview
              ? "border-brand-300 bg-brand-50/50"
              : "border-warm-200 bg-warm-50 hover:border-brand-400 hover:bg-brand-50/30",
        )}
      >
        {preview ? (
          <div className="relative aspect-video w-full">
            <img src={preview} alt="Preview" className="size-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-warm-900/70 text-white transition hover:bg-warm-900"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center py-6">
            <div className="grid size-10 place-items-center rounded-xl bg-warm-100">
              <ImagePlus className="size-5 text-warm-400" />
            </div>
            <span className="mt-2 text-sm font-medium text-warm-700">
              Cliquez pour choisir une image
            </span>
            <span className="mt-0.5 text-[11px] text-warm-400">PNG, JPG, WEBP (max 5MB)</span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-[11px] text-warm-400">{hint}</p>}
    </div>
  );
}
