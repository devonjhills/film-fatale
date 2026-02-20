"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrailerModalProps {
  trailer: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  };
  title: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function TrailerModal({
  trailer,
  title,
  size = "lg",
  variant = "default",
  className,
}: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Icons.Play className="h-5 w-5" />
          Watch Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-left">
            {trailer.name || `${title} - Trailer`}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {isOpen && (
              <iframe
                src={embedUrl}
                title={trailer.name || `${title} Trailer`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
