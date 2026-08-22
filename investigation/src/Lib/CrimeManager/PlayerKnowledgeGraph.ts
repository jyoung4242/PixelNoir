// PlayerKnowledgeGraph.ts
import { Graph, Node } from "excalibur";
import { CrimeGraph } from "./CrimeGraph";
import { CrimeGraphNodeData, FactNodeData } from "./CrimeGraphTypes";
import { DiscoverySource, Fact } from "./CrimeTypes";

export interface DiscoveredFactEntry {
  fact: Fact;
  discoveredAt: number; // Date.now() timestamp; swap for a turn/step counter if the game tracks that instead
  source: DiscoverySource;
}

/**
 * Player-facing subset of the master CrimeGraph. Contains ONLY nodes/edges tied
 * to facts the player has actually discovered. Never contains ground truth the
 * player hasn't earned - do not read from CrimeGraph directly for UI purposes,
 * read from here instead.
 */
export class PlayerKnowledgeGraph {
  private readonly masterGraph: CrimeGraph;
  private readonly graph = new Graph<CrimeGraphNodeData>();

  private readonly personNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private readonly factNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private readonly entityNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private crimeNode?: Node<CrimeGraphNodeData>;

  private readonly discoveredFacts = new Map<string, DiscoveredFactEntry>();

  public constructor(masterGraph: CrimeGraph) {
    this.masterGraph = masterGraph;
  }

  // --- Queries ---

  public isFactKnown(factId: string): boolean {
    return this.discoveredFacts.has(factId);
  }

  public getDiscoveredFact(factId: string): DiscoveredFactEntry | undefined {
    return this.discoveredFacts.get(factId);
  }

  public getDiscoveredFacts(): DiscoveredFactEntry[] {
    return Array.from(this.discoveredFacts.values());
  }

  public getDiscoveredFactsForPerson(personId: string): DiscoveredFactEntry[] {
    return this.getDiscoveredFacts().filter(entry => entry.fact.subjectId === personId);
  }

  public getGraph(): Graph<CrimeGraphNodeData> {
    return this.graph;
  }

  public getPersonNode(personId: string): Node<CrimeGraphNodeData> | undefined {
    return this.personNodes.get(personId);
  }

  // --- Discovery entry points ---

  /**
   * Reveal a fact to the player. Mirrors the fact's subject/entity nodes and
   * the edges connecting them from the master graph into the player's graph.
   * Returns false (no-op) if the fact was already known or doesn't exist in
   * the master graph.
   */
  public discoverFact(fact: Fact, source: DiscoverySource): boolean {
    if (this.discoveredFacts.has(fact.id)) {
      return false;
    }

    const masterFactNode = this.masterGraph.getFactNode(fact.id);
    if (!masterFactNode) {
      console.warn(`PlayerKnowledgeGraph: fact "${fact.id}" not found in master graph.`);
      return false;
    }

    this.discoveredFacts.set(fact.id, { fact, discoveredAt: Date.now(), source });

    const factNode = this.getOrCreateFactNode(fact.id, masterFactNode.data as FactNodeData);

    // Connect fact to its subject (person) or, if crime-level (e.g. method), to CRIME
    if (fact.subjectId) {
      const personNode = this.mirrorPersonNode(fact.subjectId);
      if (personNode) {
        this.addEdgeIfMissing(personNode, factNode);
      }
    } else {
      const crimeNode = this.mirrorCrimeNode();
      if (crimeNode) {
        this.addEdgeIfMissing(crimeNode, factNode);
      }
    }

    // Mirror whatever entity node(s) this fact points to in the master graph
    // (location / time / motive / method), and connect fact -> entity here too.
    for (const edge of this.masterGraph.getGraph().edges) {
      if (edge.source === masterFactNode) {
        const entityNode = this.mirrorEntityNode(edge.target);
        if (entityNode) {
          this.addEdgeIfMissing(factNode, entityNode);
        }
      }
    }

    return true;
  }

  /**
   * Convenience for discovering several facts at once (e.g. a single evidence
   * token that reveals a bundle of related facts).
   */
  public discoverFacts(facts: Fact[], source: DiscoverySource): number {
    let count = 0;
    for (const fact of facts) {
      if (this.discoverFact(fact, source)) count++;
    }
    return count;
  }

  public reset(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.personNodes.clear();
    this.factNodes.clear();
    this.entityNodes.clear();
    this.discoveredFacts.clear();
    this.crimeNode = undefined;
  }

  // --- Mirror helpers (copy-on-first-reference from masterGraph) ---

  private mirrorPersonNode(personId: string): Node<CrimeGraphNodeData> | undefined {
    const existing = this.personNodes.get(personId);
    if (existing) return existing;

    const masterNode = this.masterGraph.getPersonNode(personId);
    if (!masterNode) return undefined;

    const node = this.graph.addNode({ ...masterNode.data });
    this.personNodes.set(personId, node);
    return node;
  }

  private mirrorCrimeNode(): Node<CrimeGraphNodeData> | undefined {
    if (this.crimeNode) return this.crimeNode;

    const masterNode = this.masterGraph.getCrimeNode();
    if (!masterNode) return undefined;

    this.crimeNode = this.graph.addNode({ ...masterNode.data });
    return this.crimeNode;
  }

  private getOrCreateFactNode(factId: string, data: FactNodeData): Node<CrimeGraphNodeData> {
    const existing = this.factNodes.get(factId);
    if (existing) return existing;

    const node = this.graph.addNode({ ...data });
    this.factNodes.set(factId, node);
    return node;
  }

  private mirrorEntityNode(masterEntityNode: Node<CrimeGraphNodeData>): Node<CrimeGraphNodeData> | undefined {
    const key = this.entityKey(masterEntityNode.data);
    if (!key) return undefined;

    const existing = this.entityNodes.get(key);
    if (existing) return existing;

    const node = this.graph.addNode({ ...masterEntityNode.data });
    this.entityNodes.set(key, node);
    return node;
  }

  private entityKey(data: CrimeGraphNodeData): string | undefined {
    switch (data.kind) {
      case "location":
        return `location:${data.name}`;
      case "time":
        return `time:${data.value}`;
      case "motive":
        return `motive:${data.motive}`;
      case "method":
        return `method:${data.method}`;
      default:
        return undefined;
    }
  }

  private addEdgeIfMissing(source: Node<CrimeGraphNodeData>, target: Node<CrimeGraphNodeData>): void {
    for (const edge of this.graph.edges) {
      if (edge.source === source && edge.target === target) return;
    }
    this.graph.addEdge(source, target, { directed: true });
  }
}
