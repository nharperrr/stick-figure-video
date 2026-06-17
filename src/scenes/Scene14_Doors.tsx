import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { StickFigure, POSES, walkCyclePose } from "../components/StickFigure";
import { DoorChoice } from "../components/DoorChoice";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 14 - DOORS (4:55-5:20)
// Character faces five identical, unremarkable doors. After a beat of
// looking across all of them, walks to one ordinary door (not a "special"
// glowing one) and steps through into soft light.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const CHOSEN_INDEX = 2;
const DOOR_WIDTH = 90;
const DOOR_HEIGHT = 190;
const DOOR_GAP = 40;

// Phase boundaries (frames), within this scene's 750-frame duration.
const LOOK_END = 200;
const WALK_END = 450;
const OPEN_END = 600;

export const Scene14_Doors: React.FC<SceneProps> = ({ width, height, palette }) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  const rowWidth = 5 * DOOR_WIDTH + 4 * DOOR_GAP;
  const rowX = width / 2 - rowWidth / 2;
  const doorRowY = floorY - DOOR_HEIGHT;
  const chosenDoorCenterX = rowX + CHOSEN_INDEX * (DOOR_WIDTH + DOOR_GAP) + DOOR_WIDTH / 2;

  // Phase A: slow pan across the row while the head turns side to side.
  const pan = interpolate(frame, [0, LOOK_END], [-width * 0.02, width * 0.02], {
    extrapolateRight: "clamp",
  });
  const headLook = Math.sin(frame * 0.07) * 12;

  // Phase B: walk from center toward the chosen door.
  const walkT = interpolate(frame, [LOOK_END, WALK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const figureX = width / 2 + (chosenDoorCenterX - width / 2) * walkT;

  // Phase C: open the chosen door.
  const openProgress = interpolate(frame, [WALK_END, OPEN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase D: step through - fade into the light beyond the doorway.
  const stepThrough = interpolate(frame, [OPEN_END, 750], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let pose = POSES.lookingSideToSide;
  if (frame < LOOK_END) {
    pose = { ...POSES.lookingSideToSide, headTilt: headLook };
  } else if (frame < WALK_END) {
    pose = walkCyclePose(frame * 0.25, 0.12);
  } else if (frame < OPEN_END) {
    pose = POSES.openDoorReach;
  } else {
    pose = POSES.standingLookingForward;
  }

  return (
    <g transform={`translate(${pan}, 0)`}>
      <rect x={0} y={0} width={width} height={height} fill={palette.wallBack} />
      <rect x={0} y={floorY} width={width} height={height - floorY} fill={palette.floor} />

      <DoorChoice
        position={{ x: rowX, y: doorRowY }}
        doorWidth={DOOR_WIDTH}
        doorHeight={DOOR_HEIGHT}
        gap={DOOR_GAP}
        count={5}
        chosenIndex={CHOSEN_INDEX}
        openProgress={openProgress}
        doorColor={palette.figureStroke}
        lightColor="rgba(255, 233, 176, 0.9)"
      />

      <StickFigure
        pose={pose}
        position={{ x: figureX, y: floorY }}
        stroke={palette.figureStroke}
        opacity={1 - stepThrough * 0.9}
      />

      {/* soft whiteout as the character steps fully into the light */}
      <rect x={0} y={0} width={width} height={height} fill="#fff6e4" opacity={stepThrough * 0.6} />
    </g>
  );
};

export default Scene14_Doors;
