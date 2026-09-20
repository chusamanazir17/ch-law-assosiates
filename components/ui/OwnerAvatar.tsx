"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Sparkles } from "lucide-react";
import type { OwnerProfile } from "@/lib/owners";

interface OwnerAvatarProps {
  owner: OwnerProfile;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function OwnerAvatar({ owner, size = "md", className = "" }: OwnerAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-base",
    lg: "h-24 w-24 text-xl",
    xl: "h-32 w-32 text-2xl",
  };

  const isLate = owner.status === "late";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-2 transition-all duration-300 ${
        isLate
          ? "border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/20"
          : "border-gold-400/80 shadow-[0_0_15px_rgba(202,138,4,0.2)] ring-2 ring-gold-500/20"
      } ${sizeClasses[size]} ${className}`}
    >
      {!hasError ? (
        <Image
          src={owner.image}
          alt={owner.name}
          fill
          sizes="(max-width: 768px) 100px, 150px"
          className="object-cover object-center"
          onError={() => setHasError(true)}
          priority={isLate}
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-2 text-center select-none ${
            isLate
              ? "from-[#0d1f3c] via-[#14294d] to-[#1e3a6a] text-amber-200"
              : "from-[#08152b] via-[#0f2347] to-[#183668] text-gold-300"
          }`}
        >
          <span className="font-serif font-extrabold tracking-wider">{owner.initials}</span>
          {size === "lg" || size === "xl" ? (
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-300/80">
              {isLate ? "Founder" : "Owner"}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
