"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CircleHalf, Palette } from "@/components/ui/icons";
import { TONE_STORAGE_KEY, type Tone } from "@/lib/tone";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-tone"],
  });
  return () => observer.disconnect();
}

const getTone = (): Tone =>
  document.documentElement.dataset.tone === "color" ? "color" : "noir";

export function ToneToggle() {
  const tone = useSyncExternalStore(subscribe, getTone, () => "noir" as Tone);
  const next: Tone = tone === "noir" ? "color" : "noir";

  const toggle = () => {
    document.documentElement.dataset.tone = next;
    try {
      localStorage.setItem(TONE_STORAGE_KEY, next);
    } catch {
      // Storage unavailable; the choice lasts for this page view.
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={next === "color" ? "Show images in color" : "Show images in black and white"}
      title={next === "color" ? "Color" : "Black and white"}
    >
      {tone === "noir" ? <Palette aria-hidden="true" /> : <CircleHalf aria-hidden="true" />}
    </Button>
  );
}
