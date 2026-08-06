import { Entity, Scene, SceneActivationContext, vec, Vector } from "excalibur";
import { Detective } from "../Actors/detective";
import { GameScenes, TransitionContext } from "../types";
import { AnimationComponent } from "../Components/animation";

const sceneLocationMap: Record<string, Record<string, Vector>> = {
  Overworld: {
    Bar: vec(23, 8),
    Warehouse: vec(29, 10),
    PIOffice: vec(5, 10),
    root: vec(7, 12),
  },
  Bar: {
    Overworld: vec(5, 9),
    root: vec(5, 9),
  },
  Warehouse: {
    Overworld: vec(5, 11),
    root: vec(5, 11),
  },
  PIOffice: {
    Overworld: vec(5, 9),
    root: vec(5, 9),
  },
};

export function isDetective(ent: Entity): ent is Detective {
  return ent instanceof Detective;
}

export function initPlayerInScene(scene: GameScenes, ctx: SceneActivationContext<TransitionContext>) {
  let { player, facing, leavingScene } = ctx.data as TransitionContext;

  if (ctx.data) {
    scene.player = player;
    scene.player.graphics.isVisible = true;
    scene.player.vel = Vector.Zero;
    scene.player.isMoving = false;

    scene.player.directionFacing = facing;
    scene.camera.strategy.lockToActor(scene.player);
    scene.camera.zoom = 3.5;
    scene.add(scene.player);
    let sceneName = scene.name;
    let staringPosLookup = sceneLocationMap[sceneName];
    let startingTile = staringPosLookup[leavingScene].clone();

    scene.player.pos = vec(startingTile.x * 16 + 8, startingTile.y * 16 + 8);
  }
}
