import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  size?: number;
  textColor?: string;
  href?: string;
  className?: string;
}

function LogoMark({ size = 34 }: { size: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[9px] bg-brand-500"
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.59)}
        height={Math.round(size * 0.59)}
        viewBox="0 0 44 44"
        fill="none"
      >
        <path
          d="M7 22L13 13L23 27L29 18L37 27"
          stroke="#B7E4C7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="33" cy="13" r="4" fill="#95D5B2" />
        <path
          d="M7 35Q22 30 37 35"
          stroke="#52B788"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Logo({
  size = 34,
  textColor = "text-brand-500",
  href = "/",
  className,
}: LogoProps) {
  const fontSize = Math.round(size * 0.647);

  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn("font-display tracking-[-0.5px]", textColor)}
        style={{ fontSize }}
      >
        Boutiki
      </span>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} aria-label="Boutiki — Accueil">
      {inner}
    </Link>
  );
}
