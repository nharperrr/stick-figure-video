import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { MirrorScene } from "../components/MirrorScene";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 11 - MIRROR TALLER (3:45-4:05)
// Character stands in front of a mirror. The reflection stands very
// slightly taller and straighter. Character notices, and nods once.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;

export const Scene11_MirrorTaller: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  const activation = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const frameTopLeft = { x: width * 0.56, y: floorY - 270 };
  const frameWidth = 150;
  const frameHeight = 270;

  const nodSpring = spring({ frame: frame - 480, fps: FPS, config: { damping: 12 } });
  const headTiltOffset = interpolate(Math.max(0, Math.min(1, nodSpring)), [0, 1], [-4, 0]);

  const realPose = {
    ...POSES.standingLookingForward,
    postureBend: 0.12,
    headTilt: POSES.standingLookingForward.headTilt + headTiltOffset,
  };
  const reflectionPose = { ...POSES.standingLookingForward, postureBend: 0.05 };

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.5}
      lightLevel={0.55}
      curtainsOpen={0.5}
      frame={frame}
    >
      <MirrorScene
        frameTopLeft={frameTopLeft}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        reflectionPose={reflectionPose}
        reflectionPosition={{
          x: frameTopLeft.x + frameWidth / 2,
          y: frameTopLeft.y + frameHeight - 6,
        }}
        reflectionScale={1.03}
        activation={activation}
        figureStroke={palette.figureStroke}
      />

      <StickFigure
        pose={realPose}
        position={{ x: width * 0.4, y: floorY }}
        stroke={palette.figureStroke}
      />
    </RoomScene>
  );
};

export default Scene11_MirrorTaller;
