import { Engine, Entity, Scene, SceneActivationContext, System, Trigger, vec, Vector } from "excalibur";
import { StaticMap } from "../Actors/staticMap";
import { Resources } from "../resources";
import { Detective } from "../Actors/detective";
import { initPlayerInScene, isDetective } from "../Lib/utils";
import { TransitionContext } from "../types";
import { npcManager } from "../Lib/NPCManager";
import { overworldgraph } from "../Graphs/overworld";
import { CutsceneManifest, CutSceneSystem } from "../Lib/cutscenes/CutScenes";
import { LogAction } from "../Lib/cutscenes/actions/log";

export class OverWorld extends Scene<TransitionContext> {
  name = "Overworld";
  graph = overworldgraph;
  map: StaticMap | undefined = undefined;
  barTrigger: Trigger | undefined = undefined;
  warehouseTrigger: Trigger | undefined = undefined;
  PIofficeTrigger: Trigger | undefined = undefined;
  cutsceneTrigger: Trigger | undefined = undefined;

  cutSceneSystem: CutSceneSystem | undefined = undefined;

  player: Detective | undefined = undefined;

  constructor() {
    super();
  }

  onInitialize(engine: Engine) {
    let CSsystem = new CutSceneSystem(this.world);
    this.cutSceneSystem = CSsystem;
    this.world.add(CSsystem);
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
      pos: vec(23 * 16 + 8, 7 * 16 - 8),
      width: 16,
      height: 2,
      action: (en: Entity) => {
        if (isDetective(en)) {
          this.player!.graphics.isVisible = false;
          this.remove(this.player!);

          engine.goToScene("Bar", {
            sceneActivationData: {
              player: this.player,
              facing: Vector.Up,
              leavingScene: "Overworld",
            },
          });
        }
      },
    });
    this.add(this.barTrigger);

    this.warehouseTrigger = new Trigger({
      pos: vec(29 * 16 + 8, 8 * 16 + 8),
      width: 16,
      height: 2,
      action: (en: Entity) => {
        if (isDetective(en)) {
          this.player!.graphics.isVisible = false;
          this.remove(this.player!);

          engine.goToScene("Warehouse", {
            sceneActivationData: {
              player: this.player,
              facing: Vector.Up,
              leavingScene: "Overworld",
            },
          });
        }
      },
    });

    this.add(this.warehouseTrigger);

    this.PIofficeTrigger = new Trigger({
      pos: vec(5 * 16 + 8, 8 * 16 + 8),
      width: 16,
      height: 2,
      action: (ent: Entity) => {
        if (isDetective(ent)) {
          engine.goToScene("PIOffice", {
            sceneActivationData: {
              player: this.player,
              facing: Vector.Up,
              leavingScene: "Overworld",
            },
          });
        }
      },
    });
    this.add(this.PIofficeTrigger);

    this.cutsceneTrigger = new Trigger({
      pos: vec(9 * 16 + 8, 12 * 16 + 8),
      width: 16,
      height: 16,
      action: (ent: Entity) => {
        if (ent instanceof Detective) {
          console.log("triggered cutscene");
          this.cutSceneSystem?.startCutScene("test");
        }
      },
    });
    this.add(this.cutsceneTrigger);

    const testCutscene: CutsceneManifest = {
      id: "test",
      commands: [
        {
          type: "log",
          args: {
            message: "Starting introduction sequence...",
            level: "info",
          },
        },
        {
          type: "wait",
          args: {
            duration: 2500,
          },
        },
        {
          type: "log",
          args: {
            message: "Intro sequence complete.",
            level: "info",
          },
        },
      ],
    };
    this.cutSceneSystem.registerCutScene(testCutscene.id, testCutscene);
    this.cutSceneSystem.registerCommand("log", LogAction);
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
    if (!this.map || !this.barTrigger || !this.warehouseTrigger || !this.PIofficeTrigger) throw new Error("whoops");
    this.add(this.map);
    this.add(this.barTrigger);
    this.add(this.warehouseTrigger);
    this.add(this.PIofficeTrigger);
  }
}
