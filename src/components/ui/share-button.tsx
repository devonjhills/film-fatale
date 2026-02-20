"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
}

export function ShareButton({
  url,
  title = "Check this out!",
  text = "Check this out!",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    // Try native sharing first
    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to copy to clipboard
      }
    }

    // Fallback to copying to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        console.error("Copy failed");
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="lg"
      className={className}
      title={copied ? "URL Copied!" : "Share this page"}
    >
      {copied ? (
        <Icons.Check className="h-4 w-4" />
      ) : (
        <Icons.Share className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
