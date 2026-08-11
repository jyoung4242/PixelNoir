import { Action, nextActionId, Vector, Animation } from "excalibur";
import { AnimationComponent } from "../Components/animation";

export class Wait implements Action {
  id = nextActionId();
  private _currentTime = 0;
  private _started = false;
  private _stopped = false;

  constructor(
    public ac: AnimationComponent<keyof Record<string, Animation>>,
    public duration: number,
    public direction: Vector,
  ) {}

  isComplete(): boolean {
    return this._stopped || this._currentTime >= this.duration;
  }

  public stop(): void {
    this._stopped = true;
    this._started = false;
  }

  reset(): void {
    this._currentTime = 0;
    this._started = false;
    this._stopped = false;
  }

  update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._currentTime = 0;
      this.ac.set(`Idle${getAnimationKey(this.direction)}`);
      console.log("running wait");
    }

    this._currentTime += elapsed;
  }
}

function getAnimationKey(dir: Vector): string {
  switch (dir) {
    case Vector.Down:
      return "Down";
    case Vector.Up:
      return "Up";
    case Vector.Left:
      return "Left";
    case Vector.Right:
      return "Right";
    default:
      return "Down";
  }
}
