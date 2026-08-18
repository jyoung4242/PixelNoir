import { Engine, Entity, Scene, SceneActivationContext, Trigger, vec, Vector } from "excalibur";
import { Detective } from "../Actors/detective";
import { StaticMap } from "../Actors/staticMap";
import { initPlayerInScene, isDetective } from "../Lib/utils";
import { Resources } from "../resources";
import { TransitionContext } from "../types";
import { clockManager } from "../main";
import { ClockUI } from "../UI/ClockUI";
import { npcManager } from "../Lib/NPCManager";
import { piOfficegraph } from "../Graphs/PIOffice";
import { CutSceneSystem } from "../Lib/cutscenes/CutScenes";

export class PIOffice extends Scene<TransitionContext> {
  name = "PIOffice";
  graph = piOfficegraph;
  map: StaticMap | undefined = undefined;
  player: Detective | undefined = undefined;
  overworldTrigger: Trigger | undefined = undefined;
  constructor() {
    super();
  }

  onInitialize(engine: Engine) {
    let CSsystem = new CutSceneSystem(this.world);
    this.world.add(CSsystem);
    this.map = new StaticMap({
      width: 192,
      height: 192,
      walls: [
        { pos: vec(5, 11) },
        { pos: vec(5, 3) },
        { pos: vec(7, 2) },
        { pos: vec(1, 10), dims: vec(4, 1) },
        { pos: vec(6, 10), dims: vec(5, 1) },
        { pos: vec(11, 4), dims: vec(1, 6) },
        { pos: vec(0, 4), dims: vec(1, 6) },
        { pos: vec(1, 3), dims: vec(2, 1) },
        { pos: vec(3, 4), dims: vec(2, 1) },
        { pos: vec(4, 6), dims: vec(2, 1) },
        { pos: vec(6, 3), dims: vec(1, 2) },
        { pos: vec(8, 3), dims: vec(1, 2) },
        { pos: vec(9, 3), dims: vec(2, 1) },
      ],
      upper: Resources.PIofficeUpper.toSprite(),
      lower: Resources.PIofficeLower.toSprite(),
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
              leavingScene: "PIOffice",
            },
          });
        }
      },
    });
    this.add(this.overworldTrigger);
    //UI clock
    this.add(new ClockUI());
  }

  onActivate(ctx: SceneActivationContext<TransitionContext>) {
    initPlayerInScene(this, ctx);
    let npcsToLoad = npcManager.getSceneNPCs(this.name);
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
