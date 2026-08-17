import { Actor, CollisionType, Engine, Ray, Trigger, vec, Vector } from "excalibur";
import { DetectiveAnimations } from "../Animations/Detective";
import { AnimationComponent } from "../Components/animation";
import { GlobalEvents } from "../Lib/GlobalEvents";
import { CutSceneParticipantComponent } from "../Lib/cutscenes/CutScenes";

export class Detective extends Actor {
  tileSize: number = 16;
  speed: number = 45;
  isMoving: boolean = false;
  directionFacing: Vector = Vector.Down;
  currentDirection: Vector = Vector.Zero;
  targetPos: Vector | null = null;
  // Cutscene tracking component reference
  public cutsceneComponent: CutSceneParticipantComponent;

  constructor(tilpos: Vector) {
    super({
      pos: vec(tilpos.x * 16, tilpos.y * 16),
      width: 16,
      height: 16,
      anchor: Vector.Half, // Center anchor aligns cleanly with 16x16 grid math
      z: 1,
      collisionType: CollisionType.Active,
    });
    this.graphics.offset = vec(0, -6); // Reset graphics offset to align with anchor
    // Initialize Cutscene Participant Component with identifier
    this.cutsceneComponent = new CutSceneParticipantComponent({ id: "Detective" });
    this.addComponent(this.cutsceneComponent);
  }

  onInitialize(engine: Engine) {
    this.addComponent(new AnimationComponent(DetectiveAnimations));
    this.get(AnimationComponent).set("IdleDown");
    engine.currentScene.camera.strategy.lockToActor(this);
    engine.currentScene.camera.zoom = 3.5;

    // Snap starting position directly to the center of the current 16x16 tile
    this.pos = vec(
      Math.floor(this.pos.x / this.tileSize) * this.tileSize + this.tileSize / 2,
      Math.floor(this.pos.y / this.tileSize) * this.tileSize + this.tileSize / 2,
    );

    GlobalEvents.on("player-move", data => {
      this.currentDirection = data;
    });
  }

  onAdd(engine: Engine): void {
    let ac = this.get(AnimationComponent);
    if (ac) {
      let dir = "";
      if (this.directionFacing.equals(Vector.Down)) dir = "Down";
      else if (this.directionFacing.equals(Vector.Up)) dir = "Up";
      else if (this.directionFacing.equals(Vector.Left)) dir = "Left";
      else if (this.directionFacing.equals(Vector.Right)) dir = "Right";
      else dir = "Down";
      let animstring = `Idle${dir}`;
      ac.set(animstring);
    }
  }

  // onPreUpdate(engine: Engine, delta: number) {
  //   // ------------------------------------------------------------------------
  //   // Cutscene Guard: Disable player inputs & movement during cutscenes
  //   // ------------------------------------------------------------------------
  //   if (this.cutsceneComponent?.isPlaying) {
  //     // If mid-tile step when cutscene starts, snap to completed position
  //     if (this.isMoving && this.targetPos) {
  //       this.pos = this.targetPos;
  //       this.isMoving = false;
  //       this.targetPos = null;
  //     }

  //     // Force idle animation based on last facing direction
  //     this.setAnimationBasedOnDirection(Vector.Zero);
  //     return;
  //   }
  //   const deltaSeconds = delta / 1000;

  //   // Attempt next grid step if stationary

  //   if (!this.isMoving && !this.currentDirection.equals(Vector.Zero)) {
  //     this.tryMove(engine, this.currentDirection);
  //   }

  //   // Process movement along the step
  //   if (this.isMoving && this.targetPos) {
  //     const step = this.directionFacing.scale(this.speed * deltaSeconds);
  //     const distanceToTarget = this.targetPos.sub(this.pos);

  //     if (step.magnitude >= distanceToTarget.magnitude) {
  //       this.pos = this.targetPos; // Lock cleanly to target tile center

  //       // Chain immediately into the next tile step if directional key is still held
  //       if (!this.currentDirection.equals(Vector.Zero)) {
  //         this.tryMove(engine, this.currentDirection);
  //       } else {
  //         this.isMoving = false;
  //         this.targetPos = null;
  //         this.setAnimationBasedOnDirection(Vector.Zero);
  //       }
  //     } else {
  //       this.pos = this.pos.add(step);
  //     }
  //   }
  // }
  onPreUpdate(engine: Engine, delta: number) {
    const deltaSeconds = delta / 1000;
    const inCutscene = this.cutsceneComponent?.isPlaying ?? false;

    // 1. If currently mid-step, finish moving to targetPos first
    if (this.isMoving && this.targetPos) {
      const step = this.directionFacing.scale(this.speed * deltaSeconds);
      const distanceToTarget = this.targetPos.sub(this.pos);

      if (step.magnitude >= distanceToTarget.magnitude) {
        this.pos = this.targetPos; // Clean grid alignment lock

        // Stop moving if cutscene is active OR player released controls
        if (inCutscene || this.currentDirection.equals(Vector.Zero)) {
          this.isMoving = false;
          this.targetPos = null;
          this.setAnimationBasedOnDirection(Vector.Zero);
        } else {
          // Chain into next tile step only if input is held and NO cutscene is active
          this.tryMove(engine, this.currentDirection);
        }
      } else {
        this.pos = this.pos.add(step);
      }

      // Keep updating until targetPos is reached
      return;
    }

    // 2. Block starting new player-driven tile steps during cutscenes
    if (inCutscene) {
      this.setAnimationBasedOnDirection(Vector.Zero);
      return;
    }

    // 3. Normal stationary input check
    if (!this.currentDirection.equals(Vector.Zero)) {
      this.tryMove(engine, this.currentDirection);
    }
  }

  private tryMove(engine: Engine, dir: Vector) {
    this.directionFacing = dir;
    // Check if Wall colliders occupy the target step destination
    if (this.isTileBlocked(engine, dir)) {
      this.isMoving = false;
      this.targetPos = null;
      this.setAnimationBasedOnDirection(Vector.Zero);
      return;
    }

    this.isMoving = true;
    this.targetPos = this.pos.add(dir.scale(this.tileSize));
    this.setAnimationBasedOnDirection(dir);
  }

  private isTileBlocked(engine: Engine, dir: Vector): boolean {
    // Cast a ray 16 pixels ahead to detect colliders
    const ray = new Ray(this.pos, dir);
    const hits = engine.currentScene.physics.rayCast(ray, {
      maxDistance: this.tileSize,
      searchAllColliders: true,
    });

    // Ignore hits originating from this actor, Triggers, and non-colliding entities
    return hits.some(hit => {
      const owner = hit.collider.owner;

      const isSelf = owner === this;
      const isTrigger = owner instanceof Trigger || hit.body.collisionType === CollisionType.PreventCollision;

      return !isSelf && !isTrigger;
    });
  }

  setAnimationBasedOnDirection(dir: Vector) {
    if (this.isMoving) {
      if (dir.x > 0) this.get(AnimationComponent).set("WalkRight");
      else if (dir.x < 0) this.get(AnimationComponent).set("WalkLeft");
      else if (dir.y > 0) this.get(AnimationComponent).set("WalkDown");
      else if (dir.y < 0) this.get(AnimationComponent).set("WalkUp");
    } else {
      if (this.directionFacing.equals(Vector.Right)) this.get(AnimationComponent).set("IdleRight");
      else if (this.directionFacing.equals(Vector.Left)) this.get(AnimationComponent).set("IdleLeft");
      else if (this.directionFacing.equals(Vector.Down)) this.get(AnimationComponent).set("IdleDown");
      else if (this.directionFacing.equals(Vector.Up)) this.get(AnimationComponent).set("IdleUp");
    }
  }
}
