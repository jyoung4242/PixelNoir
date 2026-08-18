import { Action, nextActionId, Vector, Scene } from "excalibur";
import { npcManager, NPCActor } from "../Lib/NPCManager";

export class SwitchScene implements Action {
  id = nextActionId();
  private _started = false;
  private _stopped = false;

  constructor(
    public actor: NPCActor,
    public targetSceneName: string,
    public targetTile: Vector,
  ) {}

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
  }

  update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      console.log("switching scenes!");

      const npcData = npcManager.npcs.get(this.actor.npcId);
      if (npcData) {
        const currentEngineScene = this.actor.scene;
        const activeSceneName = currentEngineScene?.engine?.currentSceneName;

        // Scenario 2: NPC leaves the scene the player is currently in
        if (activeSceneName !== this.targetSceneName) {
          npcData.currentScene = this.targetSceneName;
          npcData.actorID = null;

          // Remove actor from active Excalibur scene graph
          this.actor.kill();
        }
        // Scenario 1: NPC transitions into another location in the same active scene
        else {
          npcData.currentScene = this.targetSceneName;
          this.actor.pos.x = this.targetTile.x * 16 + 8;
          this.actor.pos.y = this.targetTile.y * 16 + 8;
        }
      }

      this.stop();
    }
  }
}
