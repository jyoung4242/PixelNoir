import { Engine, Entity, Scene, SceneActivationContext, Trigger, vec, Vector } from "excalibur";
import { StaticMap } from "../Actors/staticMap";
import { Detective } from "../Actors/detective";
import { Resources } from "../resources";
import { initPlayerInScene, isDetective } from "../Lib/utils";
import { AnimationComponent } from "../Components/animation";
import { TransitionContext } from "../types";
import { npcManager } from "../Lib/NPCManager";

export class Bar extends Scene<TransitionContext> {
  name = "Bar";
  map: StaticMap | undefined = undefined;
  player: Detective | undefined = undefined;
  overworldTrigger: Trigger | undefined = undefined;
  constructor() {
    super();
  }

  onInitialize(engine: Engine) {
    console.log("init bar");

    this.map = new StaticMap({
      width: 224,
      height: 192,
      walls: [
        { pos: vec(6, 7), dims: vec(7, 1) },
        { pos: vec(12, 8), dims: vec(1, 2) },
        { pos: vec(1, 9), dims: vec(2, 1) },
        { pos: vec(3, 10), dims: vec(2, 1) },
        { pos: vec(5, 11) },
        { pos: vec(4, 3) },
        { pos: vec(13, 6) },
        { pos: vec(0, 8) },
        { pos: vec(6, 10), dims: vec(6, 1) },
        { pos: vec(11, 5), dims: vec(2, 1) },
        { pos: vec(5, 4), dims: vec(6, 1) },
        { pos: vec(2, 4), dims: vec(2, 1) },
        { pos: vec(1, 5), dims: vec(1, 3) },
      ],
      upper: Resources.barUpper.toSprite(),
      lower: Resources.barLower.toSprite(),
      zIndex: 0,
    });

    //add scene triggers
    this.overworldTrigger = new Trigger({
      pos: vec(5 * 16 + 8, 10 * 16 + 14),
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
              leavingScene: "Bar",
            },
          });
        }
      },
    });
  }

  onActivate(ctx: SceneActivationContext<TransitionContext>) {
    initPlayerInScene(this, ctx);
    let npcsToLoad = npcManager.getSceneNPCs(this.name);
    console.log(npcsToLoad);
    npcsToLoad.forEach(n => this.add(n));
    this.addAllActorsBack();
  }

  onDeactivate(ctx: SceneActivationContext) {
    this.remove(this.player!);
    this.player = undefined;
    this.clear();
  }

  addAllActorsBack() {
    if (!this.map || !this.overworldTrigger) throw new Error("whoops");
    this.add(this.map);
    this.add(this.overworldTrigger);
  }
}
