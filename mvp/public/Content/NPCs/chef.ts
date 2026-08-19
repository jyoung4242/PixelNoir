import { vec, Vector } from "excalibur";
import { NpcManifest } from "../../types";

export const chefManifest: NpcManifest = {
  name: "Chef Pierre",
  defaultMap: "PIOffice",
  defaultTile: vec(9, 7),
  routines: [
    {
      id: "exercise_astar",
      mapId: "PIOffice",
      trigger: { time: "12:05" },
      loop: true,
      sequence: [
        { type: "followPath", args: { targetTile: vec(1, 4) } },
        { type: "followPath", args: { targetTile: vec(7, 4) } },
        { type: "followPath", args: { targetTile: vec(10, 6) } },
        { type: "followPath", args: { targetTile: vec(3, 6) } },
        { type: "wait", args: { duration: 50, dir: Vector.Down } },
      ],
    },
  ],
};

/*
 {
      id: "move_LR",
      mapId: "PIOffice",
      trigger: { time: "07:00" },
      sequence: [
        { type: "moveActor", args: { numTiles: 3, dir: Vector.Left } },
        { type: "wait", args: { duration: 2000, dir: Vector.Down } },
        { type: "moveActor", args: { numTiles: 3, dir: Vector.Right } },
        { type: "wait", args: { duration: 2000, dir: Vector.Down } },
      ],
    },
    {
      id: "move_UD",
      mapId: "PIOffice",
      trigger: { time: "6:00" },
      sequence: [
        { type: "moveActor", args: { numTiles: 3, dir: Vector.Up } },
        { type: "wait", args: { duration: 2000, dir: Vector.Down } },
        { type: "moveActor", args: { numTiles: 3, dir: Vector.Down } },
        { type: "wait", args: { duration: 2000, dir: Vector.Down } },
      ],
    },
 {
      id: "move_maps",
      mapId: "PIOffice",
      trigger: { time: "12:05" },
      loop: false,
      sequence: [{ type: "sceneSwitch", args: { targetScene: "Overworld", targetTile: vec(5, 10) } }],
    },
    {
      id: "move_maps2",
      mapId: "Overworld",
      trigger: { time: "12:08" },
      loop: false,
      sequence: [{ type: "sceneSwitch", args: { targetScene: "PIOffice", targetTile: vec(5, 10) } }],
    },
    {
      id: "move_maps3",
      mapId: "PIOffice",
      trigger: { time: "12:11" },
      loop: false, // Prevents looping once the sequence reaches the end
      sequence: [{ type: "sceneSwitch", args: { targetScene: "Overworld", targetTile: vec(5, 10) } }],
    },

*/
