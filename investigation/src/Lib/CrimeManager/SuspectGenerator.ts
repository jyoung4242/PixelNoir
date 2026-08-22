import { Person, SuspectProfile, SuspectRole } from "./CrimeTypes";

export class SuspectGenerator {
  public generate(count: number): SuspectProfile[] {
    const people = this.generatePeople(count);

    const roles = this.generateRoles(count);

    return people.map((person, index) => ({
      person,

      role: roles[index],
    }));
  }

  private generateRoles(count: number): SuspectRole[] {
    if (count !== 5) {
      throw new Error("Current generator expects 5 suspects.");
    }

    return this.shuffle(["culprit", "rival", "misleading", "witness", "background"]);
  }

  private generatePeople(count: number): Person[] {
    const names = [
      "Marcus Bellini",
      "Elena Rossi",
      "Giovanni Moretti",
      "Sofia Romano",
      "Luca Bianchi",
      "Isabella Conti",
      "Antonio Ricci",
      "Francesca Marino",
    ];

    const available = [...names];

    const people: Person[] = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);

      const name = available.splice(index, 1)[0];

      people.push({
        id: crypto.randomUUID(),

        name,
      });
    }

    return people;
  }

  private shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
}
