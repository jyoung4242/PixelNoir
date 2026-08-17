import { Actor, Animation, CollisionType, Engine, Scene, vec, Vector } from "excalibur";
import { ActionStep, NpcManifest } from "../types";
import { chefManifest } from "../Content/NPCs/chef";
import { ChefAnimations } from "../Animations/Chef";
import { AnimationComponent } from "../Components/animation";
import { ActionRegistry } from "../Actions/actionRegistry";
import { karenManifest } from "../Content/NPCs/Karen";
import { karenAnimations } from "../Animations/Karen";
import { CutSceneParticipantComponent } from "./cutscenes/CutScenes";

/**
 * This is for npc registration
 */
export interface NPCconfig {
  id: string;
  name: string;
  manifest: NpcManifest;
  animations: Record<string, Animation>;
}

/**
 * This is how the manager stores npc data
 */
export type NPCData = {
  id: string;
  name: string;
  isAlive: boolean;
  currentScene: string;
  manifest: NpcManifest;
  activeRoutineId: string | null;
  currentStepIndex: number;
  stepTimeElapsed: number;
  virtualTile: Vector;
  actorID?: number | null;
  animations: Record<string, Animation>;
};

/**
 * Calculates step durations for off-scene virtual time simulation
 */
export function getActionStepDuration(step: ActionStep, currentTile: Vector): number {
  switch (step.type) {
    case "wait":
      return step.args.duration ?? 0;
    case "moveActor": {
      const dist = step.args.numTiles * 16;
      const speed = step.args.speed || 80;
      return (dist / speed) * 1000; // Duration in ms
    }
    default:
      return 0; // Instantaneous actions (e.g. changeMap, playAnim)
  }
}

/**
 * NPCManager, helps scenes create their active Actors, helps them spawn actors when needed, and simulates
 * out of scene NPC's with the actions by duration, incase some enter the scene after the scene starts
 */
class NPCManager {
  npcs: Map<string, NPCData> = new Map();

  initialize() {}

  /** Initial loading of NPC manifests and default virtual state */
  registerNPC(config: NPCconfig): void {
    const defaultTile = vec(config.manifest.defaultTile.x, config.manifest.defaultTile.y);
    const data: NPCData = {
      id: config.id,
      name: config.name,
      isAlive: true,
      currentScene: config.manifest.defaultMap,
      manifest: config.manifest,
      animations: config.animations,
      activeRoutineId: null,
      currentStepIndex: 0,
      stepTimeElapsed: 0,
      virtualTile: defaultTile,
      actorID: null,
    };
    this.npcs.set(config.id, data);
  }

  /** Retrieves all NPCs that should be active when entering a scene */
  getSceneNPCs(sceneName: string): NPCActor[] {
    const activeActors: NPCActor[] = [];

    for (const npc of this.npcs.values()) {
      if (npc.isAlive && npc.currentScene === sceneName) {
        const actor = this.spawnNPCForScene(npc);
        activeActors.push(actor);
      }
    }

    return activeActors;
  }

  updateNPCs(deltaMs: number, gameTime: string, storyPoints: Set<string>, activeScene: Scene, activeSceneName: string): void {
    for (const [id, npc] of this.npcs.entries()) {
      this.evaluateRoutineTrigger(npc, gameTime, storyPoints);

      // NPC is off-scene (no active actorID)
      if (!npc.actorID && npc.isAlive) {
        this.simulateOffSceneNPC(npc, deltaMs);

        // SCENARIO 1: NPC routine transitioned into the player's current scene while off-screen
        if (npc.currentScene === activeSceneName) {
          const spawnedActor = this.spawnNPCForScene(npc);
          activeScene.add(spawnedActor); // Add directly to active engine scene
        }
      }
    }
  }

  /** Spawns and hydrates an NPCActor at its current virtual position */
  private spawnNPCForScene(npc: NPCData): NPCActor {
    const actor = new NPCActor(npc);
    npc.actorID = actor.id;
    return actor;
  }

  /** Despawns active actor references when unloading or switching scenes */
  despawnSceneNPCs(scene: Scene): void {
    for (const npc of this.npcs.values()) {
      if (npc.actorID) {
        let npcActor = this.getActorByID(scene, npc.actorID);
        if (npcActor) npcActor.kill(); // Remove from Excalibur scene graph
        npc.actorID = null;
      }
    }
  }

  getActorByID(scene: Scene, id: number): NPCActor | null {
    const actors = scene.actors.filter(a => a instanceof NPCActor);
    const foundActor = actors.find(actor => actor.id === id);
    if (foundActor) return foundActor;
    return null;
  }

  // Finds the latest routine that should have already started today
  private evaluateRoutineTrigger(npc: NPCData, gameTime: string, storyPoints: Set<string>): void {
    const matchingRoutines = npc.manifest.routines.filter(routine => {
      // 1. Time check: Has this routine time passed today? (e.g. "12:00" >= "07:00")
      if (routine.trigger.time > gameTime) return false;

      // 2. Story points check
      if (routine.trigger.storyPoints) {
        const hasAllPoints = routine.trigger.storyPoints.every(sp => storyPoints.has(sp));
        if (!hasAllPoints) return false;
      }

      return true;
    });

    let targetRoutineId: string | null = null;
    let targetMap: string = npc.manifest.defaultMap;

    if (matchingRoutines.length > 0) {
      // Pick the most recent routine (e.g. "07:00" if time is now "12:00")
      matchingRoutines.sort((a, b) => b.trigger.time.localeCompare(a.trigger.time));
      targetRoutineId = matchingRoutines[0].id;
      targetMap = matchingRoutines[0].mapId ?? npc.manifest.defaultMap;
    }

    // Reset step progression if changing active routines
    if (npc.activeRoutineId !== targetRoutineId) {
      npc.activeRoutineId = targetRoutineId;
      npc.currentScene = targetMap;
      npc.currentStepIndex = 0;
      npc.stepTimeElapsed = 0;
    }
  }

  // NPCManager.ts -> simulateOffSceneNPC
  private simulateOffSceneNPC(npc: NPCData, deltaMs: number): void {
    if (!npc.activeRoutineId) return;

    const routine = npc.manifest.routines.find(r => r.id === npc.activeRoutineId);
    if (!routine || routine.sequence.length === 0) return;

    // Stop simulating if a non-looping routine has reached its end
    const isLooping = routine.loop ?? true; // Default to looping if omitted
    if (!isLooping && npc.currentStepIndex >= routine.sequence.length) {
      return;
    }

    npc.stepTimeElapsed += deltaMs;

    while (npc.currentStepIndex < routine.sequence.length) {
      const currentStep = routine.sequence[npc.currentStepIndex];
      const stepDuration = getActionStepDuration(currentStep, npc.virtualTile);

      if (npc.stepTimeElapsed >= stepDuration) {
        npc.stepTimeElapsed -= stepDuration;
        this.applyStepVirtualEffects(npc, currentStep);

        npc.currentStepIndex++;

        // Handle sequence boundary based on loop setting
        if (npc.currentStepIndex >= routine.sequence.length) {
          if (isLooping) {
            npc.currentStepIndex = 0;
          } else {
            // Clamp index to end of array to stop processing further steps
            npc.currentStepIndex = routine.sequence.length;
            break;
          }
        }

        if (stepDuration === 0 && npc.stepTimeElapsed <= 0) {
          break;
        }
      } else {
        break;
      }
    }
  }

  /** Updates internal state (tile position, scene map) when virtual steps complete */
  /** Updates internal state (tile position, scene map) when virtual steps complete */
  private applyStepVirtualEffects(npc: NPCData, step: ActionStep): void {
    const actionDef = ActionRegistry[step.type];

    if (actionDef?.virtualEffect) {
      actionDef.virtualEffect(npc, step.args);
    }
  }
}

/**
 * Standard actor for NPCs, will have animations, be interactable, runs off their own manifest schedule, and
 * will be controllable by cutscene system
 */
export class NPCActor extends Actor {
  public readonly npcId: string;
  private currentStepIndex: number = -1;
  public currentScene = "root";
  public interactionZone: Actor;
  cutsceneComponent: CutSceneParticipantComponent;
  private wasInCutscene: boolean = false; // Track previous frame cutscene state

  constructor(data: NPCData) {
    super({
      width: 16,
      height: 16,
      anchor: Vector.Half,
      name: data.manifest.name,
      z: 5,
      pos: vec(data.virtualTile.x * 16 + 8, data.virtualTile.y * 16 + 8),
    });

    this.graphics.offset = vec(0, -6);
    this.npcId = data.id;
    this.currentScene = data.currentScene;
    this.addComponent(new AnimationComponent(data.animations));
    this.get(AnimationComponent).set("IdleDown");

    this.cutsceneComponent = new CutSceneParticipantComponent({ id: data.name });
    this.addComponent(this.cutsceneComponent);

    // Initialize Interaction Zone Child Actor
    this.interactionZone = new Actor({
      name: `${data.manifest.name}_InteractionZone`,
      radius: 16,
      anchor: Vector.Half,
      collisionType: CollisionType.Passive,
    });

    // Optional event listeners for player detection
    this.interactionZone.on("collisionstart", evt => {
      if (evt.other.owner!.name === "Player") {
        // Trigger interaction prompt or cutscene logic
      }
    });

    this.interactionZone.on("collisionend", evt => {
      if (evt.other.owner!.name === "Player") {
        // Hide prompt or clear interaction availability
      }
    });

    // Attach child actor to the parent NPCActor
    this.addChild(this.interactionZone);
  }

  getCurrentTile(): Vector {
    let temp = this.pos.sub(vec(8, 8));
    let tile = this.pos.scale(vec(1 / 16, 1 / 16));
    return tile;
  }

  public onPreUpdate(engine: Engine, delta: number): void {
    const isCutsceneActive = this.cutsceneComponent?.isPlaying ?? false;

    // 1. Currently in a cutscene -> pause routine execution
    if (isCutsceneActive) {
      this.wasInCutscene = true;
      return;
    }

    if (this.wasInCutscene) {
      this.wasInCutscene = false;
      this.currentStepIndex = -1; // Force index inequality check below
    }

    const data = npcManager.npcs.get(this.npcId);
    if (!data || !data.activeRoutineId) return;

    if (this.currentStepIndex !== data.currentStepIndex) {
      this.currentStepIndex = data.currentStepIndex;

      const routine = data.manifest.routines.find(r => r.id === data.activeRoutineId);
      if (routine && routine.sequence[this.currentStepIndex]) {
        this.executeActionStep(routine.sequence[this.currentStepIndex]);
      }
    }
  }

  private executeActionStep(step: ActionStep): void {
    this.actions.clearActions();

    const actionDef = ActionRegistry[step.type];
    if (actionDef?.execute) {
      actionDef.execute(this, step.args, () => this.advanceToNextStep());
    } else {
      console.warn(`Unrecognized action type '${step.type}' in manifest.`);
      this.advanceToNextStep();
    }
  }

  private advanceToNextStep(): void {
    const data = npcManager.npcs.get(this.npcId);
    if (!data || !data.activeRoutineId) return;

    const routine = data.manifest.routines.find(r => r.id === data.activeRoutineId);
    if (!routine) return;

    const isLooping = routine.loop ?? true;

    if (data.currentStepIndex < routine.sequence.length) {
      data.currentStepIndex++;
      data.stepTimeElapsed = 0;
    }

    if (data.currentStepIndex >= routine.sequence.length) {
      if (isLooping) {
        data.currentStepIndex = 0;
      } else {
        data.currentStepIndex = routine.sequence.length;
      }
    }
  }
}

/**
 * Call this in main.ts, to execute all NPC setups and registrations
 */
export function InitializeGameNPCs() {
  npcManager.registerNPC({
    id: generateNpcGuid(),
    name: "Chef Pierre",
    manifest: chefManifest,
    animations: ChefAnimations,
  });

  npcManager.registerNPC({
    id: generateNpcGuid(),
    name: "Karen",
    manifest: karenManifest,
    animations: karenAnimations,
  });
}

/**
 * main export
 */
export const npcManager = new NPCManager();

/**
 * Helper utility to generate unique NPC domain identifiers.
 */
export function generateNpcGuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "npc-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}
