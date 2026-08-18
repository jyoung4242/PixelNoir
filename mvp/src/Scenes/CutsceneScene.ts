import { Scene } from "excalibur";
import { CutSceneSystem } from "../Lib/cutscenes/CutScenes";
import { TransitionContext } from "../types";

export class CutsceneScene<TransitionContext> extends Scene<TransitionContext> {
  cutSceneSystem: CutSceneSystem | undefined = undefined;

  constructor() {
    super();
  }
}
