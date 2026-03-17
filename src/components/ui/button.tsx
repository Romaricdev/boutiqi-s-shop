import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-warm-50 hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-warm-100 text-brand-700 border border-warm-300 hover:bg-warm-200 disabled:opacity-50 disabled:pointer-events-none",
  ghost: "bg-transparent text-warm-700 hover:bg-warm-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition active:scale-[0.98]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement;
    if (child.type === Link || typeof child.type === "string") {
      return React.cloneElement(child, { className: cn(child.props.className, classes) });
    }
    return React.cloneElement(child, { className: cn(child.props.className, classes) });
  }

  return <button className={classes} {...props} />;
}

