"use client";

import { cn } from "@/lib/utils";

/**
 * Shows an image in full — never cropped.
 *
 * `object-contain` guarantees the whole picture is visible whatever its aspect
 * ratio, which leaves empty bars when the image doesn't match the frame. Those
 * bars are filled with a blurred, zoomed copy of the same image so the result
 * reads as a deliberate composition instead of letterboxing.
 *
 * Images smaller than the frame are scaled up to fill it. That can look soft,
 * which is the accepted trade for never chopping content off.
 */
export function FittedMedia({
  src,
  alt = "",
  className,
  zoomOnHover,
  eager,
}: {
  src: string;
  alt?: string;
  className?: string;
  zoomOnHover?: boolean;
  eager?: boolean;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-125 bg-cover bg-center opacity-25 blur-2xl"
        style={{ backgroundImage: `url("${encodeURI(src)}")` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs come from the
          admin panel and can point at any host, so next/image's remote-pattern
          allow-list would mean editing code to add an image. */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={cn(
          "relative h-full w-full object-contain",
          zoomOnHover &&
            "transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none",
          className,
        )}
      />
    </>
  );
}
