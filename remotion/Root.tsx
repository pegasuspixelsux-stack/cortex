import { Composition } from "remotion";
import { PropertyReelTemplate } from "./PropertyReelTemplate";
import {
  ASPECT_RATIOS,
  DEFAULT_REEL_PROPS,
  FPS,
  reelDurationInFrames,
} from "./constants";

export function RemotionRoot() {
  return (
    <Composition
      id="PropertyReel"
      component={PropertyReelTemplate}
      fps={FPS}
      width={ASPECT_RATIOS.vertical.width}
      height={ASPECT_RATIOS.vertical.height}
      durationInFrames={reelDurationInFrames(DEFAULT_REEL_PROPS.photos.length)}
      defaultProps={DEFAULT_REEL_PROPS}
      calculateMetadata={({ props }) => {
        const ar = ASPECT_RATIOS[props.aspectRatio] ?? ASPECT_RATIOS.vertical;
        return {
          durationInFrames: reelDurationInFrames(props.photos.length),
          width: ar.width,
          height: ar.height,
        };
      }}
    />
  );
}
