// CaseSolvabilityValidator.ts
import { CrimeGraph } from "./CrimeGraph";
import { CrimeGraphQuery } from "./CrimeGraphQuery";
import { CrimeTruth, DiscoverySource, EvidenceToken, Fact, SuspectProfile } from "./CrimeTypes";

export interface SolvabilityIssue {
  severity: "error" | "warning";
  message: string;
}

export interface SolvabilityReport {
  groundTruthSolvable: boolean; // CrimeGraphQuery.isCaseSolvable() - is the logic graph itself coherent?
  isWinnable: boolean; // groundTruthSolvable AND every error-level issue is clear
  issues: SolvabilityIssue[];
}

/**
 * Discovery channels that currently have a working in-game system behind
 * them. Facts assigned a channel NOT in this list have no way to actually
 * reach the player yet - update this as new systems (e.g. forensics) come
 * online. As of now: exploration has EvidenceGenerator, interrogation has
 * InterrogationManager/templates, forensics has neither.
 */
const IMPLEMENTED_CHANNELS: DiscoverySource[] = ["interrogation", "exploration"];

/**
 * Checks a generated case on two dimensions that CrimeGraphQuery alone
 * doesn't cover:
 *  - is the ground-truth logic actually coherent (delegates to CrimeGraphQuery)
 *  - given the RANDOM discovery-channel assignment, can the player actually
 *    reach everything they need to solve it through systems that exist?
 */
export class CaseSolvabilityValidator {
  public validate(
    crimeGraph: CrimeGraph,
    facts: Fact[],
    profiles: SuspectProfile[],
    truth: CrimeTruth,
    evidenceTokens: EvidenceToken[],
  ): SolvabilityReport {
    const issues: SolvabilityIssue[] = [];

    const groundTruthSolvable = this.checkGroundTruth(crimeGraph, issues);
    this.checkChannelsImplemented(facts, issues);
    this.checkEverySuspectQuestionable(facts, profiles, issues);
    this.checkCulpritFactsReachable(facts, truth, issues);
    this.checkEvidenceTokenCoverage(facts, evidenceTokens, issues);

    const hasErrors = issues.some(i => i.severity === "error");

    return {
      groundTruthSolvable,
      isWinnable: groundTruthSolvable && !hasErrors,
      issues,
    };
  }

  // --- Individual checks ---

  private checkGroundTruth(crimeGraph: CrimeGraph, issues: SolvabilityIssue[]): boolean {
    const query = new CrimeGraphQuery(crimeGraph);
    const solvable = query.isCaseSolvable();

    if (!solvable) {
      issues.push({
        severity: "error",
        message: "Ground truth is not solvable: zero or multiple suspects reach 100% coherence with no contradictions.",
      });
    }

    return solvable;
  }

  private checkChannelsImplemented(facts: Fact[], issues: SolvabilityIssue[]): void {
    const unreachable = facts.filter(f => !IMPLEMENTED_CHANNELS.includes(f.discoveryMethod));
    if (unreachable.length === 0) return;

    const channels = Array.from(new Set(unreachable.map(f => f.discoveryMethod)));
    issues.push({
      severity: "error",
      message: `${unreachable.length} fact(s) assigned to a channel with no in-game discovery system yet: ${channels.join(", ")}.`,
    });
  }

  private checkEverySuspectQuestionable(facts: Fact[], profiles: SuspectProfile[], issues: SolvabilityIssue[]): void {
    for (const profile of profiles) {
      const hasInterrogationFact = facts.some(f => f.subjectId === profile.person.id && f.discoveryMethod === "interrogation");
      if (!hasInterrogationFact) {
        issues.push({
          severity: "warning",
          message: `${profile.person.name} has no interrogation-tagged facts - they'll have nothing to say if questioned.`,
        });
      }
    }
  }

  private checkCulpritFactsReachable(facts: Fact[], truth: CrimeTruth, issues: SolvabilityIssue[]): void {
    const culpritFacts = facts.filter(f => f.subjectId === truth.culpritId && f.crimeRelevant);
    const unreachable = culpritFacts.filter(f => !IMPLEMENTED_CHANNELS.includes(f.discoveryMethod));

    if (unreachable.length > 0) {
      issues.push({
        severity: "error",
        message: `Culprit has ${unreachable.length} crime-relevant fact(s) stuck on an unimplemented channel - the winning path cannot be fully assembled by the player.`,
      });
    }
  }

  private checkEvidenceTokenCoverage(facts: Fact[], evidenceTokens: EvidenceToken[], issues: SolvabilityIssue[]): void {
    const explorationFacts = facts.filter(f => f.discoveryMethod === "exploration");
    const tokenFactIds = new Set(evidenceTokens.map(t => t.factId));

    const orphaned = explorationFacts.filter(f => !tokenFactIds.has(f.id));
    if (orphaned.length > 0) {
      issues.push({
        severity: "error",
        message: `${orphaned.length} exploration-tagged fact(s) have no matching evidence token - likely an EvidenceGenerator bug.`,
      });
    }
  }
}
