// InterrogationManager.ts
import { CrimeGraph } from "./CrimeGraph";
import { Fact, SuspectProfile } from "./CrimeTypes";
import { DialogueOption, QuestionTemplate, SuspectDialogueState, VariableType } from "./InterrogationTypes";

export class InterrogationManager {
  private templates: QuestionTemplate[] = [];
  private dialogueStates: Map<string, SuspectDialogueState> = new Map();
  private allFacts: Map<string, Fact> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  public initialize(profiles: SuspectProfile[], facts: Fact[], crimeLocation: string, crimeTime: string): void {
    this.allFacts.clear();
    this.dialogueStates.clear();

    for (const fact of facts) {
      this.allFacts.set(fact.id, fact);
    }

    // Initialize state for each suspect with base public knowledge
    for (const profile of profiles) {
      const state: SuspectDialogueState = {
        personId: profile.person.id,
        discoveredVariables: new Map([
          ["location", new Set([crimeLocation])],
          ["time", new Set([crimeTime])],
          ["person", new Set([profile.person.name])],
          ["motive", new Set()],
          ["method", new Set()],
        ]),
        askedFactIds: new Set(),
      };
      this.dialogueStates.set(profile.person.id, state);
    }
  }

  /**
   * Evaluates available question templates against the suspect's current known variables.
   */
  public getAvailableQuestions(personId: string): DialogueOption[] {
    const state = this.dialogueStates.get(personId);
    if (!state) return [];

    const options: DialogueOption[] = [];

    for (const template of this.templates) {
      // Find fact tied to this template for this suspect
      const fact = Array.from(this.allFacts.values()).find(
        f => f.subjectId === personId && f.id === template.revealsFactId && !state.askedFactIds.has(f.id),
      );

      if (!fact) continue;

      // Ensure all required template variables are known
      if (this.hasRequiredVariables(state, template.requiredVariables)) {
        const text = this.fillTemplate(template.templateText, state);
        options.push({
          templateId: template.id,
          displayText: text,
          revealsFactId: fact.id,
        });
      }
    }

    return options;
  }

  /**
   * Advances dialogue tree: reveals fact, logs response, and unlocks new variable values.
   */
  public askQuestion(personId: string, option: DialogueOption): { response: string; fact: Fact | undefined } {
    const state = this.dialogueStates.get(personId);
    const fact = this.allFacts.get(option.revealsFactId);

    if (!state || !fact) {
      return { response: "I have nothing to say about that.", fact: undefined };
    }

    // Mark fact as asked
    state.askedFactIds.add(fact.id);

    // Extract new variables revealed by this fact to expand future question templates
    this.extractVariablesFromFact(state, fact);

    return {
      response: `"${fact.description}"`,
      fact,
    };
  }

  // --- Helpers ---

  private registerDefaultTemplates(): void {
    this.templates = [
      {
        id: "t_timeline_base",
        category: "timeline",
        templateText: "Where were you around {time}?",
        requiredVariables: ["time"],
        revealsFactId: "", // Set per-fact during dynamic mapping
      },
      {
        id: "t_access_base",
        category: "opportunity",
        templateText: "Did you have access to {location} on the night of the incident?",
        requiredVariables: ["location"],
        revealsFactId: "",
      },
      {
        id: "t_motive_base",
        category: "motive",
        templateText: "Care to explain your connection or interest in this matter?",
        requiredVariables: [],
        revealsFactId: "",
      },
    ];
  }

  private hasRequiredVariables(state: SuspectDialogueState, required: VariableType[]): boolean {
    return required.every(v => (state.discoveredVariables.get(v)?.size ?? 0) > 0);
  }

  private fillTemplate(templateText: string, state: SuspectDialogueState): string {
    let text = templateText;
    for (const [varType, values] of state.discoveredVariables.entries()) {
      const firstVal = Array.from(values)[0] || "";
      text = text.replace(`{${varType}}`, firstVal);
    }
    return text;
  }

  private extractVariablesFromFact(state: SuspectDialogueState, fact: Fact): void {
    if (fact.type === "timeline") {
      state.discoveredVariables.get("time")?.add(fact.value);
    } else if (fact.type === "location" || fact.type === "opportunity") {
      state.discoveredVariables.get("location")?.add(fact.value);
    } else if (fact.type === "motive") {
      state.discoveredVariables.get("motive")?.add(fact.value);
    }
  }
}
