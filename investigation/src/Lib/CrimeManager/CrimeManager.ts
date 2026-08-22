import { FactGenerator } from "./FactGenerator";
import { SuspectGenerator } from "./SuspectGenerator";
import { CrimeGraph } from "./CrimeGraph";
import { CrimeGraphQuery } from "./CrimeGraphQuery";
import { InterrogationManager } from "./InterrogationEngine";
import { DiscoverySource, EvidenceToken, Fact, SuspectProfile, CrimeTruth } from "./CrimeTypes";
import { QuestionTemplate } from "./InterrogationTypes";
import { PlayerKnowledgeGraph } from "./PlayerKnowledgeGraph";
import { FactDiscoveryAssigner } from "./FactDiscoveryAssigner";
import { EvidenceGenerator } from "./EvidenceGenerator";
import { CaseSolvabilityValidator, SolvabilityReport } from "./CaseSolvabilityValidator";
import { CrimeEventGenerator } from "./CrimeEventGenerator";

export class CrimeManager {
  private suspectGen = new SuspectGenerator();
  private factGen = new FactGenerator();
  private discoveryAssigner = new FactDiscoveryAssigner();
  private evidenceGen = new EvidenceGenerator();
  private solvabilityValidator = new CaseSolvabilityValidator();
  private crimeEventGenerator = new CrimeEventGenerator();
  private crimeGraph?: CrimeGraph;
  private playerGraph?: PlayerKnowledgeGraph;
  private interrogationMgr = new InterrogationManager();

  private truth?: CrimeTruth;
  private profiles: SuspectProfile[] = [];
  private facts: Fact[] = [];
  private evidenceTokens: EvidenceToken[] = [];
  private latestSolvabilityReport?: SolvabilityReport;

  public generateCrime(): void {
    this.profiles = this.suspectGen.generate(5);

    const culpritProfile = this.profiles.find(p => p.role === "culprit");
    if (!culpritProfile) {
      throw new Error("No culprit generated.");
    }

    this.truth = this.crimeEventGenerator.generate(culpritProfile.person.id);

    this.facts = this.factGen.generate(this.profiles, this.truth);

    // Randomly assign each fact's discovery channel BEFORE building anything
    // that depends on it (evidence tokens, interrogation templates).
    this.facts = this.discoveryAssigner.assign(this.facts);
    this.evidenceTokens = this.evidenceGen.generate(this.facts, this.profiles);

    const people = this.profiles.map(p => p.person);
    this.crimeGraph = new CrimeGraph(people, this.truth, this.facts);
    this.playerGraph = new PlayerKnowledgeGraph(this.crimeGraph);

    const templates: QuestionTemplate[] = [];

    for (const fact of this.facts) {
      if (!fact.subjectId) continue;
      // Only facts assigned to the interrogation channel become askable -
      // exploration/forensics facts are revealed exclusively through their
      // own systems, never through dialogue.
      if (fact.discoveryMethod !== "interrogation") continue;

      let category: QuestionTemplate["category"] = "timeline";
      let templateText = "Where were you around {time}?";
      let requiredVariables: QuestionTemplate["requiredVariables"] = ["time"];

      if (fact.type === "motive") {
        category = "motive";
        templateText = "Care to explain your connection or motive regarding this incident?";
        requiredVariables = [];
      } else if (fact.type === "location" || fact.type === "opportunity") {
        category = "opportunity";
        templateText = "Did you have access to {location} on the night of the crime?";
        requiredVariables = ["location"];
      } else if (fact.type === "timeline") {
        category = "timeline";
        templateText = "Can you account for your whereabouts near {time}?";
        requiredVariables = ["time"];
      }

      templates.push({
        id: `tpl_${fact.id}`,
        category,
        templateText,
        requiredVariables,
        revealsFactId: fact.id,
      });
    }

    this.interrogationMgr.initialize(this.profiles, this.facts, this.truth.event.location, this.truth.event.time);

    (this.interrogationMgr as any).templates = templates;

    this.latestSolvabilityReport = this.solvabilityValidator.validate(
      this.crimeGraph,
      this.facts,
      this.profiles,
      this.truth,
      this.evidenceTokens,
    );

    if (!this.latestSolvabilityReport.isWinnable) {
      console.warn(
        "%cGenerated case is NOT fully winnable - call printSolvability() for details, or use generateSolvableCrime() instead.",
        "color: #ff5555; font-weight: bold;",
      );
    }
  }

  /**
   * Like generateCrime(), but retries (with fresh random suspects/facts/
   * discovery assignment each time) until the case passes checkSolvability(),
   * or maxAttempts is reached. Use this instead of generateCrime() whenever
   * you actually need a playable case rather than testing the validator itself.
   */
  public generateSolvableCrime(maxAttempts: number = 20): SolvabilityReport {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.generateCrime();
      if (this.latestSolvabilityReport?.isWinnable) {
        console.log(`%cGenerated a winnable case after ${attempt} attempt(s).`, "color: #66ff66;");
        return this.latestSolvabilityReport;
      }
    }

    console.error(`%cFailed to generate a winnable case after ${maxAttempts} attempts.`, "color: #ff5555; font-weight: bold;");
    return this.latestSolvabilityReport!;
  }

  public checkSolvability(): SolvabilityReport | undefined {
    return this.latestSolvabilityReport;
  }

  public printSolvability(): void {
    if (!this.latestSolvabilityReport) {
      console.log("No active case - call generateCrime() first.");
      return;
    }

    const report = this.latestSolvabilityReport;
    console.group("%cSOLVABILITY REPORT", "font-weight: bold; font-size: 16px; color: #ffcc00;");
    console.log("Ground truth solvable:", report.groundTruthSolvable);
    console.log("Winnable by player:", report.isWinnable);

    if (report.issues.length === 0) {
      console.log("%cNo issues found.", "color: #66ff66;");
    } else {
      console.table(
        report.issues.map(i => ({
          severity: i.severity,
          message: i.message,
        })),
      );
    }
    console.groupEnd();
  }

  // --- Master-graph analysis (ground truth, dev/debug only) ---

  public analyzeCrime(): void {
    if (!this.crimeGraph) return;

    const query = new CrimeGraphQuery(this.crimeGraph);
    const analyses = query.analyzeAllSuspects();

    console.group("%cSUSPECT PATH ANALYSIS (ground truth)", "font-weight: bold; font-size: 16px; color: #00ffcc;");
    console.table(
      analyses.map(a => ({
        Name: a.personName,
        "Motive (1)": a.motiveScore,
        "Opportunity (1)": a.opportunityScore,
        "Timeline (1)": a.timelineScore,
        "Total Score": `${a.totalScore}/3`,
        "Coherence %": `${a.coherencePercentage}%`,
        Contradictions: a.contradictions.join("; ") || "None",
        "Is Culprit Path?": a.isFullyCoherent ? "YES" : "No",
      })),
    );
    console.log("Is Case Solvable?:", query.isCaseSolvable());
    console.groupEnd();
  }

  public logCrimeGraph(): void {
    this.crimeGraph?.log();
  }

  // --- Interrogation (wired into PlayerKnowledgeGraph) ---

  public interrogateSuspect(personName: string): void {
    const profile = this.profiles.find(p => p.person.name.toLowerCase() === personName.toLowerCase());

    if (!profile) {
      console.error(`Suspect "${personName}" not found.`);
      return;
    }

    const personId = profile.person.id;
    console.group(
      `%cINTERROGATION: ${profile.person.name} (${profile.role.toUpperCase()})`,
      "font-weight: bold; font-size: 14px; color: #ff007f;",
    );

    let step = 1;
    while (true) {
      const availableQuestions = this.interrogationMgr.getAvailableQuestions(personId);

      if (availableQuestions.length === 0) {
        console.log(`%c[No further questions available for ${profile.person.name}]`, "color: #888888; font-style: italic;");
        break;
      }

      const question = availableQuestions[0];
      console.log(`\n%cStep ${step}: Asking -> "${question.displayText}"`, "color: #00aaff; font-weight: bold;");

      const result = this.interrogationMgr.askQuestion(personId, question);
      console.log(`%c${profile.person.name}: %c${result.response}`, "color: #ffaa00; font-weight: bold;", "color: #ffffff;");

      if (result.fact) {
        const wasNew = this.playerGraph?.discoverFact(result.fact, "interrogation");
        if (wasNew) {
          console.log(`%c  -> added to player knowledge graph`, "color: #66ff66; font-style: italic;");
        }
      }

      step++;
    }

    console.groupEnd();
  }

  // --- Exploration (evidence tokens) ---

  /**
   * Collect a specific evidence token, as if the player picked it up in a scene.
   * Use listEvidence() to find valid token IDs to test with.
   */
  public collectEvidence(tokenId: string): boolean {
    const token = this.evidenceTokens.find(t => t.id === tokenId);
    if (!token) {
      console.error(`No evidence token with id "${tokenId}".`);
      return false;
    }
    if (token.collected) {
      console.log(`%cAlready collected: "${token.label}"`, "color: #888888; font-style: italic;");
      return false;
    }

    const fact = this.facts.find(f => f.id === token.factId);
    if (!fact) {
      console.error(`Evidence token "${tokenId}" points at missing fact "${token.factId}".`);
      return false;
    }

    token.collected = true;
    const wasNew = this.playerGraph?.discoverFact(fact, "exploration") ?? false;
    console.log(`%c[exploration] Collected "${token.label}" -> "${fact.description}"`, "color: #66ff66;");
    return wasNew;
  }

  /**
   * Collect every uncollected evidence token in a given scene at once.
   * Use listEvidence() to see valid sceneId values.
   */
  public collectAllEvidenceInScene(sceneId: string): number {
    const tokens = this.evidenceTokens.filter(t => t.sceneId === sceneId && !t.collected);
    let count = 0;
    for (const token of tokens) {
      if (this.collectEvidence(token.id)) count++;
    }
    console.log(`%c[exploration] Collected ${count} item(s) from scene "${sceneId}".`, "color: #66ff66;");
    return count;
  }

  // --- Forensics ---

  /**
   * Run forensic analysis on a specific fact, as if the player sent evidence
   * to a lab. Only meaningful for facts whose discoveryMethod is "forensics" -
   * use listFacts() to find them, but this will still work (with a warning)
   * on facts tagged otherwise, in case that's useful for testing.
   */
  public runForensics(factId: string): boolean {
    const fact = this.facts.find(f => f.id === factId);
    if (!fact) {
      console.error(`No fact with id "${factId}" exists on this case.`);
      return false;
    }
    if (fact.discoveryMethod !== "forensics") {
      console.warn(`Fact "${factId}" is tagged "${fact.discoveryMethod}", not "forensics" - allowing anyway for testing.`);
    }

    const wasNew = this.playerGraph?.discoverFact(fact, "forensics") ?? false;
    console.log(`%c[forensics] Analyzed -> "${fact.description}"`, "color: #66ff66;");
    return wasNew;
  }

  // --- Generic manual discovery (escape hatch for testing any channel) ---

  public discoverFactById(factId: string, source: DiscoverySource = "exploration"): boolean {
    const fact = this.facts.find(f => f.id === factId);
    if (!fact) {
      console.error(`No fact with id "${factId}" exists on this case.`);
      return false;
    }

    const wasNew = this.playerGraph?.discoverFact(fact, source) ?? false;
    console.log(
      wasNew ? `%c[${source}] Discovered: "${fact.description}"` : `%c[${source}] Already known: "${fact.description}"`,
      wasNew ? "color: #66ff66;" : "color: #888888; font-style: italic;",
    );
    return wasNew;
  }

  public discoverAllFactsForPerson(personId: string, source: DiscoverySource = "exploration"): number {
    const personFacts = this.facts.filter(f => f.subjectId === personId);
    const count = this.playerGraph?.discoverFacts(personFacts, source) ?? 0;
    console.log(`%c[${source}] Discovered ${count} new fact(s) for person ${personId}.`, "color: #66ff66;");
    return count;
  }

  // --- Inspection / debug printing ---

  public listSuspects(): void {
    console.group("%cSUSPECTS", "font-weight: bold; font-size: 16px; color: #00ccff;");
    console.table(
      this.profiles.map(p => ({
        id: p.person.id,
        name: p.person.name,
        role: p.role,
        isCulprit: p.person.id === this.truth?.culpritId,
      })),
    );
    console.groupEnd();
  }

  public listFacts(): void {
    console.group("%cALL FACTS (case data)", "font-weight: bold; font-size: 16px; color: #00ccff;");
    console.table(
      this.facts.map(f => ({
        id: f.id,
        subjectId: f.subjectId ?? "(crime-level)",
        type: f.type,
        relation: f.relation,
        value: f.value,
        discoveryMethod: f.discoveryMethod,
        crimeRelevant: f.crimeRelevant,
        description: f.description,
      })),
    );
    console.groupEnd();
  }

  public listEvidence(): void {
    console.group("%cEVIDENCE TOKENS", "font-weight: bold; font-size: 16px; color: #00ccff;");
    if (this.evidenceTokens.length === 0) {
      console.log("No exploration-channel facts on this case - no tokens generated.");
    } else {
      console.table(
        this.evidenceTokens.map(t => ({
          id: t.id,
          label: t.label,
          sceneId: t.sceneId,
          factId: t.factId,
          collected: t.collected,
        })),
      );
    }
    console.groupEnd();
  }

  public printPlayerKnowledge(): void {
    if (!this.playerGraph) {
      console.log("No active case - call generateCrime() first.");
      return;
    }

    const entries = this.playerGraph.getDiscoveredFacts();

    console.group("%cPLAYER KNOWLEDGE", "font-weight: bold; font-size: 16px; color: #ffcc00;");
    if (entries.length === 0) {
      console.log("Nothing discovered yet.");
    } else {
      console.table(
        entries.map(e => ({
          factId: e.fact.id,
          subjectId: e.fact.subjectId ?? "(crime-level)",
          type: e.fact.type,
          value: e.fact.value,
          source: e.source,
          description: e.fact.description,
          discoveredAt: new Date(e.discoveredAt).toLocaleTimeString(),
        })),
      );
    }
    console.log(`Player graph: ${this.playerGraph.getGraph().nodes.size} nodes, ${this.playerGraph.getGraph().edges.size} edges`);
    console.groupEnd();
  }

  // --- Accessors ---

  public getCrimeGraph(): CrimeGraph | undefined {
    return this.crimeGraph;
  }

  public getPlayerKnowledgeGraph(): PlayerKnowledgeGraph | undefined {
    return this.playerGraph;
  }

  public getFacts(): Fact[] {
    return this.facts;
  }

  public getEvidenceTokens(): EvidenceToken[] {
    return this.evidenceTokens;
  }

  public getSuspects(): SuspectProfile[] {
    return this.profiles;
  }

  public getTruth(): CrimeTruth | undefined {
    return this.truth;
  }
}
