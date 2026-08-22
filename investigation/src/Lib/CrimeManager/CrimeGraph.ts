import { Graph, Node } from "excalibur";
import { CrimeTruth, Fact, Person } from "./CrimeTypes";
import { CrimeGraphNodeData } from "./CrimeGraphTypes";

export class CrimeGraph {
  private readonly graph = new Graph<CrimeGraphNodeData>();
  private readonly personNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private readonly factNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private readonly entityNodes = new Map<string, Node<CrimeGraphNodeData>>();
  private crimeNode?: Node<CrimeGraphNodeData>;

  public constructor(suspects: Person[], truth: CrimeTruth, facts: Fact[]) {
    this.addCrimeTruth(truth);
    this.addPeople(suspects);
    this.addFacts(truth, facts);
  }

  public getGraph(): Graph<CrimeGraphNodeData> {
    return this.graph;
  }

  public getPersonNode(personId: string): Node<CrimeGraphNodeData> | undefined {
    return this.personNodes.get(personId);
  }

  public getFactNode(factId: string): Node<CrimeGraphNodeData> | undefined {
    return this.factNodes.get(factId);
  }

  public getCrimeNode(): Node<CrimeGraphNodeData> | undefined {
    return this.crimeNode;
  }

  private addCrimeTruth(truth: CrimeTruth): void {
    this.crimeNode = this.graph.addNode({
      kind: "crime",
      crimeId: truth.event.type,
      title: `The ${truth.event.type} at ${truth.event.location}`,
    });

    const locationNode = this.getOrCreateNode(`location:${truth.event.location}`, {
      kind: "location",
      name: truth.event.location,
    });

    const timeNode = this.getOrCreateNode(`time:${truth.event.time}`, {
      kind: "time",
      value: truth.event.time,
    });

    const methodNode = this.getOrCreateNode(`method:${truth.method}`, {
      kind: "method",
      method: truth.method,
    });

    this.graph.addEdge(this.crimeNode, locationNode, { directed: true });
    this.graph.addEdge(this.crimeNode, timeNode, { directed: true });
    this.graph.addEdge(this.crimeNode, methodNode, { directed: true });
  }

  private addPeople(suspects: Person[]): void {
    for (const suspect of suspects) {
      const node = this.graph.addNode({
        kind: "person",
        personId: suspect.id,
        name: suspect.name,
      });

      this.personNodes.set(suspect.id, node);
    }
  }

  // CrimeGraph.ts (addFacts excerpt)
  private addFacts(truth: CrimeTruth, facts: Fact[]): void {
    for (const fact of facts) {
      const factNode = this.graph.addNode({
        kind: "fact",
        factId: fact.id,
        factType: fact.type,
        relation: fact.relation,
        description: fact.description,
      });

      this.factNodes.set(fact.id, factNode);

      if (fact.subjectId) {
        const personNode = this.personNodes.get(fact.subjectId);
        if (personNode) {
          this.graph.addEdge(personNode, factNode, { directed: true });
        }
      } else if (this.crimeNode) {
        // Connect crime-level facts (like method) directly to the CRIME node
        this.graph.addEdge(this.crimeNode, factNode, { directed: true });
      }

      const entityNode = this.getOrCreateEntityNode(fact, truth);
      if (entityNode) {
        this.graph.addEdge(factNode, entityNode, { directed: true });
      }
    }
  }

  // CrimeGraph.ts
  private getOrCreateEntityNode(fact: Fact, truth: CrimeTruth): Node<CrimeGraphNodeData> | undefined {
    switch (fact.type) {
      case "motive":
        return this.getOrCreateNode(`motive:${fact.value}`, {
          kind: "motive",
          motive: fact.value as any,
        });

      case "location":
      case "opportunity":
        return this.getOrCreateNode(`location:${fact.value}`, {
          kind: "location",
          name: fact.value,
        });

      case "timeline":
        return this.getOrCreateNode(`time:${fact.value}`, {
          kind: "time",
          value: fact.value,
        });

      case "method":
        return this.getOrCreateNode(`method:${fact.value}`, {
          kind: "method",
          method: fact.value,
        });

      case "relationship":
        // Do not generate entity nodes for generic background relationships
        return undefined;
    }
  }

  private getOrCreateNode(key: string, data: CrimeGraphNodeData): Node<CrimeGraphNodeData> {
    const existing = this.entityNodes.get(key);
    if (existing) {
      return existing;
    }

    const node = this.graph.addNode(data);
    this.entityNodes.set(key, node);
    return node;
  }

  public log(): void {
    console.group("%cCRIME GRAPH", "font-weight: bold; font-size: 16px;");
    console.log("Nodes:", this.graph.nodes.size);
    console.log("Edges:", this.graph.edges.size);

    console.group("Nodes");
    for (const node of this.graph.nodes.values()) {
      console.log(node.id, node.data);
    }
    console.groupEnd();

    console.group("Edges");
    for (const edge of this.graph.edges) {
      console.log(`${this.describeNode(edge.source)} -> ${this.describeNode(edge.target)}`);
    }
    console.groupEnd();

    console.groupEnd();
  }

  private describeNode(node: Node<CrimeGraphNodeData>): string {
    const data = node.data;
    switch (data.kind) {
      case "crime":
        return `CRIME: ${data.title}`;
      case "person":
        return `PERSON: ${data.name}`;
      case "fact":
        return `FACT [${data.relation}]: ${data.description}`;
      case "location":
        return `LOCATION: ${data.name}`;
      case "time":
        return `TIME: ${data.value}`;
      case "motive":
        return `MOTIVE: ${data.motive}`;
      case "method":
        return `METHOD: ${data.method}`;
    }
  }
}
