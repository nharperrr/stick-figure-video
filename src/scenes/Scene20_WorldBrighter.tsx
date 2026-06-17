import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { DoorChoice } from "../components/DoorChoice";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 20 - WORLD BRIGHTER (7:20-7:45)
// The payoff shot: the same room from Scene 1, now clean and full of light.
// Deliberately reuses RoomScene with the opposite extreme of its props
// (compare clutterLevel/lightLevel here to Scene01_IntroRoom) so the
// before/after reads instantly even without a side-by-side cut.
// ---------------------------------------------------------------------------
// TO MAKE THE "BEFORE" COMPARISON STRONGER: keep these prop values as far
// from Scene01's (clutterLevel 1, lightLevel 0.3) as the mood curve allows.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;

export const Scene20_WorldBrighter: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  // Slow dolly-back: starts very slightly zoomed in and eases out to 1.0,
  // the reverse of Scene01's slow push-in, to "reveal the full clean room".
  const cameraScale = interpolate(frame, [0, 750], [1.08, 1.0], {
    extrapolateRight: "clamp",
  });

  // Gentle idle breathing, same technique as Scene01, but the posture
  // itself (postureBend) is now at its lowest value of the whole video.
  const breathe = Math.sin(frame * 0.05) * 1.2;
  const pose = {
    ...POSES.standingTallFinal,
    postureBend: 0.05,
    hipOffsetY: POSES.standingTallFinal.hipOffsetY + breathe,
  };

  const doorX = width * 0.84;
  const doorY = floorY - 190;

  // The winding path from Scene09, now fully drawn and leading toward the
  // doorway full of light instead of trailing off into the room.
  const pathD = `M ${width * 0.1} ${floorY + 6}
                 Q ${width * 0.32} ${floorY - 22}, ${width * 0.55} ${floorY - 6}
                 T ${doorX} ${doorY + 90}`;
  const pathGlow = 0.6 + Math.sin(frame * 0.04) * 0.15;

  return (
    <g
      transform={`scale(${cameraScale})`}
      style={{ transformOrigin: `${width / 2}px ${height / 2}px` }}
    >
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.05}
        lightLevel={0.85}
        curtainsOpen={1}
        frame={frame}
      >
        <path
          d={pathD}
          fill="none"
          stroke={palette.accentWarm}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={pathGlow}
        />

        <DoorChoice
          position={{ x: doorX, y: doorY }}
          doorWidth={110}
          doorHeight={190}
          gap={0}
          count={1}
          chosenIndex={0}
          openProgress={1}
          doorColor={palette.wallShadow}
          lightColor="rgba(255, 244, 214, 0.95)"
        />

        <StickFigure pose={pose} position={{ x: width * 0.42, y: floorY }} stroke={palette.figureStroke} />
      </RoomScene>
    </g>
  );
};

export default Scene20_WorldBrighter;
