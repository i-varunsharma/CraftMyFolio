"use client";

import Image from "next/image";

export function Avatar({ children }) {
  return (
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="w-full h-full object-cover"
    />
  );
}

export function AvatarFallback({ children }) {
  return <span className="text-gray-600 text-sm">{children}</span>;
}
