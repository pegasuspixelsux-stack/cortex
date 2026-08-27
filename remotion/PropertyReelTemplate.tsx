import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BRAND,
  CTA_DURATION,
  SCENE_DURATION,
  type PropertyReelProps,
} from "./constants";

function CortexMark({ size, color }: { size: number; color: string }) {
  const unit = size / 24;
  const box = 8 * unit;
  const far = 14 * unit;
  const near = 2 * unit;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={near} y={near} width={box} height={box} fill={color} />
      <rect x={far} y={near} width={box} height={box} fill={color} />
      <rect x={near} y={far} width={box} height={box} fill={color} />
      <rect x={far} y={far} width={box} height={box} fill={color} />
    </svg>
  );
}

function Logo({ logoUrl, size }: { logoUrl?: string; size: number }) {
  if (logoUrl) {
    return (
      <Img
        src={logoUrl}
        style={{ height: size, width: "auto", objectFit: "contain" }}
      />
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35 }}>
      <CortexMark size={size} color={BRAND.cream} />
      <span
        style={{
          color: BRAND.cream,
          fontSize: size * 0.78,
          fontWeight: 300,
          letterSpacing: size * 0.02,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        Cortex
      </span>
    </div>
  );
}

function PhotoScene({
  url,
  index,
  total,
  reel,
}: {
  url: string;
  index: number;
  total: number;
  reel: PropertyReelProps;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ken Burns — alternate zoom-in / zoom-out per scene.
  const t = frame / SCENE_DURATION;
  const zoomIn = index % 2 === 0;
  const scale = zoomIn
    ? interpolate(t, [0, 1], [1.06, 1.18])
    : interpolate(t, [0, 1], [1.18, 1.06]);
  const drift = interpolate(t, [0, 1], [0, zoomIn ? -24 : 24]);

  const textIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const textOut = interpolate(
    frame,
    [SCENE_DURATION - 14, SCENE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const textOpacity = Math.min(textIn, textOut);
  const textShift = interpolate(textIn, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale}) translateX(${drift}px)` }}
      >
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* legibility gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, rgba(8,10,28,0.92) 0%, rgba(8,10,28,0.45) 32%, rgba(8,10,28,0) 62%)`,
        }}
      />

      {/* logo, top-right */}
      <div style={{ position: "absolute", top: 56, right: 56, opacity: 0.9 }}>
        <Logo logoUrl={reel.logoUrl} size={34} />
      </div>

      {/* progress ticks */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 56,
          right: 56,
          display: "flex",
          gap: 6,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor:
                i < index ? BRAND.cream : i === index ? BRAND.accentBright : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      {/* text block */}
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 72,
          opacity: textOpacity,
          transform: `translateY(${textShift}px)`,
        }}
      >
        <div
          style={{
            color: BRAND.accentBright,
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 14,
          }}
        >
          {reel.zone}
        </div>
        <div
          style={{
            color: BRAND.cream,
            fontSize: 68,
            lineHeight: 1.05,
            fontWeight: 300,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {reel.title}
        </div>
        <div
          style={{
            marginTop: 20,
            color: BRAND.cream,
            fontSize: 34,
            fontWeight: 400,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {reel.price}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CtaScene({ reel }: { reel: PropertyReelProps }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 200 } });
  const lineIn = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const contactIn = spring({ frame: frame - 22, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.ink,
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: logoIn,
          transform: `translateY(${interpolate(logoIn, [0, 1], [30, 0])}px)`,
        }}
      >
        <Logo logoUrl={reel.logoUrl} size={64} />
      </div>

      <div
        style={{
          width: 60,
          height: 2,
          backgroundColor: BRAND.accentBright,
          opacity: lineIn,
        }}
      />

      <div style={{ opacity: lineIn }}>
        <div
          style={{
            color: BRAND.cream,
            fontSize: 40,
            fontWeight: 300,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {reel.title}
        </div>
        <div
          style={{
            marginTop: 12,
            color: BRAND.creamSoft,
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
          }}
        >
          {reel.zone}
        </div>
      </div>

      <div
        style={{
          opacity: contactIn,
          transform: `translateY(${interpolate(contactIn, [0, 1], [20, 0])}px)`,
          marginTop: 8,
        }}
      >
        <div
          style={{
            color: BRAND.cream,
            fontSize: 26,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {reel.agent}
        </div>
        <div
          style={{
            marginTop: 8,
            color: BRAND.creamSoft,
            fontSize: 22,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {reel.contact}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function PropertyReelTemplate(props: PropertyReelProps) {
  const photos = props.photos.filter((u) => typeof u === "string" && u.length > 0);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      {photos.map((url, i) => (
        <Sequence
          key={`${url}-${i}`}
          from={i * SCENE_DURATION}
          durationInFrames={SCENE_DURATION}
        >
          <PhotoScene url={url} index={i} total={photos.length} reel={props} />
        </Sequence>
      ))}
      <Sequence
        from={photos.length * SCENE_DURATION}
        durationInFrames={CTA_DURATION}
      >
        <CtaScene reel={props} />
      </Sequence>
    </AbsoluteFill>
  );
}
