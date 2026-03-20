import * as React from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "active:scale-[0.97]",
          {
            primary:
              "bg-brand-500 text-white shadow-sm hover:-translate-y-px hover:bg-brand-600 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:bg-brand-500",
            secondary:
              "border border-warm-200 bg-white text-warm-700 hover:-translate-y-px hover:border-warm-300 hover:bg-warm-50 hover:shadow-sm",
            ghost: "text-warm-600 hover:bg-warm-100",
          }[variant],
          {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-5 text-sm",
            lg: "h-11 px-6 text-sm",
          }[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
