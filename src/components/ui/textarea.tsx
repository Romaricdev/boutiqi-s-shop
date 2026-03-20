import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-semibold text-warm-600">{label}</label>
        )}
        <textarea
          className={cn(
            "min-h-[88px] w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-warm-900 transition-all duration-150",
            "placeholder:text-warm-400",
            "focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15",
            error
              ? "border-red-300 ring-[3px] ring-red-300/15"
              : "border-warm-200 hover:border-warm-300",
            "disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-400",
            className,
          )}
          ref={ref}
          {...props}
        />
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
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
