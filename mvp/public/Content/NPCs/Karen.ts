import { vec, Vector } from "excalibur";
import { NpcManifest, InteractionManifest } from "../../../src/types";
import { CutsceneManifest } from "../../../src/Lib/cutscenes/CutScenes";
import { game } from "../../../src/main";

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
      type: "dialog",
      args: {
        path: "/public/dialog/test.json",
        scene: game.currentScene,
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
