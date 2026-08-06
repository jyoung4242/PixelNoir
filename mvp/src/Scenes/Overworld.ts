import { Engine, Entity, Scene, SceneActivationContext, Trigger, vec } from "excalibur";
import { StaticMap } from "../Actors/staticMap";
import { Resources } from "../resources";
import { Detective } from "../Actors/detective";

export class OverWorld extends Scene<Detective> {
  map: StaticMap | undefined = undefined;
  barTrigger: Trigger | undefined = undefined;
  warehouseTrigger: Trigger | undefined = undefined;
  PIofficeTrigger: Trigger | undefined = undefined;

  player: Detective | undefined = undefined;

  constructor() {
    super();
  }

  onInitialize(engine: Engine) {
    this.map = new StaticMap({
      width: 640,
      height: 320,
      walls: [
        { pos: vec(4, 8), dims: vec(1, 2) },
        { pos: vec(5, 7) },
        { pos: vec(25, 4) },
        { pos: vec(29, 7) },
        { pos: vec(23, 5) },
        { pos: vec(6, 8), dims: vec(7, 2) },
        { pos: vec(13, 8), dims: vec(2, 1) },
        { pos: vec(16, 9), dims: vec(2, 3) },
        { pos: vec(15, 6), dims: vec(8, 2) },
        { pos: vec(24, 5), dims: vec(1, 3) },
        { pos: vec(26, 5), dims: vec(2, 3) },
        { pos: vec(25, 9), dims: vec(2, 3) },
        { pos: vec(28, 8), dims: vec(1, 2) },
        { pos: vec(30, 8), dims: vec(4, 2) },
        { pos: vec(34, 10), dims: vec(1, 9) },
        { pos: vec(3, 10), dims: vec(1, 9) },
        { pos: vec(4, 19), dims: vec(30, 1) },
      ],
      upper: Resources.upper.toSprite(),
      lower: Resources.lower.toSprite(),
      zIndex: 0,
    });
    this.add(this.map);

    //add scene triggers
    this.barTrigger = new Trigger({
      pos: vec(23 * 16, 7 * 16),
      width: 16,
      height: 16,
      action: (en: Entity) => {
        if (isDetective(en)) {
          engine.goToScene("Bar", { sceneActivationData: this.player });
        }
      },
    });
    this.add(this.barTrigger);

    this.warehouseTrigger = new Trigger({
      pos: vec(29 * 16, 8 * 16),
      width: 16,
      height: 16,
      action: (ent: Entity) => {
        if (isDetective(ent)) {
          engine.goToScene("Warehouse", { sceneActivationData: this.player });
        }
      },
    });
    this.add(this.warehouseTrigger);

    this.PIofficeTrigger = new Trigger({
      pos: vec(5 * 16, 8 * 16),
      width: 16,
      height: 16,
      action: (ent: Entity) => {
        if (isDetective(ent)) {
          engine.goToScene("PIOffice", { sceneActivationData: this.map });
        }
      },
    });
    this.add(this.PIofficeTrigger);
  }

  onActivate(ctx: SceneActivationContext<Detective>) {
    if (ctx.data) {
      this.add(ctx.data);
      this.player = ctx.data;
    }
  }

  onDeactivate(ctx: SceneActivationContext) {}
}

function isDetective(ent: Entity): ent is Detective {
  return ent instanceof Detective;
}
