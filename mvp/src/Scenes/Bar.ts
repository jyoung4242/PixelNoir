import { Engine, Entity, Scene, SceneActivationContext, Trigger, vec, Vector } from "excalibur";
import { StaticMap } from "../Actors/staticMap";
import { Detective } from "../Actors/detective";
import { Resources } from "../resources";
import { initPlayerInScene, isDetective } from "../Lib/utils";
import { AnimationComponent } from "../Components/animation";
import { TransitionContext } from "../types";

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
    this.add(this.map);

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
    this.add(this.overworldTrigger);
  }

  onActivate(ctx: SceneActivationContext<TransitionContext>) {
    initPlayerInScene(this, ctx);

    // let { player, facing, leavingScene } = ctx.data as TransitionContext;

    // if (ctx.data) {
    //   this.player = player;
    //   this.player.graphics.isVisible = true;
    //   switch (leavingScene) {
    //     case "root":
    //     case "Overworld":
    //       this.player.pos = vec(5 * 16, 9 * 16);
    //       break;
    //     case "Bar":
    //     case "Warehouse":
    //     case "PIOffice":
    //     default:
    //       break;
    //   }

    //   this.player.vel = Vector.Zero;
    //   this.player.isMoving = false;
    //   let ac = this.player.get(AnimationComponent);
    //   // ac.set("IdleUp");
    //   this.player.directionFacing = facing;
    //   this.camera.strategy.lockToActor(this.player);
    //   this.camera.zoom = 3.5;
    //   this.add(this.player);
    // }
  }

  onDeactivate(_ctx: SceneActivationContext) {
    this.remove(this.player!);
    this.player = undefined;
  }
}
