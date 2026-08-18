import { Vector } from "excalibur";
import { Detective } from "./Actors/detective";
import { Bar } from "./Scenes/Bar";
import { OverWorld } from "./Scenes/Overworld";
import { Warehouse } from "./Scenes/Warehouse";
import { PIOffice } from "./Scenes/PIOffice";
import { CutsceneManifest } from "./Lib/cutscenes/CutScenes";

export type GameScenes = Bar | OverWorld | Warehouse | PIOffice;
export type SceneNames = "root" | "Overworld" | "Bar" | "Warehouse" | "PIOffice";

export interface TransitionContext {
  player: Detective;
  facing: Vector;
  leavingScene: SceneNames;
}

export interface ScheduleTrigger {
  /** Time in 24h format (e.g. "08:00") or game ticks */
  time: string;
  storyPoints?: string[];
}

export interface ScheduledRoutine {
  id: string;
  /** Target map for this routine. Overrides defaultMap if specified */
  mapId?: string;
  /** Spawn tile on target map when this routine begins off-scene */
  loop?: boolean;
  startTile?: Vector;
  trigger: ScheduleTrigger;
  sequence: ActionStep[];
}

export interface ActionStep {
  /** Corresponds to your registered commands (e.g., "moveActor", "wait", "playAnim") */
  type: string;
  /** Parameters fed directly to your Excalibur action executor */
  args: Record<string, any>;
}

// --- Story Condition & Cutscene Additions ---

export type ComparisonOp = "==" | "!=" | ">" | ">=" | "<" | "<=" | "IN" | "NOT_IN";

export interface StoryCondition {
  key: string;
  op: ComparisonOp;
  value: any;
}

export interface InteractionManifest {
  id: string;
  /** Priority when multiple interactions meet condition requirements (higher evaluates first) */
  priority?: number;
  /** Storypoint conditions that must ALL (or ANY) be true to trigger this cutscene */
  requires?: StoryCondition[];
  conditionMode?: "ALL" | "ANY";
  /** Optional time window restriction (e.g., only available at night) */
  timeWindow?: { start: string; end: string };
  /** Either a full CutsceneManifest object or the ID of a pre-registered cutscene */
  cutscene: CutsceneManifest;
}

export type NpcManifest = {
  name: string;
  defaultMap: string;
  defaultTile: Vector;
  routines: ScheduledRoutine[];
};
