// Loads the five editor fonts for both the <Player> preview and the MP4
// render. Only the weights/subset actually used are fetched — the default
// loads every weight and hundreds of requests, which slows the render.
//
// Each family loads normal 400 + 700 (for the Bold toggle) and, where the
// family ships one, an italic 400 (for the Italic toggle). Cinzel has no
// italic on Google Fonts, so italic there is browser-synthesised.

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import type { FontKey } from "./constants";

export const FONT_FAMILY: Record<FontKey, string> = {
  Inter: loadInter("normal", {
    weights: ["400", "700"],
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
    weights: ["400", "700"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
  Cinzel: loadCinzel("normal", {
    weights: ["400", "700"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  }).fontFamily,
};

// Italic faces — invoked for their side effect; they register under the
// same family name so `fontStyle: italic` just works.
loadInter("italic", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });
loadPlayfair("italic", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });
loadMontserrat("italic", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });
loadRoboto("italic", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true });

export function fontStack(key: FontKey): string {
  const serif = key === "Playfair Display" || key === "Cinzel";
  return `"${FONT_FAMILY[key]}", ${serif ? "Georgia, serif" : "Arial, Helvetica, sans-serif"}`;
}
