export type CrimeType = "theft" | "sabotage" | "fraud" | "vandalism";

export type MotiveType = "money" | "revenge" | "jealousy" | "self-preservation" | "power" | "none";

export type RelationshipType = "employee" | "coworker" | "business-partner" | "friend" | "family" | "neighbor" | "rival" | "none";

export type FactType = "motive" | "location" | "timeline" | "opportunity" | "relationship" | "method";

export type FactRelation =
  | "has-motive"
  | "has-access"
  | "lacks-access"
  | "was-at"
  | "was-not-at"
  | "was-near"
  | "was-active"
  | "witnessed"
  | "used-method";

/**
 * Which investigation channel reveals a given Fact to the player. Assigned
 * per-fact by FactDiscoveryAssigner, randomly, at case-generation time.
 */
export type DiscoverySource = "exploration" | "interrogation" | "forensics";

export interface Person {
  id: string;
  name: string;
}

export interface CrimeEvent {
  type: CrimeType;
  target: string;
  location: string;
  time: string;
}

export interface CrimeTruth {
  culpritId: string;
  motive: MotiveType;
  event: CrimeEvent;
  method: string;
}

export interface Fact {
  id: string;
  type: FactType;
  subjectId?: string;
  relation: FactRelation;
  value: string;
  relatedPersonId?: string;
  crimeRelevant: boolean;
  description: string;
  /**
   * Which channel reveals this fact. Set to a placeholder by FactGenerator
   * and then overwritten by FactDiscoveryAssigner.assign() - don't rely on
   * this value until that assignment step has run.
   */
  discoveryMethod: DiscoverySource;
}

export interface Clue {
  id: string;
  factId: string;
  description: string;
  source: "exploration" | "interrogation" | "forensics";
}

/**
 * A physical, scene-based representation of a Fact whose discoveryMethod is
 * "exploration". Only facts assigned that channel get a token - the rest are
 * interrogation- or forensics-only and never appear in the world.
 */
export interface EvidenceToken {
  id: string;
  factId: string;
  sceneId: string; // placeholder scene grouping until a real scene system exists
  label: string; // short in-world name, e.g. "Torn Receipt"
  collected: boolean;
}

export interface Crime {
  id: string;
  title: string;
  suspects: Person[];
  truth: CrimeTruth;
  facts: Fact[];
  clues: Clue[];
}

export interface SuspectProfile {
  person: Person;
  role: SuspectRole;
}

export type SuspectRole = "culprit" | "rival" | "misleading" | "witness" | "background";
