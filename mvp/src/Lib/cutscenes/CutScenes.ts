import {
  System,
  SystemType,
  Entity,
  Query,
  World,
  Component,
  Engine,
  ActionsComponent,
  ActionSequence,
  Camera,
  ActionContext,
  Actor,
  ParallelActions,
  Blink,
} from "excalibur";

// ==========================================
// 1. Types & Manifest Interfaces
// ==========================================

export interface CutsceneCommand {
  type: string;
  args: Record<string, any>;
}

export interface CutsceneManifest {
  id: string;
  commands: CutsceneCommand[];
}

export interface CutsceneContext {
  engine: Engine;
  camera: Camera;
  system: CutSceneSystem;
}

export type CommandImplementation = (args: Record<string, any>, ctx: CutsceneContext) => Promise<void>;

// ==========================================
// 2. Component & Director Entity
// ==========================================

export class CutSceneParticipantComponent extends Component {
  public id: string;
  /**
   * Flag indicating if this entity is currently locked by an active cutscene.
   * Can be checked by input systems or automation loops to freeze behavior.
   */
  public isPlaying: boolean = false;

  constructor(config: { id: string }) {
    super();
    this.id = config.id;
  }
}

export class CutSceneDirector extends Entity {
  actions: ActionsComponent;

  constructor() {
    super();
    this.actions = new ActionsComponent();
    this.addComponent(this.actions);
  }
}

// ==========================================
// 3. Main ECS System & Orchestrator
// ==========================================

export class CutSceneSystem extends System {
  public query: Query<typeof CutSceneParticipantComponent>;
  public world: World;
  public engine: Engine;
  public systemType: SystemType = SystemType.Update;
  public director: CutSceneDirector;
  public camera: Camera;

  // Stores registered manifest raw JSON strings/objects or file paths
  private registeredCutScenes = new Map<string, CutsceneManifest>();

  // Pluggable Command Registry
  private commandRegistry = new Map<string, CommandImplementation>();

  private activeSequence: ActionSequence | null = null;
  private isPlaying: boolean = false;

  constructor(world: World) {
    super();
    this.world = world;
    this.engine = world.scene.engine;
    this.camera = world.scene.camera;
    this.query = world.query([CutSceneParticipantComponent]);

    // Spawn director into scene context
    this.director = new CutSceneDirector();
    world.scene.add(this.director);

    // Automatically register standard core actions
    this.registerCoreCommands();
  }

  public update(elapsed: number): void {
    if (!this.engine) return;

    // Auto-heal director on frame updates
    this.ensureDirector();

    // If a running sequence has finished its actions, clean up state
    if (this.activeSequence && this.director.actions.getQueue().isComplete()) {
      this.finalizeCutScene();
    }
  }

  private ensureDirector(): CutSceneDirector {
    const currentScene = this.engine?.currentScene ?? this.world?.scene;
    if (!currentScene) return this.director;

    // 1. Re-instantiate if destroyed during scene cleanup
    if (this.director.isKilled()) {
      this.director = new CutSceneDirector();
    }

    // 2. Re-parent to current scene graph if missing
    if (!currentScene.entities.includes(this.director)) {
      currentScene.add(this.director);
    }

    // 3. Sync active scene camera
    this.camera = currentScene.camera;

    return this.director;
  }

  // ==========================================
  // Public API
  // ==========================================

  /** Register custom cutscene commands dynamically */
  public registerCommand(type: string, implementation: CommandImplementation): void {
    this.commandRegistry.set(type, implementation);
  }

  /** Register pre-loaded or inline JSON manifests */
  public registerCutScene(id: string, manifest: CutsceneManifest): void {
    this.registeredCutScenes.set(id, manifest);
  }

  /** Translates a registered JSON manifest into a native Excalibur ActionSequence */
  public loadCutScene(cutsceneId: string): ActionSequence {
    const manifest = this.registeredCutScenes.get(cutsceneId);
    if (!manifest) {
      throw new Error(`Cutscene '${cutsceneId}' is not registered.`);
    }

    // Build the native sequence targeting our director entity
    const sequence = new ActionSequence(this.director, (ctx: ActionContext) => {
      const context: CutsceneContext = {
        engine: this.engine,
        camera: this.camera,
        system: this,
      };

      // Process commands sequentially
      for (const command of manifest.commands) {
        const impl = this.commandRegistry.get(command.type);
        if (!impl) {
          console.warn(`CutSceneSystem: Unknown command type '${command.type}'`);
          continue;
        }
        // Execute command implementation context
        impl(command.args, context);
      }
    });

    return sequence;
  }

  public async startCutScene(cutsceneId: string): Promise<void> {
    if (this.isPlaying) return;

    // Guarantee director and camera are valid BEFORE sequence runs
    this.ensureDirector();

    const manifest = this.registeredCutScenes.get(cutsceneId);
    if (!manifest) return;

    this.isPlaying = true;
    // Toggle flags on your tracking components
    this.setParticipantsPlayingState(true);

    const context = {
      engine: this.engine,
      camera: this.camera,
      system: this,
    };

    try {
      // CRITICAL: We use a standard for...of loop and 'await' each step
      for (const command of manifest.commands) {
        if (!this.isPlaying) break; // Break out if someone skips or cancels

        const impl = this.commandRegistry.get(command.type);

        if (impl) {
          await impl(command.args, context);
        }
      }
    } finally {
      // Clean up when done or if something throws an error
      this.finalizeCutScene();
      this.isPlaying = false;
    }
  }

  public cancelCutScene(): void {
    if (!this.activeSequence) return;

    this.director.actions.clearActions();
    this.finalizeCutScene();
  }

  public isCutSceneActive(): boolean {
    return this.activeSequence !== null;
  }

  public getParticipant(id: string): Entity | undefined {
    return this.query.entities.find(ent => ent.get(CutSceneParticipantComponent)?.id === id);
  }

  // ==========================================
  // Helper / Internal Methods
  // ==========================================

  private setParticipantsPlayingState(isPlaying: boolean): void {
    this.query.entities.forEach(e => (e.get(CutSceneParticipantComponent).isPlaying = isPlaying));
  }

  private finalizeCutScene(): void {
    // Restore all active tracking entities to normal operation
    this.query.entities.forEach(ent => {
      const comp = ent.get(CutSceneParticipantComponent);
      if (comp) comp.isPlaying = false;
    });
    this.activeSequence = null;
  }

  /** Stubs standard operations using Excalibur's Action Context */
  private registerCoreCommands(): void {
    this.registerCommand("moveActor", async (args, ctx) => {
      const { actor: actorId, x, y, speed } = args;
      const entity = ctx.system.getParticipant(actorId);
      if (entity instanceof Actor) {
        await entity.actions.moveTo(x, y, speed).toPromise();
      }
    });

    // Wait Command
    this.registerCommand("wait", async (args, ctx) => {
      const { duration } = args;
      await ctx.system.director.actions.delay(duration).toPromise();
    });

    // 3. Camera Shake: Clean and explicit
    this.registerCommand("cameraShake", async (args, ctx) => {
      const { magnitudeX, magnitudeY, duration } = args;

      ctx.camera.shake(magnitudeX, magnitudeY, duration);
      // Await the duration of the shake before allowing the JSON to step forward
      await new Promise<void>(resolve => setTimeout(resolve, duration));
    });

    this.registerCommand("blink", async (args, ctx) => {
      const { actor: actorId, timeOn, timeOff, numBlinks } = args;
      const entity = ctx.system.getParticipant(actorId);

      if (entity instanceof Actor) {
        // Execute the action directly on the target entity, not the director!
        await entity.actions.runAction(new Blink(entity, timeOn, timeOff, numBlinks)).toPromise();
      }
    });

    this.registerCommand("parallel", async (args, ctx) => {
      const { actions } = args;
      if (!actions || !Array.isArray(actions)) return;

      // Map each command block immediately to invoke the actions simultaneously
      const promAll = actions.map(async act => {
        const impl = ctx.system.commandRegistry.get(act.type); // Safe lookup helper
        if (!impl) {
          console.warn(`CutSceneSystem (Parallel): Unknown command type '${act.type}'`);
          return;
        }

        // Fire the async implementation block concurrently
        await impl(act.args, ctx);
      });

      // Block the Director's main sequence loop until ALL inner actors report completion
      await Promise.all(promAll);
    });
  }
}
