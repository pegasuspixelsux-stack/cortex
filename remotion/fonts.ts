// Loads the five editor fonts for both the <Player> preview and the MP4
// render. Only the weights/subset actually used are fetched — the default
// loads every weight and hundreds of requests, which slows the render.

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import type { FontKey } from "./constants";

export const FONT_FAMILY: Record<FontKey, string> = {
  Inter: loadInter("normal", {
    weights: ["400", "600"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
  "Playfair Display": loadPlayfair("normal", {
    weights: ["400", "700"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
  Montserrat: loadMontserrat("normal", {
    weights: ["400", "700"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
  Roboto: loadRoboto("normal", {
    weights: ["400", "500"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
  Cinzel: loadCinzel("normal", {
    weights: ["400", "600"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
};

export function fontStack(key: FontKey): string {
  const serif = key === "Playfair Display" || key === "Cinzel";
  return `"${FONT_FAMILY[key]}", ${serif ? "Georgia, serif" : "Arial, Helvetica, sans-serif"}`;
}
