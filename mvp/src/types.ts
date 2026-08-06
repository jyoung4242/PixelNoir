import { Vector } from "excalibur";
import { Detective } from "./Actors/detective";
import { Bar } from "./Scenes/Bar";
import { OverWorld } from "./Scenes/Overworld";
import { Warehouse } from "./Scenes/Warehouse";
import { PIOffice } from "./Scenes/PIOffice";

export type GameScenes = Bar | OverWorld | Warehouse | PIOffice;
export type SceneNames = "root" | "Overworld" | "Bar" | "Warehouse" | "PIOffice";

export interface TransitionContext {
  player: Detective;
  facing: Vector;
  leavingScene: SceneNames;
}
