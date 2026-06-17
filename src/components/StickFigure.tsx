import React from "react";

// ---------------------------------------------------------------------------
// STICK FIGURE - core reusable character component
// ---------------------------------------------------------------------------
// The figure is built with simple 2D forward kinematics from a small "Pose"
// object (joint angles) instead of hand-drawn frames. Every scene animates
// the character by interpolating between named Pose presets (see POSES
// below) or by generating a pose procedurally (see walkCyclePose).
//
// COORDINATE CONVENTION (read this before editing angles):
//   - `position` (passed as a prop) is the character's floor anchor point.
//   - Pose.hipOffsetX / hipOffsetY move the hip relative to that anchor.
//   - Angles for LEGS and ARMS: 0deg = hanging straight down, positive
//     degrees swing the limb toward screen-RIGHT, negative toward screen-LEFT.
//   - Angle for the SPINE: 0deg = perfectly upright, positive leans the
//     whole upper body toward screen-RIGHT (90deg = lying down, head to
//     the right).
//   - postureBend (0 to ~0.4): purely visual slouch curve drawn into the
//     spine line. 0 = ramrod straight, 0.4 = heavily hunched. This is the
//     single value most scenes animate to show "posture improving".
//
// TO ADJUST FIGURE PROPORTIONS (head size, limb length, line thickness):
// edit PROPORTIONS below. Every pose and every scene will rescale together.
// ---------------------------------------------------------------------------

export const PROPORTIONS = {
  headRadius: 17,
  neckLength: 6,
  spineLength: 78,
  shoulderOffset: 3,
  hipOffset: 9,
  upperArmLength: 44,
  forearmLength: 40,
  upperLegLength: 54,
  lowerLegLength: 50,
  strokeWidth: 7,
};

export interface Pose {
  hipOffsetX: number;
  hipOffsetY: number; // negative = above the floor anchor
  spineAngle: number;
  postureBend: number;
  headTilt: number;
  leftShoulderAngle: number;
  leftElbowAngle: number;
  rightShoulderAngle: number;
  rightElbowAngle: number;
  leftHipAngle: number;
  leftKneeAngle: number;
  rightHipAngle: number;
  rightKneeAngle: number;
}

export interface Point {
  x: number;
  y: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Vector pointing "down" relative to a 0deg-is-down convention (limbs). */
function downVector(angleDeg: number, length: number): Point {
  const r = toRad(angleDeg);
  return { x: length * Math.sin(r), y: length * Math.cos(r) };
}

/** Vector pointing "up" relative to a 0deg-is-up convention (spine/head). */
function upVector(angleDeg: number, length: number): Point {
  const r = toRad(angleDeg);
  return { x: length * Math.sin(r), y: -length * Math.cos(r) };
}

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });

export interface FigurePoints {
  hip: Point;
  neck: Point;
  head: Point;
  shoulderL: Point;
  shoulderR: Point;
  elbowL: Point;
  elbowR: Point;
  handL: Point;
  handR: Point;
  hipL: Point;
  hipR: Point;
  kneeL: Point;
  kneeR: Point;
  footL: Point;
  footR: Point;
  spineControl: Point; // bezier control point used to draw the slouch curve
}

/**
 * Forward-kinematics solver: turns a Pose + anchor position into every
 * joint coordinate. Exported so scenes can attach props (a phone in a hand,
 * a dumbbell, a backpack) at exact joint positions.
 */
export function getFigurePoints(
  pose: Pose,
  position: Point,
  scale = 1
): FigurePoints {
  const p = PROPORTIONS;
  const hip: Point = {
    x: position.x + pose.hipOffsetX * scale,
    y: position.y + pose.hipOffsetY * scale,
  };

  const spineDir = upVector(pose.spineAngle, p.spineLength * scale);
  const neck = add(hip, spineDir);

  const headDir = upVector(
    pose.spineAngle + pose.headTilt,
    (p.neckLength + p.headRadius) * scale
  );
  const head = add(neck, headDir);

  const theta = toRad(pose.spineAngle);
  const perp: Point = { x: Math.cos(theta), y: Math.sin(theta) };
  const shoulderOffset = p.shoulderOffset * scale;
  const hipOffsetAmt = p.hipOffset * scale;

  const shoulderR = add(neck, { x: perp.x * shoulderOffset, y: perp.y * shoulderOffset });
  const shoulderL = add(neck, { x: -perp.x * shoulderOffset, y: -perp.y * shoulderOffset });
  const hipR = add(hip, { x: perp.x * hipOffsetAmt, y: perp.y * hipOffsetAmt });
  const hipL = add(hip, { x: -perp.x * hipOffsetAmt, y: -perp.y * hipOffsetAmt });

  const elbowL = add(
    shoulderL,
    downVector(pose.leftShoulderAngle + pose.spineAngle, p.upperArmLength * scale)
  );
  const handL = add(
    elbowL,
    downVector(
      pose.leftShoulderAngle + pose.spineAngle + pose.leftElbowAngle,
      p.forearmLength * scale
    )
  );

  const elbowR = add(
    shoulderR,
    downVector(pose.rightShoulderAngle + pose.spineAngle, p.upperArmLength * scale)
  );
  const handR = add(
    elbowR,
    downVector(
      pose.rightShoulderAngle + pose.spineAngle + pose.rightElbowAngle,
      p.forearmLength * scale
    )
  );

  const kneeL = add(hipL, downVector(pose.leftHipAngle, p.upperLegLength * scale));
  const footL = add(
    kneeL,
    downVector(pose.leftHipAngle + pose.leftKneeAngle, p.lowerLegLength * scale)
  );

  const kneeR = add(hipR, downVector(pose.rightHipAngle, p.upperLegLength * scale));
  const footR = add(
    kneeR,
    downVector(pose.rightHipAngle + pose.rightKneeAngle, p.lowerLegLength * scale)
  );

  // Slouch curve: bulge the spine path away from a straight line, in the
  // direction the figure is leaning, proportional to postureBend.
  const mid = { x: (hip.x + neck.x) / 2, y: (hip.y + neck.y) / 2 };
  const bulge = pose.postureBend * p.spineLength * scale * 0.5;
  const spineControl = add(mid, { x: perp.x * bulge, y: perp.y * bulge });

  return {
    hip,
    neck,
    head,
    shoulderL,
    shoulderR,
    elbowL,
    elbowR,
    handL,
    handR,
    hipL,
    hipR,
    kneeL,
    kneeR,
    footL,
    footR,
    spineControl,
  };
}

/** Linear blend between two poses. Used for short pose-to-pose transitions. */
export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return {
    hipOffsetX: lerp(a.hipOffsetX, b.hipOffsetX),
    hipOffsetY: lerp(a.hipOffsetY, b.hipOffsetY),
    spineAngle: lerp(a.spineAngle, b.spineAngle),
    postureBend: lerp(a.postureBend, b.postureBend),
    headTilt: lerp(a.headTilt, b.headTilt),
    leftShoulderAngle: lerp(a.leftShoulderAngle, b.leftShoulderAngle),
    leftElbowAngle: lerp(a.leftElbowAngle, b.leftElbowAngle),
    rightShoulderAngle: lerp(a.rightShoulderAngle, b.rightShoulderAngle),
    rightElbowAngle: lerp(a.rightElbowAngle, b.rightElbowAngle),
    leftHipAngle: lerp(a.leftHipAngle, b.leftHipAngle),
    leftKneeAngle: lerp(a.leftKneeAngle, b.leftKneeAngle),
    rightHipAngle: lerp(a.rightHipAngle, b.rightHipAngle),
    rightKneeAngle: lerp(a.rightKneeAngle, b.rightKneeAngle),
  };
}

// ---------------------------------------------------------------------------
// NAMED POSE PRESETS
// ---------------------------------------------------------------------------
// Add new presets here as needed - every scene file imports from this list.
// Keep names descriptive; they double as in-code documentation of the story.
// ---------------------------------------------------------------------------

export const POSES: Record<string, Pose> = {
  slumpedFloor: {
    hipOffsetX: 0,
    hipOffsetY: -28,
    spineAngle: 22,
    postureBend: 0.38,
    headTilt: 18,
    leftShoulderAngle: 12,
    leftElbowAngle: 20,
    rightShoulderAngle: -8,
    rightElbowAngle: 60,
    leftHipAngle: 70,
    leftKneeAngle: -95,
    rightHipAngle: 55,
    rightKneeAngle: -100,
  },
  reachForPhone: {
    hipOffsetX: 0,
    hipOffsetY: -26,
    spineAngle: 30,
    postureBend: 0.34,
    headTilt: 22,
    leftShoulderAngle: 10,
    leftElbowAngle: 15,
    rightShoulderAngle: -55,
    rightElbowAngle: 15,
    leftHipAngle: 68,
    leftKneeAngle: -95,
    rightHipAngle: 50,
    rightKneeAngle: -100,
  },
  lyingDown: {
    hipOffsetX: 0,
    hipOffsetY: -10,
    spineAngle: 88,
    postureBend: 0.1,
    headTilt: 4,
    leftShoulderAngle: 4,
    leftElbowAngle: 8,
    rightShoulderAngle: 8,
    rightElbowAngle: 10,
    leftHipAngle: 4,
    leftKneeAngle: -6,
    rightHipAngle: -4,
    rightKneeAngle: -8,
  },
  sittingUp: {
    hipOffsetX: 0,
    hipOffsetY: -30,
    spineAngle: 14,
    postureBend: 0.22,
    headTilt: 6,
    leftShoulderAngle: 6,
    leftElbowAngle: 10,
    rightShoulderAngle: -4,
    rightElbowAngle: 12,
    leftHipAngle: 65,
    leftKneeAngle: -95,
    rightHipAngle: 65,
    rightKneeAngle: -95,
  },
  standing: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 4,
    postureBend: 0.18,
    headTilt: 2,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: -4,
    rightElbowAngle: 6,
    leftHipAngle: 2,
    leftKneeAngle: -2,
    rightHipAngle: -2,
    rightKneeAngle: -2,
  },
  makeBed: {
    hipOffsetX: 0,
    hipOffsetY: -78,
    spineAngle: 30,
    postureBend: 0.24,
    headTilt: 6,
    leftShoulderAngle: -30,
    leftElbowAngle: 30,
    rightShoulderAngle: -40,
    rightElbowAngle: 25,
    leftHipAngle: 4,
    leftKneeAngle: -8,
    rightHipAngle: 8,
    rightKneeAngle: -10,
  },
  pickUpTrash: {
    hipOffsetX: 4,
    hipOffsetY: -64,
    spineAngle: 48,
    postureBend: 0.26,
    headTilt: 10,
    leftShoulderAngle: -60,
    leftElbowAngle: 30,
    rightShoulderAngle: 6,
    rightElbowAngle: 8,
    leftHipAngle: 6,
    leftKneeAngle: -30,
    rightHipAngle: -10,
    rightKneeAngle: -4,
  },
  openCurtains: {
    hipOffsetX: 0,
    hipOffsetY: -104,
    spineAngle: 2,
    postureBend: 0.16,
    headTilt: 0,
    leftShoulderAngle: -140,
    leftElbowAngle: 10,
    rightShoulderAngle: 130,
    rightElbowAngle: 10,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  sittingAtTable: {
    hipOffsetX: 0,
    hipOffsetY: -58,
    spineAngle: 8,
    postureBend: 0.2,
    headTilt: 6,
    leftShoulderAngle: 20,
    leftElbowAngle: -40,
    rightShoulderAngle: -16,
    rightElbowAngle: -50,
    leftHipAngle: 70,
    leftKneeAngle: -95,
    rightHipAngle: 70,
    rightKneeAngle: -95,
  },
  armReachSide: {
    hipOffsetX: 0,
    hipOffsetY: -100,
    spineAngle: 6,
    postureBend: 0.16,
    headTilt: 4,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: 75,
    rightElbowAngle: -10,
    leftHipAngle: 2,
    leftKneeAngle: -2,
    rightHipAngle: -2,
    rightKneeAngle: -2,
  },
  standingLookingForward: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 2,
    postureBend: 0.14,
    headTilt: -2,
    leftShoulderAngle: 2,
    leftElbowAngle: 4,
    rightShoulderAngle: -2,
    rightElbowAngle: 4,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  overheadLift: {
    hipOffsetX: 0,
    hipOffsetY: -102,
    spineAngle: 4,
    postureBend: 0.14,
    headTilt: 2,
    leftShoulderAngle: 172,
    leftElbowAngle: 6,
    rightShoulderAngle: -172,
    rightElbowAngle: -6,
    leftHipAngle: 6,
    leftKneeAngle: -10,
    rightHipAngle: -6,
    rightKneeAngle: -10,
  },
  eatingSeated: {
    hipOffsetX: 0,
    hipOffsetY: -58,
    spineAngle: 6,
    postureBend: 0.16,
    headTilt: 8,
    leftShoulderAngle: 30,
    leftElbowAngle: -90,
    rightShoulderAngle: -10,
    rightElbowAngle: 8,
    leftHipAngle: 70,
    leftKneeAngle: -95,
    rightHipAngle: 70,
    rightKneeAngle: -95,
  },
  standingHandOnChest: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 2,
    postureBend: 0.12,
    headTilt: 4,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: 50,
    rightElbowAngle: -120,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  carryingWeightBehind: {
    hipOffsetX: -6,
    hipOffsetY: -100,
    spineAngle: -14,
    postureBend: 0.3,
    headTilt: -10,
    leftShoulderAngle: -120,
    leftElbowAngle: -20,
    rightShoulderAngle: -110,
    rightElbowAngle: -25,
    leftHipAngle: 4,
    leftKneeAngle: -4,
    rightHipAngle: -4,
    rightKneeAngle: -4,
  },
  showering: {
    hipOffsetX: 0,
    hipOffsetY: -104,
    spineAngle: 2,
    postureBend: 0.14,
    headTilt: 8,
    leftShoulderAngle: 120,
    leftElbowAngle: -10,
    rightShoulderAngle: -20,
    rightElbowAngle: 8,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  phoneCallPose: {
    hipOffsetX: 0,
    hipOffsetY: -105,
    spineAngle: 2,
    postureBend: 0.12,
    headTilt: 14,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: 140,
    rightElbowAngle: -130,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  sittingInSun: {
    hipOffsetX: 0,
    hipOffsetY: -54,
    spineAngle: -4,
    postureBend: 0.08,
    headTilt: -6,
    leftShoulderAngle: 30,
    leftElbowAngle: 10,
    rightShoulderAngle: -30,
    rightElbowAngle: 10,
    leftHipAngle: 72,
    leftKneeAngle: -98,
    rightHipAngle: 72,
    rightKneeAngle: -98,
  },
  lookingSideToSide: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 2,
    postureBend: 0.12,
    headTilt: 0,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: -4,
    rightElbowAngle: 6,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  openDoorReach: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 4,
    postureBend: 0.12,
    headTilt: 2,
    leftShoulderAngle: 60,
    leftElbowAngle: -8,
    rightShoulderAngle: -4,
    rightElbowAngle: 6,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  readingSeated: {
    hipOffsetX: 0,
    hipOffsetY: -56,
    spineAngle: 10,
    postureBend: 0.16,
    headTilt: 14,
    leftShoulderAngle: 30,
    leftElbowAngle: -70,
    rightShoulderAngle: -30,
    rightElbowAngle: -70,
    leftHipAngle: 72,
    leftKneeAngle: -96,
    rightHipAngle: 72,
    rightKneeAngle: -96,
  },
  helpingCarry: {
    hipOffsetX: 0,
    hipOffsetY: -100,
    spineAngle: 8,
    postureBend: 0.14,
    headTilt: 4,
    leftShoulderAngle: 70,
    leftElbowAngle: -20,
    rightShoulderAngle: 80,
    rightElbowAngle: -20,
    leftHipAngle: 4,
    leftKneeAngle: -6,
    rightHipAngle: -4,
    rightKneeAngle: -6,
  },
  stackingBlocks: {
    hipOffsetX: 0,
    hipOffsetY: -66,
    spineAngle: 24,
    postureBend: 0.18,
    headTilt: 12,
    leftShoulderAngle: -50,
    leftElbowAngle: 20,
    rightShoulderAngle: -60,
    rightElbowAngle: 24,
    leftHipAngle: 12,
    leftKneeAngle: -40,
    rightHipAngle: -10,
    rightKneeAngle: -8,
  },
  reachingUp: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 4,
    postureBend: 0.1,
    headTilt: -14,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: 176,
    rightElbowAngle: 4,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  placingDownObject: {
    hipOffsetX: 0,
    hipOffsetY: -90,
    spineAngle: 18,
    postureBend: 0.16,
    headTilt: 10,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: 50,
    rightElbowAngle: -10,
    leftHipAngle: 4,
    leftKneeAngle: -10,
    rightHipAngle: -4,
    rightKneeAngle: -10,
  },
  standingRelieved: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: -2,
    postureBend: 0.08,
    headTilt: -4,
    leftShoulderAngle: 4,
    leftElbowAngle: 6,
    rightShoulderAngle: -4,
    rightElbowAngle: 6,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
  standingGuard: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 0,
    postureBend: 0.08,
    headTilt: 0,
    leftShoulderAngle: -70,
    leftElbowAngle: -60,
    rightShoulderAngle: 70,
    rightElbowAngle: 60,
    leftHipAngle: 6,
    leftKneeAngle: -4,
    rightHipAngle: -6,
    rightKneeAngle: -4,
  },
  liftingStrap: {
    hipOffsetX: 0,
    hipOffsetY: -106,
    spineAngle: 6,
    postureBend: 0.12,
    headTilt: 4,
    leftShoulderAngle: -90,
    leftElbowAngle: -30,
    rightShoulderAngle: 4,
    rightElbowAngle: 6,
    leftHipAngle: 4,
    leftKneeAngle: -6,
    rightHipAngle: -4,
    rightKneeAngle: -6,
  },
  standingTallFinal: {
    hipOffsetX: 0,
    hipOffsetY: -108,
    spineAngle: 0,
    postureBend: 0.04,
    headTilt: 0,
    leftShoulderAngle: 2,
    leftElbowAngle: 4,
    rightShoulderAngle: -2,
    rightElbowAngle: 4,
    leftHipAngle: 0,
    leftKneeAngle: 0,
    rightHipAngle: 0,
    rightKneeAngle: 0,
  },
};

/**
 * Procedural walk cycle. `phase` is in radians and should increase steadily
 * over time (e.g. phase = frame * 0.25). `postureBend` lets the caller tie
 * the walk into the character's overall posture-improvement arc.
 */
export function walkCyclePose(phase: number, postureBend = 0.16): Pose {
  const swing = Math.sin(phase);
  const counterSwing = Math.sin(phase + Math.PI);
  const kneeLift = (s: number) => -Math.max(0, Math.sin(s)) * 55 - 6;
  return {
    hipOffsetX: 0,
    hipOffsetY: -106 + Math.abs(Math.cos(phase)) * 4,
    spineAngle: 2 + swing * 1.5,
    postureBend,
    headTilt: 0,
    leftShoulderAngle: counterSwing * 22,
    leftElbowAngle: 10,
    rightShoulderAngle: swing * 22,
    rightElbowAngle: 10,
    leftHipAngle: swing * 32,
    leftKneeAngle: kneeLift(phase),
    rightHipAngle: counterSwing * 32,
    rightKneeAngle: kneeLift(phase + Math.PI),
  };
}

/** Repeating push-up arm bend; pair with a vertical body bob in the scene. */
export function pushupArmsPose(phase: number): Pose {
  const down = (Math.sin(phase) + 1) / 2; // 0 (up) -> 1 (down)
  return {
    hipOffsetX: 0,
    hipOffsetY: -16,
    spineAngle: 90,
    postureBend: 0.06,
    headTilt: 0,
    leftShoulderAngle: 60,
    leftElbowAngle: -40 - down * 70,
    rightShoulderAngle: 60,
    rightElbowAngle: -40 - down * 70,
    leftHipAngle: 4,
    leftKneeAngle: -4,
    rightHipAngle: -4,
    rightKneeAngle: -4,
  };
}

/** Seated typing pose with subtle hand bob handled by the caller. */
export const typingPose: Pose = {
  hipOffsetX: 0,
  hipOffsetY: -58,
  spineAngle: 14,
  postureBend: 0.22,
  headTilt: 10,
  leftShoulderAngle: 20,
  leftElbowAngle: -60,
  rightShoulderAngle: -16,
  rightElbowAngle: -64,
  leftHipAngle: 70,
  leftKneeAngle: -95,
  rightHipAngle: 70,
  rightKneeAngle: -95,
};

export const wipingDeskPose: Pose = {
  hipOffsetX: 6,
  hipOffsetY: -90,
  spineAngle: 26,
  postureBend: 0.22,
  headTilt: 12,
  leftShoulderAngle: 50,
  leftElbowAngle: -20,
  rightShoulderAngle: 4,
  rightElbowAngle: 6,
  leftHipAngle: 4,
  leftKneeAngle: -10,
  rightHipAngle: -4,
  rightKneeAngle: -10,
};

export const talkingPose: Pose = {
  hipOffsetX: 0,
  hipOffsetY: -106,
  spineAngle: 2,
  postureBend: 0.16,
  headTilt: 4,
  leftShoulderAngle: 30,
  leftElbowAngle: -50,
  rightShoulderAngle: -4,
  rightElbowAngle: 6,
  leftHipAngle: 0,
  leftKneeAngle: 0,
  rightHipAngle: 0,
  rightKneeAngle: 0,
};

export const standingConfidentIdlePose: Pose = {
  hipOffsetX: 0,
  hipOffsetY: -107,
  spineAngle: 1,
  postureBend: 0.1,
  headTilt: 0,
  leftShoulderAngle: 3,
  leftElbowAngle: 5,
  rightShoulderAngle: -3,
  rightElbowAngle: 5,
  leftHipAngle: 0,
  leftKneeAngle: 0,
  rightHipAngle: 0,
  rightKneeAngle: 0,
};

// ---------------------------------------------------------------------------
// RENDER COMPONENT
// ---------------------------------------------------------------------------

export interface StickFigureProps {
  pose: Pose;
  position: Point;
  scale?: number;
  stroke?: string;
  opacity?: number;
  /** Mirrors the figure horizontally around `position.x` - used for reflections. */
  mirrored?: boolean;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  pose,
  position,
  scale = 1,
  stroke = "#1a1a1a",
  opacity = 1,
  mirrored = false,
}) => {
  const effectivePose: Pose = mirrored
    ? {
        ...pose,
        hipOffsetX: -pose.hipOffsetX,
        spineAngle: -pose.spineAngle,
        headTilt: -pose.headTilt,
        leftShoulderAngle: -pose.rightShoulderAngle,
        leftElbowAngle: -pose.rightElbowAngle,
        rightShoulderAngle: -pose.leftShoulderAngle,
        rightElbowAngle: -pose.leftElbowAngle,
        leftHipAngle: -pose.rightHipAngle,
        leftKneeAngle: -pose.rightKneeAngle,
        rightHipAngle: -pose.leftHipAngle,
        rightKneeAngle: -pose.leftKneeAngle,
      }
    : pose;

  const pts = getFigurePoints(effectivePose, position, scale);
  const w = PROPORTIONS.strokeWidth * scale;

  const line = (a: Point, b: Point) => (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={stroke}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );

  return (
    <g opacity={opacity}>
      {/* legs (drawn behind torso) */}
      {line(pts.hipL, pts.kneeL)}
      {line(pts.kneeL, pts.footL)}
      {line(pts.hipR, pts.kneeR)}
      {line(pts.kneeR, pts.footR)}

      {/* spine, drawn as a curve so postureBend reads as a slouch */}
      <path
        d={`M ${pts.hip.x} ${pts.hip.y} Q ${pts.spineControl.x} ${pts.spineControl.y} ${pts.neck.x} ${pts.neck.y}`}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
        strokeLinecap="round"
      />

      {/* arms */}
      {line(pts.shoulderL, pts.elbowL)}
      {line(pts.elbowL, pts.handL)}
      {line(pts.shoulderR, pts.elbowR)}
      {line(pts.elbowR, pts.handR)}

      {/* head */}
      <circle
        cx={pts.head.x}
        cy={pts.head.y}
        r={PROPORTIONS.headRadius * scale}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
      />
    </g>
  );
};

export default StickFigure;
