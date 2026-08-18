import { Actor, Collider, CollisionContact, CollisionType, Component, Entity, Side, Vector } from "excalibur";
import { InteractionManifest } from "../types";
import { storyResolver, storyPoints } from "../main";
import { CutSceneSystem } from "./cutscenes/CutScenes";
import { NPCActor } from "./NPCManager";

interface IInteractionComponentConfig {
  name: string;
  interactions: InteractionManifest[];
  zoneRadius: number;
  cutSceneSystem: CutSceneSystem;
}

export class InteractionComponent extends Component {
  zone: InteractionZone;
  interactions: InteractionManifest[] = [];
  isEnabled: boolean = true;
  isInteracting: boolean = false;
  cutSceneSystem: CutSceneSystem;

  constructor(config: IInteractionComponentConfig) {
    super();
    this.zone = new InteractionZone(config.name, this, config.zoneRadius);
    this.cutSceneSystem = config.cutSceneSystem;
    this.interactions = [...config.interactions];

    this.registerInteractions();
  }

  private registerInteractions(): void {
    for (const interaction of this.interactions) {
      if (interaction.cutscene) {
        this.cutSceneSystem.registerCutScene(interaction.cutscene.id, interaction.cutscene);
      }
    }
  }

  onAdd(owner: Entity): void {
    this.owner = owner;
    if (owner instanceof Actor) {
      owner.addChild(this.zone);
      owner.addTag("interactable");
      this.zone.addTag("interactable");
    }
  }

  onRemove(previousOwner: Entity): void {
    previousOwner.removeChild(this.zone);
    previousOwner.removeTag("interactable");
  }

  async triggerNpcInteraction(position: Vector): Promise<void | boolean> {
    const activeInteraction = this.getActiveInteraction();
    if (!activeInteraction) return false;
    const { cutscene } = activeInteraction;
    if (this.owner instanceof NPCActor) this.owner.face(position);
    return await this.cutSceneSystem.startCutScene(cutscene.id);
  }

  getActiveInteraction(): InteractionManifest | null {
    if (!this.interactions || this.interactions.length === 0) {
      return null;
    }

    const sortedInteractions = [...this.interactions].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    for (const interaction of sortedInteractions) {
      if (!interaction.requires || interaction.requires.length === 0) return interaction;
      const mode = interaction.conditionMode ?? "ALL";
      if (storyResolver.evaluateAll(interaction.requires, mode)) return interaction;
    }
    return null;
  }
}

export class InteractionZone extends Actor {
  constructor(
    public name: string,
    public component: InteractionComponent,
    radius: number,
  ) {
    super({
      name: `${name}_InteractionZone`,
      radius,
      anchor: Vector.Half,
      collisionType: CollisionType.Passive,
    });
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {}

  startInteraction(position: Vector) {
    this.component.triggerNpcInteraction(position);
  }
}
