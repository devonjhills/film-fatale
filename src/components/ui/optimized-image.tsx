"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "poster" | string;
  quality?: number;
}

export function OptimizedImage({
  ...props
}: OptimizedImageProps) {
  return <OptimizedImageState key={props.src} {...props} />;
}

function OptimizedImageState({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc,
  aspectRatio,
  quality = 80,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "poster":
        return "aspect-[2/3]";
      default:
        return ratio ? `aspect-[${ratio}]` : "";
    }
  };

  // Default blur data URL for better UX
  const defaultBlurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  if (hasError && !fallbackSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          fill ? "absolute inset-0" : getAspectRatioClass(aspectRatio),
          className,
        )}
      >
        <span className="text-xs text-center p-2">Image not available</span>
      </div>
    );
  }

  const imageProps = {
    src: currentSrc,
    priority,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL: blurDataURL || defaultBlurDataURL,
    sizes: sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    className: cn(
      "transition-opacity duration-100",
      isLoading ? "opacity-0" : "opacity-100",
      className,
    ),
  };

  // For fill images, don't wrap in a container - let the parent handle positioning
  if (fill) {
    return (
      <>
        {/* Loading state overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse z-10" />
        )}
        <Image fill alt={alt} {...imageProps} />
      </>
    );
  }

  // For non-fill images, provide our own container with aspect ratio
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        getAspectRatioClass(aspectRatio),
      )}
    >
      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse z-10" />
      )}

      <Image
        width={width || 500}
        height={height || 750}
        alt={alt}
        {...imageProps}
      />
    </div>
  );
}

// Specialized image components for common use cases
export function PosterImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="poster"
      priority={priority}
      className={className}
      sizes={sizes}
      quality={85}
    />
  );
}

export function BackdropImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="video"
      priority={priority}
      className={className}
      sizes={sizes}
      quality={90}
    />
  );
}

export function AvatarImage({
  src,
  alt,
  size = 100,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      aspectRatio="square"
      priority={priority}
      className={cn("rounded-full", className)}
      quality={85}
    />
  );
}
