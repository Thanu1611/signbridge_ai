import Image from "next/image";
import Link from "next/link";
import { APP_NAME, LOGO_SRC } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  showText = false,
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
    sm: { width: 160, height: 160, imgClass: "h-9 w-auto" },
    md: { width: 200, height: 200, imgClass: "h-11 w-auto" },
    lg: { width: 320, height: 320, imgClass: "h-16 w-auto md:h-20" },
  };

  const logoImage =
    size === "nav" ? (
      // Square PNG has large empty padding — zoom in so the horizontal logo fills the header.
      <span className="relative block h-14 w-44 overflow-hidden md:h-16 md:w-52">
        <Image
          src={LOGO_SRC}
          alt={`${APP_NAME} logo`}
          fill
          unoptimized
          priority
          sizes="(max-width: 768px) 176px, 208px"
          className="scale-[2.75] object-contain md:scale-[3]"
        />
      </span>
    ) : (
      <Image
        src={LOGO_SRC}
        alt={`${APP_NAME} logo`}
        width={sizes[size].width}
        height={sizes[size].height}
        unoptimized
        className={cn("object-contain", sizes[size].imgClass)}
      />
    );

  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      {logoImage}
      {showText && (
        <span className="text-lg font-bold tracking-tight text-brand-gradient md:text-xl">
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
