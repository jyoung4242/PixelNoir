import { Action, nextActionId, Vector, Animation, Actor, Scene, PositionNode, Graph } from "excalibur";
import { AnimationComponent } from "../Components/animation";
import { NPCActor } from "../Lib/NPCManager";

export class FollowPath implements Action {
  id = nextActionId();
  private _started = false;
  private _stopped = false;
  private _path: Vector[] = [];
  private _currentIndex = 0;
  private _currentAnimKey: string | null = null; // Cache active animation key

  /** Speed in pixels per second */
  public speed: number = 45;
  /** Tolerance threshold in pixels to consider a node reached */
  public arrivalThreshold: number = 2;

  currentTile: Vector = Vector.Zero;

  constructor(
    public actor: Actor,
    public scene: Scene,
    public ac: AnimationComponent<keyof Record<string, Animation>>,
    public targetTile: Vector | number,
  ) {}

  isComplete(): boolean {
    return this._stopped;
  }

  public stop(): void {
    this._stopped = true;
    this._started = false;
    this._currentAnimKey = null;
  }

  reset(): void {
    this._started = false;
    this._stopped = false;
    this._path = [];
    this._currentIndex = 0;
    this._currentAnimKey = null;
  }

  update(elapsed: number): void {
    if (this._stopped) return;

    if (!this._started) {
      this._started = true;
      this._buildPath();

      if (this._path.length === 0) {
        this.stop();
        return;
      }
    }

    this._stepMovement(elapsed);
  }

  private _buildPath(): void {
    const graph = (this.scene as any).graph;
    if (!graph || typeof graph.aStar !== "function") {
      console.warn("FollowPath: Target scene missing .graph with aStar method.");
      return;
    }

    let startTile = (this.actor as NPCActor).getCurrentTile();
    startTile.x = Math.floor(startTile.x);
    startTile.y = Math.floor(startTile.y);

    const targetTileVec =
      this.targetTile instanceof Vector
        ? this.targetTile
        : new Vector(Math.floor((this.targetTile as any).x ?? 0), Math.floor((this.targetTile as any).y ?? 0));

    const startNode = getNodeFromTile(startTile, graph);
    const endNode = getNodeFromTile(targetTileVec, graph);

    if (!startNode || !endNode) {
      console.warn("FollowPath: Could not resolve graph nodes for start or end tiles.");
      return;
    }

    const pathNodes = graph.aStar(startNode, endNode) ?? [];
    this._path = pathNodes.path.map((node: PositionNode<unknown>) => node.pos);
    this._currentIndex = 0;
  }

  private _stepMovement(elapsed: number): void {
    if (this._currentIndex >= this._path.length) {
      this.stop();
      return;
    }

    const targetPos = this._path[this._currentIndex];
    const vectorToTarget = targetPos.sub(this.actor.pos);
    const distance = vectorToTarget.size;

    if (distance <= this.arrivalThreshold) {
      this.actor.pos = targetPos;
      this._currentIndex++;
      return;
    }

    const direction = vectorToTarget.normalize();
    const moveDistance = Math.min((this.speed * elapsed) / 1000, distance);

    this.actor.pos = this.actor.pos.add(direction.scale(moveDistance));

    // Only update animation state when direction actually changes
    if (this.ac && distance > 0.01) {
      const animKey = `Walk${getAnimationKey(direction)}`;
      if (animKey !== this._currentAnimKey) {
        this._currentAnimKey = animKey;

        this.ac.set(animKey);
      }
    }
  }
}

function getAnimationKey(dir: Vector): string {
  if (Math.abs(dir.x) > Math.abs(dir.y)) {
    return dir.x > 0 ? "Right" : "Left";
  } else {
    return dir.y > 0 ? "Down" : "Up";
  }
}

function getNodeFromTile(targetTile: Vector, graph: Graph<unknown>): PositionNode<unknown> | null {
  let targetVec = targetTile.scale(16);
  targetVec.x = targetVec.x + 8;
  targetVec.y = targetVec.y + 8;

  for (const node of graph.nodes.values()) {
    const posNode = node as PositionNode<unknown>;
    if (posNode.pos && posNode.pos.x === targetVec.x && posNode.pos.y === targetVec.y) {
      return posNode;
    }
  }

  return null;
}
