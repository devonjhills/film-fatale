"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url?: string;
  className?: string;
}

export function ShareButton({ url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) {
        clearTimeout(copiedTimeout.current);
      }
    };
  }, []);

  const showCopiedConfirmation = () => {
    setCopied(true);

    if (copiedTimeout.current) {
      clearTimeout(copiedTimeout.current);
    }

    copiedTimeout.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const copyWithLegacyFallback = (shareUrl: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    try {
      if (!document.execCommand("copy")) {
        throw new Error("Copy command was unsuccessful");
      }
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleCopy = async () => {
    const shareUrl = url ?? window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        copyWithLegacyFallback(shareUrl);
      }
      showCopiedConfirmation();
    } catch {
      try {
        copyWithLegacyFallback(shareUrl);
        showCopiedConfirmation();
      } catch {
        console.error("Copy failed");
      }
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="lg"
      className={className}
      title={copied ? "Page URL copied" : "Copy page URL"}
      aria-label={copied ? "Page URL copied" : "Copy page URL"}
      aria-live="polite"
    >
      {copied ? (
        <Check className="h-4 w-4" weight="bold" />
      ) : (
        <Share className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
