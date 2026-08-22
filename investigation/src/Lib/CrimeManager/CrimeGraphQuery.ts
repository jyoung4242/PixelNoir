import { Node } from "excalibur";
import { CrimeGraph } from "./CrimeGraph";
import { CrimeGraphNodeData, FactNodeData } from "./CrimeGraphTypes";

export interface SuspectPathAnalysis {
  personId: string;
  personName: string;
  motiveScore: number; // 1 if valid motive present, 0 otherwise
  opportunityScore: number; // 1 if has-access to crime location, 0 otherwise
  timelineScore: number; // 1 if was-near crime time, 0 otherwise
  totalScore: number; // Sum of supporting factors (0 - 3)
  coherencePercentage: number; // 0% - 100% based on supporting factors vs contradictions
  contradictions: string[]; // List of clearing/disqualifying facts
  isFullyCoherent: boolean; // True if score is 3/3 with 0 contradictions
}

export class CrimeGraphQuery {
  private readonly crimeGraph: CrimeGraph;

  public constructor(crimeGraph: CrimeGraph) {
    this.crimeGraph = crimeGraph;
  }

  public analyzeSuspect(personId: string): SuspectPathAnalysis | undefined {
    const personNode = this.crimeGraph.getPersonNode(personId);
    if (!personNode || personNode.data.kind !== "person") {
      return undefined;
    }

    const personName = personNode.data.name;
    const crimeNode = this.crimeGraph.getCrimeNode();
    if (!crimeNode) {
      throw new Error("Crime node not found in graph.");
    }

    // Identify target concepts connected directly to CRIME
    const crimeConcepts = this.getCrimeConceptValues();

    // Get all facts connected directly from this PERSON
    const factNodes = this.getFactNodesForPerson(personNode);

    let motiveScore = 0;
    let opportunityScore = 0;
    let timelineScore = 0;
    const contradictions: string[] = [];

    for (const factNode of factNodes) {
      const factData = factNode.data as FactNodeData;

      // Evaluate connected concept targets
      const connectedEntities = this.getConnectedEntityValues(factNode);

      for (const entityVal of connectedEntities) {
        // Motive Evaluation
        if (
          factData.factType === "motive" &&
          factData.relation === "has-motive" &&
          entityVal !== "none" &&
          entityVal !== "unrelated"
        ) {
          motiveScore = 1;
        }

        // Opportunity / Location Evaluation
        if (factData.relation === "has-access" && entityVal === crimeConcepts.location) {
          opportunityScore = 1;
        } else if (factData.relation === "lacks-access" && entityVal === crimeConcepts.location) {
          contradictions.push(`Lacks access to crime location (${crimeConcepts.location})`);
        }

        // Timeline Evaluation
        if (factData.relation === "was-near" && entityVal === crimeConcepts.time) {
          timelineScore = 1;
        } else if (factData.relation === "was-not-at") {
          contradictions.push(`Confirmed away from crime scene at ${entityVal}`);
        }
      }
    }

    const totalScore = motiveScore + opportunityScore + timelineScore;
    const hasContradictions = contradictions.length > 0;

    // Calculate coherence percentage (Penalize heavily if contradictions exist)
    let coherencePercentage = Math.round((totalScore / 3) * 100);
    if (hasContradictions) {
      coherencePercentage = Math.max(0, coherencePercentage - 50);
    }

    const isFullyCoherent = totalScore === 3 && !hasContradictions;

    return {
      personId,
      personName,
      motiveScore,
      opportunityScore,
      timelineScore,
      totalScore,
      coherencePercentage,
      contradictions,
      isFullyCoherent,
    };
  }

  public analyzeAllSuspects(): SuspectPathAnalysis[] {
    const graph = this.crimeGraph.getGraph();
    const analyses: SuspectPathAnalysis[] = [];

    for (const node of graph.nodes.values()) {
      if (node.data.kind === "person") {
        const analysis = this.analyzeSuspect(node.data.personId);
        if (analysis) {
          analyses.push(analysis);
        }
      }
    }

    return analyses;
  }

  public isCaseSolvable(): boolean {
    const analyses = this.analyzeAllSuspects();
    const coherentCulprits = analyses.filter(a => a.isFullyCoherent);
    return coherentCulprits.length === 1;
  }

  // --- Helpers ---

  private getCrimeConceptValues(): { location?: string; time?: string; method?: string } {
    const crimeNode = this.crimeGraph.getCrimeNode();
    if (!crimeNode) return {};

    const concepts: { location?: string; time?: string; method?: string } = {};
    const graph = this.crimeGraph.getGraph();

    for (const edge of graph.edges) {
      if (edge.source === crimeNode) {
        const targetData = edge.target.data;
        if (targetData.kind === "location") concepts.location = targetData.name;
        if (targetData.kind === "time") concepts.time = targetData.value;
        if (targetData.kind === "method") concepts.method = targetData.method;
      }
    }

    return concepts;
  }

  private getFactNodesForPerson(personNode: Node<CrimeGraphNodeData>): Node<CrimeGraphNodeData>[] {
    const graph = this.crimeGraph.getGraph();
    const facts: Node<CrimeGraphNodeData>[] = [];

    for (const edge of graph.edges) {
      if (edge.source === personNode && edge.target.data.kind === "fact") {
        facts.push(edge.target);
      }
    }

    return facts;
  }

  private getConnectedEntityValues(factNode: Node<CrimeGraphNodeData>): string[] {
    const graph = this.crimeGraph.getGraph();
    const values: string[] = [];

    for (const edge of graph.edges) {
      if (edge.source === factNode) {
        const data = edge.target.data;
        if (data.kind === "location") values.push(data.name);
        if (data.kind === "time") values.push(data.value);
        if (data.kind === "motive") values.push(data.motive);
        if (data.kind === "method") values.push(data.method);
      }
    }

    return values;
  }
}
