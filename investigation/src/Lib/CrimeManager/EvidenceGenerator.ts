// EvidenceGenerator.ts
import { EvidenceToken, Fact, FactType, SuspectProfile } from "./CrimeTypes";

/**
 * Builds physical, scene-based EvidenceToken entries for facts assigned the
 * "exploration" discovery channel. Facts assigned "interrogation" or
 * "forensics" never get a token here - they stay confined to their own
 * systems. sceneId is a placeholder grouping (one scene per suspect, plus a
 * shared crime scene) until a real scene/level system exists to slot into.
 */
export class EvidenceGenerator {
  public generate(facts: Fact[], profiles: SuspectProfile[]): EvidenceToken[] {
    return facts.filter(fact => fact.discoveryMethod === "exploration").map(fact => this.createToken(fact, profiles));
  }

  private createToken(fact: Fact, profiles: SuspectProfile[]): EvidenceToken {
    return {
      id: crypto.randomUUID(),
      factId: fact.id,
      sceneId: this.resolveSceneId(fact, profiles),
      label: this.generateLabel(fact),
      collected: false,
    };
  }

  private resolveSceneId(fact: Fact, profiles: SuspectProfile[]): string {
    if (!fact.subjectId) return "crime-scene";

    const profile = profiles.find(p => p.person.id === fact.subjectId);
    if (!profile) return "crime-scene";

    return `scene:${profile.person.name.toLowerCase().replace(/\s+/g, "-")}`;
  }

  private generateLabel(fact: Fact): string {
    const labelsByType: Partial<Record<FactType, string[]>> = {
      motive: ["Personal Letter", "Diary Entry", "Threatening Note"],
      location: ["Key Card", "Access Log Printout", "Parking Receipt"],
      opportunity: ["Key Card", "Access Log Printout", "Building Pass"],
      timeline: ["Torn Ticket Stub", "Timestamped Photo", "Crumpled Receipt"],
      method: ["Tool Fragment", "Broken Lock Pick", "Tampered Device"],
      relationship: ["Old Photograph", "Bundle of Letters"],
    };

    const options = labelsByType[fact.type] ?? ["Unidentified Item"];
    return options[Math.floor(Math.random() * options.length)];
  }
}
