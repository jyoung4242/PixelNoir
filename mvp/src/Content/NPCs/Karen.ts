import { vec, Vector } from "excalibur";
import { NpcManifest, InteractionManifest } from "../../types";
import { CutsceneManifest } from "../../Lib/cutscenes/CutScenes";

export const karenManifest: NpcManifest = {
  name: "Karen",
  defaultMap: "Overworld",
  defaultTile: vec(9, 10),
  routines: [
    {
      id: "look lost",
      mapId: "Overworld",
      trigger: { time: "12:03" },
      loop: true,
      sequence: [
        { type: "wait", args: { duration: 250, dir: Vector.Down } },
        { type: "wait", args: { duration: 250, dir: Vector.Left } },
        { type: "wait", args: { duration: 250, dir: Vector.Up } },
        { type: "wait", args: { duration: 250, dir: Vector.Right } },
      ],
    },
  ],
};

export const karenCutscene: CutsceneManifest = {
  id: "karen",
  commands: [
    {
      type: "log",
      args: {
        message: "I'm a cutscene, waiting 2.5 seconds",
        level: "info",
      },
    },
    {
      type: "wait",
      args: {
        duration: 2500,
      },
    },
    {
      type: "log",
      args: {
        message: "Interaction cutscene ending",
        level: "info",
      },
    },
  ],
};
export const karenInteraction: InteractionManifest = {
  id: "karen_intro",
  cutscene: karenCutscene,
  priority: 1,
};
