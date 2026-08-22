import { CrimeTruth, Fact, FactRelation, FactType, MotiveType, SuspectProfile } from "./CrimeTypes";

export class FactGenerator {
  public generate(profiles: SuspectProfile[], truth: CrimeTruth): Fact[] {
    const facts: Fact[] = [];

    for (const profile of profiles) {
      switch (profile.role) {
        case "culprit":
          facts.push(...this.generateCulpritFacts(profile, truth));
          break;
        case "rival":
          facts.push(...this.generateRivalFacts(profile, truth));
          break;
        case "misleading":
          facts.push(...this.generateMisleadingFacts(profile, truth));
          break;
        case "witness":
          facts.push(...this.generateWitnessFacts(profile, truth));
          break;
        case "background":
          facts.push(...this.generateBackgroundFacts(profile, truth));
          break;
      }
    }

    facts.push({
      id: crypto.randomUUID(),
      type: "method",
      relation: "used-method",
      value: truth.method,
      crimeRelevant: true,
      description: `The crime was committed using ${truth.method}.`,
      discoveryMethod: "interrogation", // placeholder - overwritten by FactDiscoveryAssigner
    });

    return facts;
  }

  private generateCulpritFacts(profile: SuspectProfile, truth: CrimeTruth): Fact[] {
    const person = profile.person;

    return [
      this.createFact("motive", "has-motive", person.id, truth.motive, true, `${person.name} had a strong ${truth.motive} motive.`),
      this.createFact(
        "opportunity",
        "has-access",
        person.id,
        truth.event.location,
        true,
        `${person.name} had access to ${truth.event.location}.`,
      ),
      this.createFact(
        "timeline",
        "was-near",
        person.id,
        truth.event.time,
        true,
        `${person.name}'s whereabouts place them near the crime around ${truth.event.time}.`,
      ),
    ];
  }

  private generateRivalFacts(profile: SuspectProfile, truth: CrimeTruth): Fact[] {
    const person = profile.person;
    const motive = this.randomItem<MotiveType>(["revenge", "money", "jealousy", "power"]);
    const awayTime = this.generateDifferentTime(truth.event.time);

    return [
      this.createFact("motive", "has-motive", person.id, motive, false, `${person.name} had a possible ${motive} motive.`),
      this.createFact(
        "opportunity",
        "has-access",
        person.id,
        truth.event.location,
        false,
        `${person.name} had access to ${truth.event.location}.`,
      ),
      this.createFact(
        "timeline",
        "was-not-at",
        person.id,
        awayTime,
        false,
        `${person.name}'s timeline places them away from the crime at ${awayTime}.`,
      ),
    ];
  }

  private generateMisleadingFacts(profile: SuspectProfile, truth: CrimeTruth): Fact[] {
    const person = profile.person;
    const motive = this.randomItem<MotiveType>(["money", "revenge", "jealousy"]);

    return [
      this.createFact("motive", "has-motive", person.id, motive, false, `${person.name} had reason to be upset.`),
      this.createFact(
        "timeline",
        "was-active",
        person.id,
        truth.event.time,
        false,
        `${person.name} was active around ${truth.event.time}.`,
      ),
      this.createFact(
        "opportunity",
        "lacks-access",
        person.id,
        truth.event.location,
        false,
        `${person.name} did not have access to ${truth.event.location}.`,
      ),
    ];
  }

  private generateWitnessFacts(profile: SuspectProfile, truth: CrimeTruth): Fact[] {
    const person = profile.person;

    return [
      this.createFact(
        "relationship",
        "witnessed",
        person.id,
        truth.event.location,
        false,
        `${person.name} was nearby ${truth.event.location} on the night of the crime.`,
      ),
      this.createFact(
        "timeline",
        "was-active",
        person.id,
        truth.event.time,
        false,
        `${person.name} remembers something from around ${truth.event.time}.`,
      ),
    ];
  }

  // FactGenerator.ts (generateBackgroundFacts excerpt)
  private generateBackgroundFacts(profile: SuspectProfile, truth: CrimeTruth): Fact[] {
    const person = profile.person;
    const awayTime = this.generateDifferentTime(truth.event.time);

    return [
      this.createFact(
        "relationship",
        "has-motive",
        person.id,
        "unrelated",
        false,
        `${person.name} had only a minor connection to the case.`,
      ),
      this.createFact(
        "timeline",
        "was-active",
        person.id,
        awayTime,
        false,
        `${person.name}'s activities occurred outside the critical time window at ${awayTime}.`,
      ),
    ];
  }

  private createFact(
    type: FactType,
    relation: FactRelation,
    subjectId: string,
    value: string,
    crimeRelevant: boolean,
    description: string,
  ): Fact {
    return {
      id: crypto.randomUUID(),
      type,
      relation,
      subjectId,
      value,
      crimeRelevant,
      description,
      discoveryMethod: "interrogation", // placeholder - overwritten by FactDiscoveryAssigner
    };
  }

  private generateDifferentTime(crimeTime: string): string {
    const times = ["8:00 PM", "8:30 PM", "9:00 PM", "9:15 PM", "9:30 PM", "10:00 PM"];
    const availableTimes = times.filter(time => time !== crimeTime);
    return this.randomItem(availableTimes);
  }

  private randomItem<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot select a random item from an empty array.");
    }
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
