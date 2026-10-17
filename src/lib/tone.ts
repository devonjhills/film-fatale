/**
 * Picture tone: "noir" prints every image in high-contrast black and white,
 * "color" restores the original prints. Noir is the default.
 */
export type Tone = "noir" | "color";

export const TONE_STORAGE_KEY = "ff-tone";

/** Runs before first paint so color viewers never see a grayscale flash. */
export const TONE_SCRIPT = `try{if(localStorage.getItem("${TONE_STORAGE_KEY}")==="color")document.documentElement.dataset.tone="color"}catch(e){}`;
