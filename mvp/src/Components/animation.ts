import { Component, Entity, GraphicsComponent, Animation, Color } from "excalibur";

export class AnimationComponent<Keys extends string> extends Component {
  declare owner: Entity & { graphics: GraphicsComponent };
  type = "animation";

  private _currentAnimationName: Keys | null = null;
  private _animations: Record<Keys, Animation>;
  private _speed = 1;

  constructor(animations: Record<Keys, Animation>) {
    super();
    this._animations = animations;
  }

  set(name: Keys, startFromFrame: number = 0, durationLeft?: number) {
    // 1. Guard check BEFORE updating internal state
    if (this.is(name)) return;
    const anim = this._animations[name];
    if (!anim) return;

    const prevAnim = this.owner.graphics.current;

    // 2. Update state tracker
    this._currentAnimationName = name;

    if (startFromFrame) {
      anim.goToFrame(startFromFrame, durationLeft);
    } else {
      anim.reset();
    }

    // Carry over scale and opacity from previous graphic
    if (prevAnim) {
      anim.scale.setTo(prevAnim.scale.x, prevAnim.scale.y);
      anim.opacity = prevAnim.opacity;
    }

    this.owner.graphics.use(anim);
  }

  reset() {
    if (!this._currentAnimationName) return;
    const anim = this._animations[this._currentAnimationName];
    anim.goToFrame(0);
    anim.reset();
  }

  tint(color: Color | null) {
    if (!this.current) return;
    this.current.tint = color ?? Color.White;
  }

  get(name: Keys) {
    return this._animations[name];
  }

  get currentName(): Keys | null {
    return this._currentAnimationName;
  }

  get current() {
    return this.owner.graphics.current;
  }

  get currentFrame() {
    if (!this._currentAnimationName) return -1;
    const anim = this._animations[this._currentAnimationName];
    return anim.currentFrameIndex;
  }

  is(animation: Keys): boolean {
    return this._currentAnimationName === animation;
  }

  set speed(speed: number) {
    this._speed = speed;
    // Apply speed to all animations or active animation if needed
    if (this._currentAnimationName) {
      this._animations[this._currentAnimationName].speed = speed;
    }
  }

  get speed() {
    return this._speed;
  }
}
