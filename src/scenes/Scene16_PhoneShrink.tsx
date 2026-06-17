import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, interpolatePose } from "../components/StickFigure";
import { PhoneDistraction } from "../components/PhoneDistraction";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 16 - PHONE SHRINK (5:45-6:05)
// A giant glowing phone looms over the character, then shrinks to a normal
// size on a reach gesture and gets placed into a drawer that closes.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const REACH_FRAME = 300; // 50% through the 600-frame scene

export const Scene16_PhoneShrink: React.FC<SceneProps> = ({ width, height, palette }) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const centerX = width * 0.46;

  const shrinkSpring = spring({ frame: frame - REACH_FRAME, fps: FPS, config: { damping: 11 } });
  const shrinkT = Math.max(0, Math.min(1, shrinkSpring));
  const phoneScale = interpolate(shrinkT, [0, 1], [4.0, 1.0]);

  const stage = interpolate(frame, [0, REACH_FRAME, REACH_FRAME + 120], [0, 1, 2], {
    extrapolateRight: "clamp",
  });
  const pose =
    stage <= 1
      ? interpolatePose(POSES.reachingUp, POSES.placingDownObject, stage)
      : interpolatePose(POSES.placingDownObject, POSES.standingRelieved, stage - 1);

  // Drawer slides open before the reach, then closes once the phone is placed.
  const drawerOpen = interpolate(
    frame,
    [REACH_FRAME - 60, REACH_FRAME, REACH_FRAME + 90, REACH_FRAME + 150],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const drawerW = 130;
  const drawerH = 36;
  const drawerX = centerX + 90;
  const drawerClosedY = floorY - 20;
  const drawerY = drawerClosedY + drawerOpen * 28;

  // Phone glow cuts off once it's inside the closing drawer.
  const phoneInsideDrawer = frame > REACH_FRAME + 80;
  const phoneOpacity = phoneInsideDrawer
    ? interpolate(frame, [REACH_FRAME + 80, REACH_FRAME + 140], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const phoneY = phoneInsideDrawer ? drawerY - 10 : floorY - 220 + shrinkT * 160;

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.4}
      lightLevel={0.55}
      curtainsOpen={0.6}
      frame={frame}
    >
      {/* drawer body */}
      <rect x={drawerX - drawerW / 2} y={drawerClosedY} width={drawerW} height={14} fill={palette.wallShadow} />
      <rect x={drawerX - drawerW / 2 + 6} y={drawerY} width={drawerW - 12} height={drawerH} rx={4} fill={palette.wallShadow} opacity={0.9} />

      {phoneOpacity > 0.02 && (
        <PhoneDistraction
          position={{ x: centerX, y: phoneY }}
          scale={phoneScale}
          glowIntensity={Math.min(1, 0.5 + shrinkT * 0.5) * phoneOpacity}
        />
      )}

      <StickFigure pose={pose} position={{ x: centerX, y: floorY }} stroke={palette.figureStroke} />
    </RoomScene>
  );
};

export default Scene16_PhoneShrink;
