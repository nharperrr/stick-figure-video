import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, interpolatePose } from "../components/StickFigure";
import { PhoneDistraction } from "../components/PhoneDistraction";
import { ShadowExcuse, ShadowKind } from "../components/ShadowExcuse";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 03 - FREEZE AND SCROLL (0:35-0:55)
// Character reaches for the phone, then lies back down. Window light cycles
// rapidly day/night/day to show time passing while nothing changes. The six
// shadows from Scene 02 remain, dimmed, in the background - the obstacles
// haven't gone anywhere, the character has just stopped looking at them.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const SHADOW_KINDS: ShadowKind[] = [
  "money",
  "body",
  "heartbreak",
  "direction",
  "time",
  "overwhelm",
];

export const Scene03_FreezeAndScroll: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const duration = 600;

  // Pose travels slumpedFloor -> reachForPhone -> lyingDown.
  const stage = interpolate(frame, [0, 180, 380], [0, 1, 2], {
    extrapolateRight: "clamp",
  });
  const pose =
    stage <= 1
      ? interpolatePose(POSES.slumpedFloor, POSES.reachForPhone, stage)
      : interpolatePose(POSES.reachForPhone, POSES.lyingDown, stage - 1);

  // 4 day/night cycles across the scene, driving RoomScene's lightLevel.
  const cyclePhase = (frame / duration) * Math.PI * 2 * 4;
  const dayNight = (Math.sin(cyclePhase) + 1) / 2; // 0 (night) -> 1 (day)
  const lightLevel = 0.15 + dayNight * 0.35;

  // Phone glow ramps up once it's been picked up (stage > 0.4), then settles
  // into a soft flicker loop, as if the screen never quite goes dark.
  const heldAmount = interpolate(stage, [0.4, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flicker = Math.sin(frame * 0.4) * 0.05;
  const glow = heldAmount * (0.85 + flicker);

  return (
    <g>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.95}
        lightLevel={lightLevel}
        curtainsOpen={0}
        frame={frame}
      />

      {/* shadows from the previous scene, still present but dimmed - the
          character has stopped facing them, not solved them */}
      <g opacity={0.2}>
        {SHADOW_KINDS.map((kind, i) => (
          <ShadowExcuse
            key={kind}
            kind={kind}
            position={{ x: width * (0.12 + i * 0.145), y: floorY }}
            riseProgress={1}
          />
        ))}
      </g>

      <PhoneDistraction
        position={{ x: width * 0.46, y: floorY - 70 }}
        scale={0.9}
        glowIntensity={Math.max(0.3, glow)}
        rotation={-6}
      />

      <StickFigure
        pose={pose}
        position={{ x: width * 0.4, y: floorY }}
        stroke={palette.figureStroke}
      />
    </g>
  );
};

export default Scene03_FreezeAndScroll;
