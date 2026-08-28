import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
  type TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { none } from "@remotion/transitions/none";
import {
  BRAND,
  CTA_DURATION,
  MAX_REEL_PHOTOS,
  SCENE_DURATION,
  TRANSITION_DURATION,
  type LogoConfig,
  type OverlayConfig,
  type PropertyReelProps,
  type TextLine,
  type TransitionKind,
} from "./constants";
import { fontStack } from "./fonts";
import { animate } from "./animations";

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

function toRgba(color: string, alpha: number): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color.trim());
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(color.trim());
  if (rgb) {
    const parts = rgb[1].split(",").slice(0, 3).map((s) => s.trim());
    return `rgba(${parts.join(",")},${alpha})`;
  }
  return color;
}

const anchorX = (align: TextLine["align"]) =>
  align === "center" ? "-50%" : align === "right" ? "-100%" : "0";

/** DOM-only zoom transition (scale + crossfade) — no WebGL, renders in MP4. */
const ZoomPresentation: React.FC<
  TransitionPresentationComponentProps<Record<string, unknown>>
> = ({ children, presentationDirection, presentationProgress }) => {
  const entering = presentationDirection === "entering";
  const scale = entering
    ? interpolate(presentationProgress, [0, 1], [1.16, 1])
    : interpolate(presentationProgress, [0, 1], [1, 0.94]);
  const opacity = entering ? presentationProgress : 1 - presentationProgress;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};
const domZoom = (): TransitionPresentation<Record<string, unknown>> => ({
  component: ZoomPresentation,
  props: {},
});

function transitionPresentation(
  kind: TransitionKind,
): TransitionPresentation<Record<string, unknown>> {
  const p =
    kind === "crossfade"
      ? fade()
      : kind === "slide-h"
        ? slide({ direction: "from-right" })
        : kind === "slide-v"
          ? slide({ direction: "from-bottom" })
          : kind === "zoom"
            ? domZoom()
            : kind === "wipe"
              ? wipe({ direction: "from-left" })
              : none();
  return p as TransitionPresentation<Record<string, unknown>>;
}

function CortexMark({ size }: { size: number }) {
  const u = size / 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {[
        [2, 2],
        [14, 2],
        [2, 14],
        [14, 14],
      ].map(([x, y], i) => (
        <rect key={i} x={x * u} y={y * u} width={8 * u} height={8 * u} fill={BRAND.cream} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  layers                                                             */
/* ------------------------------------------------------------------ */

function OverlayBand({
  overlay,
  edge,
}: {
  overlay: OverlayConfig;
  edge: "top" | "bottom";
}) {
  if (!overlay.enabled || overlay.opacity <= 0 || overlay.size <= 0) return null;
  const solid = overlay.kind === "solid";
  const dir = edge === "bottom" ? "to top" : "to bottom";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [edge]: 0,
        height: `${overlay.size}%`,
        background: solid
          ? toRgba(overlay.color, overlay.opacity)
          : `linear-gradient(${dir}, ${toRgba(overlay.color, overlay.opacity)} 0%, ${toRgba(overlay.color, 0)} 100%)`,
      }}
    />
  );
}

function Line({
  line,
  sceneDuration,
}: {
  line: TextLine;
  sceneDuration: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!line.text.trim()) return null;

  const a = animate({
    frame,
    fps,
    durationInFrames: sceneDuration,
    enter: line.enter,
    exit: line.exit,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${line.x}%`,
        top: `${line.y}%`,
        maxWidth: "84%",
        transform: `translate(${anchorX(line.align)}, 0) translate(${a.x}px, ${a.y}px)`,
        textAlign: line.align,
        opacity: a.opacity,
        color: line.color,
        fontFamily: fontStack(line.fontFamily),
        fontSize: line.fontSize,
        fontWeight: line.fontFamily === "Montserrat" ? 700 : 400,
        lineHeight: 1.12,
        letterSpacing:
          line.fontFamily === "Cinzel" ? line.fontSize * 0.08 : "normal",
        whiteSpace: "pre-line",
      }}
    >
      {line.text}
    </div>
  );
}

function LogoLayer({
  logo,
  sceneDuration,
}: {
  logo: LogoConfig;
  sceneDuration: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = animate({
    frame,
    fps,
    durationInFrames: sceneDuration,
    enter: logo.enter,
    exit: logo.exit,
  });

  const M = 56;
  const box: React.CSSProperties =
    logo.position === "custom"
      ? { left: `${logo.x}%`, top: `${logo.y}%` }
      : logo.position === "top-left"
        ? { top: M, left: M }
        : logo.position === "top-right"
          ? { top: M, right: M }
          : logo.position === "bottom-left"
            ? { bottom: M, left: M }
            : { bottom: M, right: M };

  return (
    <div
      style={{
        position: "absolute",
        ...box,
        opacity: a.opacity * logo.opacity,
        transform: `translate(${a.x}px, ${a.y}px)`,
      }}
    >
      {logo.url ? (
        <Img
          src={logo.url}
          style={{ height: logo.size, width: "auto", objectFit: "contain" }}
        />
      ) : logo.text.trim() ? (
        <span
          style={{
            color: BRAND.cream,
            fontFamily: fontStack(logo.font),
            fontSize: logo.size,
            fontWeight: logo.font === "Montserrat" ? 700 : 400,
            letterSpacing:
              logo.font === "Cinzel" ? logo.size * 0.08 : logo.size * 0.01,
            whiteSpace: "nowrap",
          }}
        >
          {logo.text}
        </span>
      ) : (
        <CortexMark size={logo.size} />
      )}
    </div>
  );
}

/** Warm analogue light-leak that flashes over each cut. Pure CSS (no GL). */
function FilmBurn({
  intensity,
  boundaries,
}: {
  intensity: number;
  boundaries: number[];
}) {
  const frame = useCurrentFrame();
  let o = 0.05 * intensity;
  for (const b of boundaries) {
    const d = Math.abs(frame - b);
    if (d < 18) {
      o = Math.max(o, interpolate(d, [0, 18], [0.85 * intensity, 0]));
    }
  }
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 84% 12%, rgba(255,176,92,0.95) 0%, rgba(255,120,40,0) 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(95% 70% at 8% 92%, rgba(255,96,52,0.8) 0%, rgba(255,96,52,0) 50%)",
        }}
      />
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/*  scenes                                                             */
/* ------------------------------------------------------------------ */

function PhotoScene({
  url,
  index,
  reel,
  isLast,
}: {
  url: string;
  index: number;
  reel: PropertyReelProps;
  isLast: boolean;
}) {
  const frame = useCurrentFrame();
  const t = frame / SCENE_DURATION;
  const zoomIn = index % 2 === 0;
  const scale = zoomIn
    ? interpolate(t, [0, 1], [1.06, 1.18])
    : interpolate(t, [0, 1], [1.18, 1.06]);
  const drift = interpolate(t, [0, 1], [0, zoomIn ? -24 : 24]);

  // On the final photo the property text must be fully gone before the
  // branding outro begins — pull its exit window in ahead of the
  // transition handoff so nothing bleeds onto the closing slide.
  const td = reel.transition === "cut" ? 1 : TRANSITION_DURATION;
  const textDuration = isLast
    ? Math.max(36, SCENE_DURATION - td - 6)
    : SCENE_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${drift}px)` }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <OverlayBand overlay={reel.topOverlay} edge="top" />
      <OverlayBand overlay={reel.bottomOverlay} edge="bottom" />

      {reel.lines
        .filter((l) => l.id !== "cta")
        .map((l) => (
          <Line key={l.id} line={l} sceneDuration={textDuration} />
        ))}

      <LogoLayer logo={reel.logo} sceneDuration={SCENE_DURATION} />
    </AbsoluteFill>
  );
}

/** Closing slide — branding only: the logo + the contact / CTA line.
 *  No title, price, specs, operation or custom text ever renders here. */
function CtaScene({ reel }: { reel: PropertyReelProps }) {
  const cta = reel.lines.find((l) => l.id === "cta");
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      <OverlayBand overlay={reel.topOverlay} edge="top" />
      <OverlayBand overlay={reel.bottomOverlay} edge="bottom" />
      {cta && cta.text.trim() && (
        <Line line={cta} sceneDuration={CTA_DURATION} />
      )}
      <LogoLayer logo={reel.logo} sceneDuration={CTA_DURATION} />
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/*  root                                                               */
/* ------------------------------------------------------------------ */

export function PropertyReelTemplate(props: PropertyReelProps) {
  // Strict structure: at most 4 photo slides, then the branding outro (5).
  const photos = props.photos
    .filter((u) => typeof u === "string" && u.length > 0)
    .slice(0, MAX_REEL_PHOTOS);
  const td = props.transition === "cut" ? 1 : TRANSITION_DURATION;
  const presentation = transitionPresentation(props.transition);

  // Approx frame position of each cut, for the film-burn flashes.
  const boundaries: number[] = [];
  for (let i = 1; i <= photos.length; i++) {
    boundaries.push(i * (SCENE_DURATION - td));
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      <TransitionSeries>
        {photos.flatMap((url, i) => {
          const seq = (
            <TransitionSeries.Sequence
              key={`s${i}`}
              durationInFrames={SCENE_DURATION}
            >
              <PhotoScene
                url={url}
                index={i}
                reel={props}
                isLast={i === photos.length - 1}
              />
            </TransitionSeries.Sequence>
          );
          if (i === 0) return [seq];
          return [
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={presentation}
              timing={linearTiming({ durationInFrames: td })}
            />,
            seq,
          ];
        })}

        {photos.length > 0 && (
          <TransitionSeries.Transition
            key="tcta"
            presentation={presentation}
            timing={linearTiming({ durationInFrames: td })}
          />
        )}
        <TransitionSeries.Sequence key="cta" durationInFrames={CTA_DURATION}>
          <CtaScene reel={props} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {props.filmBurn.enabled && (
        <FilmBurn intensity={props.filmBurn.intensity} boundaries={boundaries} />
      )}
    </AbsoluteFill>
  );
}
