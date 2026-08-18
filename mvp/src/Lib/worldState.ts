import { GlobalEvents } from "./GlobalEvents";

class WorldStateImpl {
  private flags = new Set<string>();

  constructor() {
    // GlobalEvents.on("dialogue:sets-flag", ({ flag }) => this.setFlag(flag));
  }

  setFlag(flag: string): void {
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    GlobalEvents.emit("world:flag-set", { flag });
  }

  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  clearFlag(flag: string): void {
    this.flags.delete(flag);
  }

  getAllFlags(): string[] {
    return [...this.flags];
  }

  /** Test/dev helper. */
  reset(): void {
    this.flags.clear();
  }
}

export const worldState = new WorldStateImpl();
