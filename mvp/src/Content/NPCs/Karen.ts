import { vec, Vector } from "excalibur";
import { NpcManifest } from "../../types";

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
