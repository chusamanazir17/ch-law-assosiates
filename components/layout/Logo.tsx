import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  isUrdu?: boolean;
  isDark?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({
  isUrdu = false,
  isDark = false,
  size = "md",
}: LogoProps) {
  const iconDimensions = {
    sm: "h-9 w-9",
    md: "h-11 w-11 sm:h-12 sm:w-12",
    lg: "h-14 w-14",
  };

  const titleSizes = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg lg:text-xl",
    lg: "text-xl sm:text-2xl",
  };

  const subtitleSizes = {
    sm: "text-[9px] sm:text-[10px]",
    md: "text-[10px] sm:text-[11px]",
    lg: "text-xs",
  };

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
      aria-label={
        isUrdu
          ? "چوہدری کمپوزنگ ای سٹامپ اور ٹیکس ایڈوائزر ہوم"
          : "Ch Composing Estamp and Tax Advisor Home"
      }
    >
      {/* Emblem Brandmark */}
      <span
        className={`relative flex ${iconDimensions[size]} items-center justify-center rounded-xl bg-[#061226] p-0.5 shadow-md ring-1 ring-gold-500/35 group-hover:ring-gold-400/80 group-hover:shadow-[0_0_16px_rgba(200,151,61,0.35)] transition-all duration-300 overflow-hidden shrink-0`}
      >
        <Image
          src="/logo-emblem.jpg"
          alt="Ch Composing Seal"
          width={56}
          height={56}
          sizes="56px"
          className="h-full w-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-300"
          priority
        />
        {/* Subtle glossy sheen line on hover */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>

      {/* Typography Wordmark */}
      <span className="flex flex-col justify-center leading-tight">
        <span
          className={`block font-serif ${titleSizes[size]} font-bold tracking-tight text-navy-900 dark:text-white transition-colors duration-200`}
        >
          {isUrdu ? (
            "چوہدری کمپوزنگ"
          ) : (
            <>
              <span className="text-gold-500 group-hover:text-gold-400 transition-colors">
                Ch
              </span>{" "}
              <span className="text-navy-900 dark:text-slate-100">Composing</span>
            </>
          )}
        </span>
        <span
          className={`block ${subtitleSizes[size]} font-semibold tracking-wider uppercase text-gold-600 dark:text-gold-400 flex items-center gap-1`}
        >
          <span>
            {isUrdu ? "ای سٹامپ اور ٹیکس ایڈوائزر" : "E-Stamp & Tax Advisor"}
          </span>
        </span>
      </span>
    </Link>
  );
}

