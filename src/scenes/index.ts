import { Scene01_IntroRoom } from "./Scene01_IntroRoom";
import { Scene02_ShadowExcuses } from "./Scene02_ShadowExcuses";
import { Scene03_FreezeAndScroll } from "./Scene03_FreezeAndScroll";
import { Scene04_SparkAndStand } from "./Scene04_SparkAndStand";
import { Scene05_FirstProof } from "./Scene05_FirstProof";
import { Scene06_TinyPromiseMontage } from "./Scene06_TinyPromiseMontage";
import { Scene07_CalendarBlocks } from "./Scene07_CalendarBlocks";
import { Scene08_MoneyVisible } from "./Scene08_MoneyVisible";
import { Scene09_PlanBeatsPanic } from "./Scene09_PlanBeatsPanic";
import { Scene10_BodyHabits } from "./Scene10_BodyHabits";
import { Scene11_MirrorTaller } from "./Scene11_MirrorTaller";
import { Scene12_HeartbreakLight } from "./Scene12_HeartbreakLight";
import { Scene13_MoveAnyway } from "./Scene13_MoveAnyway";
import { Scene14_Doors } from "./Scene14_Doors";
import { Scene15_TryThings } from "./Scene15_TryThings";
import { Scene16_PhoneShrink } from "./Scene16_PhoneShrink";
import { Scene17_TimeBlockShield } from "./Scene17_TimeBlockShield";
import { Scene18_BackpackHelp } from "./Scene18_BackpackHelp";
import { Scene19_StaircaseVotes } from "./Scene19_StaircaseVotes";
import { Scene20_WorldBrighter } from "./Scene20_WorldBrighter";
import { Scene21_SunriseFinal } from "./Scene21_SunriseFinal";
import { SceneProps } from "./types";
import React from "react";

// ---------------------------------------------------------------------------
// SCENE REGISTRY
// ---------------------------------------------------------------------------
// Maps the "component" string in timeline.json to the actual React
// component. src/Video.tsx looks scenes up here by name so the timeline
// stays the single source of truth for scene order/timing.
//
// TO ADD A NEW SCENE: write the scene file in this folder, add it to
// timeline.json with a matching "component" name, then register it here.
// ---------------------------------------------------------------------------

export const sceneComponents: Record<string, React.FC<SceneProps>> = {
  Scene01_IntroRoom,
  Scene02_ShadowExcuses,
  Scene03_FreezeAndScroll,
  Scene04_SparkAndStand,
  Scene05_FirstProof,
  Scene06_TinyPromiseMontage,
  Scene07_CalendarBlocks,
  Scene08_MoneyVisible,
  Scene09_PlanBeatsPanic,
  Scene10_BodyHabits,
  Scene11_MirrorTaller,
  Scene12_HeartbreakLight,
  Scene13_MoveAnyway,
  Scene14_Doors,
  Scene15_TryThings,
  Scene16_PhoneShrink,
  Scene17_TimeBlockShield,
  Scene18_BackpackHelp,
  Scene19_StaircaseVotes,
  Scene20_WorldBrighter,
  Scene21_SunriseFinal,
};
