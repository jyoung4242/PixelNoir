// CrimeEventGenerator.ts
import { CrimeEvent, CrimeTruth, CrimeType, MotiveType } from "./CrimeTypes";

const CRIME_TYPES: readonly CrimeType[] = ["theft", "sabotage", "fraud", "vandalism"];

// Flat, shared across all crime types (per instruction - not worth the
// complexity of per-type pools right now).
const LOCATIONS: readonly string[] = ["Museum", "Train Station", "Pharmacy", "Theater", "City Hall"];
const TIMES: readonly string[] = ["8:00 PM", "8:30 PM", "9:00 PM", "9:15 PM", "10:00 PM"];

const TARGETS_BY_TYPE: Record<CrimeType, readonly string[]> = {
  theft: ["a valuable painting", "a rare artifact", "a locked cash box"],
  sabotage: ["the security system", "the train controls", "the building generator"],
  fraud: ["financial records", "company accounts", "an insurance claim"],
  vandalism: ["a historical monument", "a storefront", "a public sculpture"],
};

const METHODS_BY_TYPE: Record<CrimeType, readonly string[]> = {
  theft: ["used a stolen key", "bypassed the lock", "used an access card"],
  sabotage: ["tampered with the control panel", "disabled the safety system", "cut a critical cable"],
  fraud: ["forged documents", "altered financial records", "used a false identity"],
  vandalism: ["used specialized tools", "entered through a restricted area", "damaged the target after closing"],
};

/**
 * Which motives make narrative sense for each crime type - keeps "jealousy"
 * from pairing with a forged insurance claim, "revenge" from pairing with
 * simple theft, etc. "none" is intentionally excluded everywhere: the actual
 * crime always needs a real motive. "none"/"unrelated" stays reserved for
 * background suspects over in FactGenerator.
 */
const MOTIVES_BY_TYPE: Record<CrimeType, readonly MotiveType[]> = {
  theft: ["money", "self-preservation", "power"],
  sabotage: ["revenge", "power", "self-preservation"],
  fraud: ["money", "self-preservation", "power"],
  vandalism: ["revenge", "jealousy"],
};

export class CrimeEventGenerator {
  public generate(culpritId: string): CrimeTruth {
    const type = this.randomItem(CRIME_TYPES);
    const event = this.generateEvent(type);
    const motive = this.randomItem(MOTIVES_BY_TYPE[type]);
    const method = this.randomItem(METHODS_BY_TYPE[type]);

    return {
      culpritId,
      motive,
      method,
      event,
    };
  }

  public generateTitle(event: CrimeEvent): string {
    return `The ${event.type} at ${event.location}`;
  }

  private generateEvent(type: CrimeType): CrimeEvent {
    return {
      type,
      target: this.randomItem(TARGETS_BY_TYPE[type]),
      location: this.randomItem(LOCATIONS),
      time: this.randomItem(TIMES),
    };
  }

  private randomItem<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot select a random item from an empty array.");
    }
    return items[Math.floor(Math.random() * items.length)];
  }
}
