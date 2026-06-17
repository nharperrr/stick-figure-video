import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { PhoneDistraction } from "../components/PhoneDistraction";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 01 - INTRO ROOM (0:00-0:15)
// Stick figure sits slumped on the floor of a messy room. A wall clock spins
// unnaturally fast. A phone glows nearby, low and unanswered.
// ---------------------------------------------------------------------------
// TO RETIME: edit "intro_room" startSeconds/endSeconds in timeline.json.
// TO CHANGE HOW MESSY THE ROOM LOOKS: tweak clutterLevel below (1 = max).
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;

export const Scene01_IntroRoom: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  // Slow push-in: camera scales up very slightly across the whole scene.
  const cameraScale = interpolate(frame, [0, 450], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  // Gentle idle breathing loop on top of the held "slumpedFloor" pose.
  const breathe = Math.sin(frame * 0.08) * 1.4;
  const pose = { ...POSES.slumpedFloor, hipOffsetY: POSES.slumpedFloor.hipOffsetY + breathe };

  // Phone glow pulses slowly between 0.3 and 0.5.
  const glow = 0.4 + Math.sin(frame * 0.05) * 0.1;

  return (
    <g
      transform={`scale(${cameraScale})`}
      style={{ transformOrigin: `${width / 2}px ${height / 2}px` }}
    >
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={1}
        lightLevel={0.3}
        curtainsOpen={0}
        showClock
        clockSpinSpeed={0.028}
        frame={frame}
      />

      <PhoneDistraction
        position={{ x: width * 0.5, y: floorY - 10 }}
        scale={0.9}
        glowIntensity={glow}
        rotation={8}
      />

      <StickFigure
        pose={pose}
        position={{ x: width * 0.4, y: floorY }}
        scale={1}
        stroke={palette.figureStroke}
      />
    </g>
  );
};

export default Scene01_IntroRoom;
