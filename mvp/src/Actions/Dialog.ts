import { Action, Actor, Entity, nextActionId, Scene } from "excalibur";
import { DialogUI } from "../UI/DialogUI";
import { DialogRunner } from "../Lib/dialog/DialogRunner";
import { DialogLoader } from "../Lib/dialog/DialogLoader";

export class DialogAction implements Action {
  id = nextActionId();
  private _started = false;
  private _isFinished = false;
  private _stopped = false;
  private dialogUI: DialogUI | null = null;
  private scene: Scene | null = null;

  runner: DialogRunner | null = null;
  loader: DialogLoader | null = null;

  constructor(
    private actor: Entity,
    private path: string,
  ) {}

  public update(_elapsed: number): void {
    if (!this._started) {
      this.scene = this.actor.scene;
      this._started = true;
      this.dialogUI = new DialogUI();
      this.loader = new DialogLoader(this.path);
      this.runner = new DialogRunner(this.dialogUI, this.loader);
      this.scene?.add(this.dialogUI);
      void this.runner.start();
    }

    if (this.runner?.isConversationFinished()) {
      this._stopped = true;
      this._isFinished = true;
    }
  }

  public isComplete(): boolean {
    return this._isFinished || this._stopped;
  }

  public stop(): void {
    if (this._stopped) return;
    this._stopped = true;
    this.cleanup();
  }

  public reset(): void {
    this._started = false;
    this._isFinished = false;
    this._stopped = false;
    this.dialogUI = null;
  }

  private cleanup(): void {
    if (this.dialogUI && !this.dialogUI.isKilled()) {
      this.dialogUI.kill();
    }
  }
}
