import { Engine, Entity, Scene, SceneActivationContext, Trigger, vec, Vector } from "excalibur";
import { Detective } from "../Actors/detective";
import { StaticMap } from "../Actors/staticMap";
import { isDetective, initPlayerInScene } from "../Lib/utils";
import { Resources } from "../resources";
import { TransitionContext } from "../types";

export class Warehouse extends Scene {
  name = "Warehouse";
  map: StaticMap | undefined = undefined;
  player: Detective | undefined = undefined;
  overworldTrigger: Trigger | undefined = undefined;
  constructor() {
    super();
  }

  onInitialize(engine: Engine) {
    this.map = new StaticMap({
      width: 176,
      height: 224,
      walls: [
        { pos: vec(5, 13) },
        { pos: vec(9, 10) },
        { pos: vec(1, 12), dims: vec(4, 1) },
        { pos: vec(0, 5), dims: vec(1, 7) },
        { pos: vec(6, 12), dims: vec(4, 1) },
        { pos: vec(10, 6), dims: vec(1, 7) },
        { pos: vec(1, 4), dims: vec(7, 1) },
        { pos: vec(8, 5), dims: vec(2, 1) },
        { pos: vec(1, 6), dims: vec(6, 2) },
        { pos: vec(1, 9), dims: vec(4, 2) },
      ],
      upper: Resources.warehouseUpper.toSprite(),
      lower: Resources.warehouseLower.toSprite(),
      zIndex: 0,
    });
    this.add(this.map);

    //add scene triggers
    this.overworldTrigger = new Trigger({
      pos: vec(5 * 16 + 8, 12 * 16 + 14),
      width: 16,
      height: 4,
      action: (en: Entity) => {
        if (isDetective(en)) {
          this.player!.graphics.isVisible = false;
          this.remove(this.player!);
          engine.goToScene("Overworld", {
            sceneActivationData: {
              player: this.player,
              facing: Vector.Down,
              leavingScene: "Warehouse",
            },
          });
        }
      },
    });
    this.add(this.overworldTrigger);
  }

  onActivate(ctx: SceneActivationContext<TransitionContext>) {
    initPlayerInScene(this, ctx);
  }

  onDeactivate(ctx: SceneActivationContext) {
    this.remove(this.player!);
    this.player = undefined;
  }
}
