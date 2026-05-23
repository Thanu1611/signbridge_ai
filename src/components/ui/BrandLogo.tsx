import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  showText = true,
  size = "md",
  className,
  href = "/",
}: {
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "nav";
  className?: string;
  href?: string;
}) {
  const sizes = {
    sm: { width: 120, height: 36, text: "text-base" },
    md: { width: 160, height: 44, text: "text-lg" },
    lg: { width: 220, height: 60, text: "text-2xl" },
    nav: { width: 200, height: 52, text: "text-lg" },
  };
  const s = sizes[size];

  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt={`${APP_NAME} logo`}
        width={s.width}
        height={s.height}
        className="h-10 w-auto object-contain md:h-12"
        priority
      />
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent",
            s.text
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="transition opacity-95 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
