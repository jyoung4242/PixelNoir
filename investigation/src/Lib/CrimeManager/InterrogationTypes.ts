// InterrogationTypes.ts

export type VariableType = "location" | "time" | "motive" | "method" | "person";

export interface QuestionTemplate {
  id: string;
  category: "timeline" | "opportunity" | "motive" | "method";
  templateText: string; // e.g., "Where were you around {time}?"
  requiredVariables: VariableType[]; // Variables needed to instantiate option
  revealsFactId: string; // Fact ID revealed upon asking
}

export interface DialogueOption {
  templateId: string;
  displayText: string; // "Where were you around 9:00 PM?"
  revealsFactId: string;
}

export interface SuspectDialogueState {
  personId: string;
  discoveredVariables: Map<VariableType, Set<string>>; // Variables known for this suspect
  askedFactIds: Set<string>; // Facts already unlocked via conversation
}
