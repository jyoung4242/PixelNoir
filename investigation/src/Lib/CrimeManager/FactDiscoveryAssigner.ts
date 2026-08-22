// FactDiscoveryAssigner.ts
import { DiscoverySource, Fact } from "./CrimeTypes";

/**
 * Relative weights for how often each channel gets picked. Equal by default -
 * pass a custom distribution to skew things (e.g. fewer forensics facts if
 * that system is more limited in scope).
 */
export interface DiscoveryDistribution {
  exploration: number;
  interrogation: number;
  forensics: number;
}

const DEFAULT_DISTRIBUTION: DiscoveryDistribution = {
  exploration: 1,
  interrogation: 1,
  forensics: 0, // no forensics system implemented yet - see runForensics() note in CrimeManager
};

/**
 * Randomly assigns every Fact exactly one DiscoverySource. This determines
 * which system can ever reveal that fact to the player: EvidenceGenerator
 * only builds tokens for "exploration" facts, InterrogationManager should
 * only be given templates for "interrogation" facts, and "forensics" facts
 * are reserved for a lab-analysis system.
 */
export class FactDiscoveryAssigner {
  public assign(facts: Fact[], distribution: DiscoveryDistribution = DEFAULT_DISTRIBUTION): Fact[] {
    const pool = this.buildWeightedPool(distribution);

    for (const fact of facts) {
      fact.discoveryMethod = this.randomItem(pool);
    }

    return facts;
  }

  private buildWeightedPool(distribution: DiscoveryDistribution): DiscoverySource[] {
    const pool: DiscoverySource[] = [];

    for (let i = 0; i < distribution.exploration; i++) pool.push("exploration");
    for (let i = 0; i < distribution.interrogation; i++) pool.push("interrogation");
    for (let i = 0; i < distribution.forensics; i++) pool.push("forensics");

    if (pool.length === 0) {
      throw new Error("DiscoveryDistribution must have at least one positive weight.");
    }

    return pool;
  }

  private randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
