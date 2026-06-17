import React from "react";
import { Point, Pose, StickFigure } from "./StickFigure";

// ---------------------------------------------------------------------------
// MIRROR SCENE - a framed mirror that shows a slightly-improved reflection
// of the character standing in front of it.
// ---------------------------------------------------------------------------
// The REAL character (outside the frame) is rendered by the calling scene
// using the normal <StickFigure /> component - this component only owns the
// mirror object itself: the frame, the glass tint, the shimmer "activation"
// wipe, and the reflected figure clipped to the glass.
//
// `activation` (0-1) plays once near the start of the scene: below ~1 a
// diagonal light sweep is still crossing the glass, as if the mirror is
// "waking up". At 1 the reflection is fully, calmly visible.
// ---------------------------------------------------------------------------

export interface MirrorSceneProps {
  /** Top-left corner of the mirror frame rectangle. */
  frameTopLeft: Point;
  frameWidth: number;
  frameHeight: number;
  /** Pose + floor anchor + scale for the reflection drawn inside the glass. */
  reflectionPose: Pose;
  /** Floor anchor for the reflection, in the SAME coordinate space as the
   * frame (typically centered horizontally inside the frame, near its
   * bottom edge) - the calling scene picks this so the reflection's feet
   * line up with the glass's bottom inner edge. */
  reflectionPosition: Point;
  reflectionScale?: number;
  /** 0-1: how "awake"/visible the reflection is (shimmer wipe progress). */
  activation: number;
  figureStroke: string;
  frameColor?: string;
  glassTint?: string;
}

export const MirrorScene: React.FC<MirrorSceneProps> = ({
  frameTopLeft,
  frameWidth,
  frameHeight,
  reflectionPose,
  reflectionPosition,
  reflectionScale = 1,
  activation,
  figureStroke,
  frameColor = "#1a1a1a",
  glassTint = "rgba(255,255,255,0.06)",
}) => {
  const clamped = Math.max(0, Math.min(1, activation));
  const clipId = "mirrorGlassClip";
  const innerPad = 10;
  const ix = frameTopLeft.x + innerPad;
  const iy = frameTopLeft.y + innerPad;
  const iw = frameWidth - innerPad * 2;
  const ih = frameHeight - innerPad * 2;

  // The shimmer sweep travels left-to-right across the glass as activation
  // goes 0 -> 1, then disappears once the mirror is fully "on".
  const sweepX = ix - iw * 0.4 + (iw * 1.8) * clamped;

  return (
    <g>
      {/* outer frame */}
      <rect
        x={frameTopLeft.x}
        y={frameTopLeft.y}
        width={frameWidth}
        height={frameHeight}
        rx={14}
        fill="none"
        stroke={frameColor}
        strokeWidth={8}
      />

      {/* glass area, clipped so the reflection never draws outside the frame */}
      <defs>
        <clipPath id={clipId}>
          <rect x={ix} y={iy} width={iw} height={ih} rx={6} />
        </clipPath>
      </defs>

      <rect x={ix} y={iy} width={iw} height={ih} rx={6} fill={glassTint} />

      <g clipPath={`url(#${clipId})`}>
        {/* reflection only becomes visible as the mirror "activates" */}
        <g opacity={Math.min(1, clamped * 1.3)}>
          <StickFigure
            pose={reflectionPose}
            position={reflectionPosition}
            scale={reflectionScale}
            stroke={figureStroke}
            mirrored
          />
        </g>

        {/* shimmer sweep - a soft diagonal band of light crossing the glass */}
        {clamped < 1 && (
          <rect
            x={sweepX}
            y={iy - 20}
            width={iw * 0.35}
            height={ih + 40}
            fill="rgba(255,255,255,0.35)"
            transform={`skewX(-12)`}
            opacity={0.6 * (1 - clamped)}
          />
        )}
      </g>
    </g>
  );
};

export default MirrorScene;
