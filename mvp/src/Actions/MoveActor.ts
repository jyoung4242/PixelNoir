import { Action, Actor, CollisionType, nextActionId, Ray, Trigger, Vector } from "excalibur";
import { AnimationComponent } from "../Components/animation";

export class MoveActor implements Action {
  id = nextActionId();
  private _started = false;
  private _stopped = false;

  private _tileSize = 16;
  private _tilesRemaining: number;
  private _targetPos: Vector | null = null;

  constructor(
    public actor: Actor,
    public numTiles: number,
    public direction: Vector,
    public speed: number = 45, // Matches Detective speed
  ) {
    this._tilesRemaining = numTiles;
  }

  isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    this._stopped = true;
    this._started = false;
  }

  reset(): void {
    this._started = false;
    this._stopped = false;
    this._tilesRemaining = this.numTiles;
    this._targetPos = null;
  }

  update(elapsed: number): void {
    if (this._stopped) return;

    const deltaSeconds = elapsed / 1000;
    const ac = this.actor.get(AnimationComponent);

    // Initial setup on start
    if (!this._started) {
      if (this.numTiles <= 0) {
        this.finish(ac);
        return;
      }

      // Check if blocked before taking the first tile step
      if (this.isTileBlocked(this.direction)) {
        if (ac) ac.set(`Idle${getAnimationKey(this.direction)}`);
        return; // Stay in update loop; retry next frame until unblocked
      }

      this._started = true;
      if (ac) ac.set(`Walk${getAnimationKey(this.direction)}`);
      this._targetPos = this.actor.pos.add(this.direction.scale(this._tileSize));
    }

    // Process movement along tile step
    if (this._targetPos) {
      const step = this.direction.scale(this.speed * deltaSeconds);
      const distanceToTarget = this._targetPos.sub(this.actor.pos);

      if (step.magnitude >= distanceToTarget.magnitude) {
        // Lock cleanly to target tile position
        this.actor.pos = this._targetPos;
        this._tilesRemaining--;

        if (this._tilesRemaining > 0) {
          // Check if the next tile ahead is blocked BEFORE setting new target
          if (this.isTileBlocked(this.direction)) {
            if (ac) ac.set(`Idle${getAnimationKey(this.direction)}`);
            this._targetPos = null; // Pause step progression at grid boundary until path clears
            return;
          }

          // Advance to next tile step
          if (ac) ac.set(`Walk${getAnimationKey(this.direction)}`);
          this._targetPos = this.actor.pos.add(this.direction.scale(this._tileSize));
        } else {
          // Finished all requested tile steps
          this.finish(ac);
        }
      } else {
        // Smoothly interpolate to targetPos without running mid-transit raycasts
        if (ac) ac.set(`Walk${getAnimationKey(this.direction)}`);
        this.actor.pos = this.actor.pos.add(step);
      }
    } else {
      // Waiting state at tile boundary: retry path probe
      if (!this.isTileBlocked(this.direction)) {
        if (ac) ac.set(`Walk${getAnimationKey(this.direction)}`);
        this._targetPos = this.actor.pos.add(this.direction.scale(this._tileSize));
      }
    }
  }

  private isTileBlocked(dir: Vector): boolean {
    const engine = this.actor.scene?.engine;
    if (!engine) return false;

    // Cast a ray 16 pixels ahead using Detective's raycast configuration
    const ray = new Ray(this.actor.pos, dir);
    const hits = engine.currentScene.physics.rayCast(ray, {
      maxDistance: this._tileSize,
      searchAllColliders: true,
    });

    // Ignore self, triggers, non-colliding entities, and interaction zones
    return hits.some(hit => {
      const owner = hit.collider.owner;
      const isSelf = owner === this.actor;
      const isInteraction = owner?.hasTag("interaction");
      const isTrigger = owner instanceof Trigger || hit.body.collisionType === CollisionType.PreventCollision;

      return !isSelf && !isTrigger && !isInteraction;
    });
  }

  private finish(ac?: AnimationComponent<any>): void {
    if (ac) {
      ac.set(`Idle${getAnimationKey(this.direction)}`);
    }
    this._stopped = true;
  }
}

function getAnimationKey(dir: Vector): string {
  if (dir.equals(Vector.Up)) return "Up";
  if (dir.equals(Vector.Down)) return "Down";
  if (dir.equals(Vector.Left)) return "Left";
  if (dir.equals(Vector.Right)) return "Right";
  return "Down";
}
