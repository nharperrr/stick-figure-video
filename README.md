# How to Get Your Life Together at Any Age

A silent, 8-minute animated stick-figure motivational video, built with
[Remotion](https://www.remotion.dev/) (React + TypeScript). The video
contains **no on-screen text, captions, numbers, or audio of any kind** -
every beat of the story is told through stick-figure body language and
visual metaphor (a messy room, a glowing phone, shadow obstacles, a leaking
bucket, a mirror, doors, a staircase, a sunrise, and so on). It's meant to
be a clean base layer for adding voiceover, music, sound effects, and
captions afterward (e.g. in CapCut).

## Quick start

```bash
npm install
npm run dev        # opens Remotion Studio - scrub the timeline, preview live
npm run render     # renders the 1920x1080 horizontal video to out/
```

| Script                 | What it does                                                    |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Opens Remotion Studio for interactive preview/scrubbing          |
| `npm run preview`       | Same as `dev`                                                    |
| `npm run render`        | Renders `MainVideo` (1920x1080) to `out/how-to-get-your-life-together.mp4` |
| `npm run render:vertical` | Renders `MainVideoVertical` (1080x1920) to `out/how-to-get-your-life-together-vertical.mp4` |
| `npm run still`         | Renders a single still frame (frame 0) to `out/still.png`, useful for a quick visual sanity check without a full render |
| `npm run typecheck`     | Runs `tsc --noEmit` across the whole project                     |

The first time you run `npm run dev`, `render`, or `still`, Remotion will
download a headless Chrome binary it uses for previewing/rendering. This
needs unrestricted internet access on whatever machine you run it on - it's
a one-time download, cached after that.

## Project structure

```
timeline.json                 <- single source of truth for scene timing/mood
src/
  index.ts                    <- Remotion entry point (registers the root)
  Root.tsx                    <- registers the MainVideo / MainVideoVertical Compositions
  Video.tsx                   <- top-level composition: mounts every scene in
                                  order, computes the color grade, handles
                                  crossfades between scenes
  timeline.ts                 <- loads timeline.json into typed, frame-accurate data
  utils/
    colors.ts                 <- the entire color-grading system (bleak -> hopeful)
    poseSequence.ts            <- helper for holding/easing between a sequence of poses
  components/                 <- the 10 reusable visual building blocks:
    StickFigure.tsx             the character itself (forward-kinematics pose rig)
    RoomScene.tsx                the indoor backdrop (messy -> clean, dim -> bright)
    ShadowExcuse.tsx             the six "obstacle" shapes (money/body/heartbreak/etc.)
    CalendarBlocks.tsx           the glowing daily-streak blocks
    PhoneDistraction.tsx         the glowing phone prop
    MoneyLeakBucket.tsx          the leaking/patched bucket + coin drips
    MirrorScene.tsx              the mirror with a slightly-taller reflection
    DoorChoice.tsx                a row of doors, one opening into light
    StaircaseOfWins.tsx          dots that assemble into a rising staircase
    SunriseEnding.tsx            the final warm sunrise backdrop
  scenes/
    Scene01_IntroRoom.tsx ... Scene21_SunriseFinal.tsx   <- one file per scene
    index.ts                  <- maps timeline.json's "component" field to
                                  the actual scene component
    types.ts                  <- shared SceneProps interface
```

Every scene component is a small, self-contained React component that
takes `{ width, height, palette }` and reads its own local frame via
Remotion's `useCurrentFrame()` (each scene is mounted inside its own
`<Sequence>`, so frame 0 is always the scene's own first frame - scenes
never need to know their absolute position in the 8-minute timeline).

## How to retime the video

Edit **`timeline.json`** at the project root. Each scene has:

```json
{
  "id": "intro_room",
  "order": 1,
  "startSeconds": 0,
  "endSeconds": 15,
  "component": "Scene01_IntroRoom",
  "moodRange": [0, 0.02],
  "voReference": "... (for your own reference only, never rendered)",
  "visualDescription": "...",
  "animationCues": ["..."]
}
```

Scenes must be contiguous (no gaps or overlaps) - `src/timeline.ts` checks
this automatically at startup and throws a clear error if two scenes don't
line up. `moodRange` is what drives the color grade (see below) - it does
not have to match the scene's position in the list exactly, but generally
should rise from `0` (Scene01) to `1` (Scene21).

If you change the total length of the video (by changing the last scene's
`endSeconds`), both Compositions in `src/Root.tsx` will automatically pick
up the new total duration - no need to edit that file.

## How to adjust colors / mood grading

Edit **`src/utils/colors.ts`**. The whole video is graded off a single
`moodProgress` number from 0 (the bleak, gray opening) to 1 (the bright,
warm sunrise ending) - every scene asks this file for a `Palette` at its
current mood progress rather than hardcoding colors. To restyle the entire
video, just change the hex values in `BLEAK_PALETTE` and `HOPEFUL_PALETTE`
at the top of that file; every scene re-grades automatically.

## How to switch to vertical (1080x1920)

Already set up - just run:

```bash
npm run render:vertical
```

This renders the `MainVideoVertical` Composition (registered in
`src/Root.tsx`), which reuses the exact same `Video` component and the
exact same `timeline.json` timing. Every scene positions its content using
fractions of the `width`/`height` props it's given (e.g. `width * 0.42`)
rather than hardcoded pixel values, so the whole video re-flows to the
taller, narrower canvas automatically.

## Adjusting the character / proportions

`src/components/StickFigure.tsx` uses a small forward-kinematics rig: a
`Pose` is just a set of joint angles (shoulder, elbow, hip, knee, spine,
posture bend, head tilt), and `getFigurePoints()` turns any `Pose` into
actual joint coordinates. All of the named poses used throughout the video
live in the `POSES` dictionary in that file - tweak a pose there and every
scene using it updates together. `PROPORTIONS` at the top of that file
controls head size, limb length, and line thickness for the whole figure.

## The silent / no-text guarantee

This project intentionally renders **zero** text, captions, subtitles,
numbers, or audio anywhere - that was a hard requirement, not a default
that happens to be unset. Every "amount" in the video (money, time, reps)
is represented with shapes, icons, glows, or counts of repeated elements -
never digits or words. Add your voiceover, music, sound effects, and
captions afterward in your video editor of choice.

## A note on rendering in this environment

This project was built and type-checked in a sandboxed environment without
unrestricted internet access, so the actual `npm run render` / `npm run
still` step (which needs to download a headless Chrome binary) could not be
executed here - it returned a network/allowlist error rather than a code
error. The project bundles cleanly and passes a full TypeScript typecheck
with zero errors, so the code itself is verified; running `npm install`
followed by `npm run dev` or `npm run render` on your own machine (with
normal internet access) should work as expected.
