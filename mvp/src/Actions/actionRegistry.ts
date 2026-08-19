import { Actor, vec, Vector } from "excalibur";
import { MoveActor } from "./MoveActor";
import { AnimationComponent } from "../Components/animation";
import { Wait } from "./Wait";
import { NPCData, NPCActor } from "../Lib/NPCManager";
import { SwitchScene } from "./SwitchScene";
import { FollowPath } from "./FollowPath";
import { DialogLoader } from "../Lib/dialog/DialogLoader";
import { DialogRunner } from "../Lib/dialog/DialogRunner";
import { DialogUI } from "../UI/DialogUI";
import { CutsceneScene } from "../Scenes/CutsceneScene";
import { game } from "../main";

export type ActionCommandHandler = (actor: Actor, args: Record<string, any>, onComplete: () => void) => void;

export type VirtualEffectHandler = (npc: NPCData, args: Record<string, any>) => void;

export interface ActionDefinition {
  execute: ActionCommandHandler;
  virtualEffect?: VirtualEffectHandler;
}

export const ActionRegistry: Record<string, ActionDefinition> = {
  moveActor: {
    execute: (actor, args, onComplete) => {
      const numTiles = args.numTiles ?? 1;
      const direction = args.dir ?? Vector.Down;
      const speed = args.speed ?? 45;

      actor.actions.runAction(new MoveActor(actor, numTiles, direction, speed)).callMethod(onComplete);
    },
    virtualEffect: (npc, args) => {
      if (args.x !== undefined && args.y !== undefined) {
        npc.virtualTile = vec(args.x, args.y);
      }
    },
  },

  wait: {
    execute: (actor, args, onComplete) => {
      const duration = args.duration ?? 1000;
      const dir = args.dir ?? Vector.Down;
      const anim = actor.get(AnimationComponent);

      actor.actions.runAction(new Wait(anim, duration, dir)).callMethod(onComplete);
    },
    // No virtual effect required for waiting
  },

  sceneSwitch: {
    execute: (actor, args, onComplete) => {
      const targetScene = args.targetScene ?? args.mapId;
      const targetTile = args.targetTile ?? vec(args.x ?? 0, args.y ?? 0);

      if (actor instanceof NPCActor) {
        actor.actions.runAction(new SwitchScene(actor, targetScene, targetTile)).callMethod(onComplete);
      } else {
        onComplete();
      }
    },
    virtualEffect: (npc, args) => {
      const mapId = args.targetScene ?? args.mapId;
      if (mapId) {
        npc.currentScene = mapId;
      }
      if (args.targetTile) {
        npc.virtualTile = args.targetTile;
      } else if (args.x !== undefined && args.y !== undefined) {
        npc.virtualTile = vec(args.x, args.y);
      }
    },
  },
  followPath: {
    execute: (actor, args, onComplete) => {
      const scene = actor.scene;
      const animComponent = actor.get(AnimationComponent);
      const targetTile = args.targetTile ?? vec(args.x ?? 0, args.y ?? 0);

      if (!scene || !animComponent) {
        onComplete();
        return;
      }

      const action = new FollowPath(actor, scene, animComponent, targetTile);
      actor.actions.runAction(action).callMethod(onComplete);
    },
    virtualEffect: (npc, args) => {
      if (args.targetTile) {
        npc.virtualTile = args.targetTile;
      } else if (args.x !== undefined && args.y !== undefined) {
        npc.virtualTile = vec(args.x, args.y);
      }
    },
  },
  dialog: {
    execute: (_actor, args, _onComplete) => {
      debugger;
      const { path }: { path: string; scene: CutsceneScene<any> } = args as { path: string; scene: CutsceneScene<any> };
      const dialogUI = new DialogUI();
      game.currentScene.add(dialogUI);
      const dialogRunner = new DialogRunner(dialogUI, new DialogLoader(path));
      void dialogRunner.start();
      dialogUI.show();
    },
  },
};
