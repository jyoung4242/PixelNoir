export type ValueType = boolean | number | string;

export type ComparisonOp = "==" | "!=" | ">" | ">=" | "<" | "<=" | "IN" | "NOT_IN";

export interface StateCondition {
  key: string;
  op: ComparisonOp;
  value: ValueType | ValueType[];
}

export type StateChangeCallback = (key: string, newValue: ValueType, oldValue?: ValueType) => void;

export class StoryStore {
  private state = new Map<string, ValueType>();
  private listeners = new Set<StateChangeCallback>();

  get(key: string, defaultValue: ValueType = false): ValueType {
    return this.state.has(key) ? this.state.get(key)! : defaultValue;
  }

  getNumber(key: string, defaultValue = 0): number {
    const val = this.get(key, defaultValue);
    return typeof val === "number" ? val : defaultValue;
  }

  getBool(key: string, defaultValue = false): boolean {
    return Boolean(this.get(key, defaultValue));
  }

  set(key: string, value: ValueType): void {
    const oldValue = this.state.get(key);
    if (oldValue !== value) {
      this.state.set(key, value);
      this.listeners.forEach(cb => cb(key, value, oldValue));
    }
  }

  /**
   * Helper for numeric progression (e.g., quest stages, time increments, counters)
   */
  increment(key: string, delta = 1): number {
    const current = this.getNumber(key, 0);
    const next = current + delta;
    this.set(key, next);
    return next;
  }

  onChange(cb: StateChangeCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  serialize(): Record<string, ValueType> {
    return Object.fromEntries(this.state);
  }

  hydrate(data: Record<string, ValueType>): void {
    this.state = new Map(Object.entries(data));
  }
}

export class StoryResolver {
  constructor(private store: StoryStore) {}

  evaluateCondition(cond: StateCondition): boolean {
    const currentValue = this.store.get(cond.key, false);

    switch (cond.op) {
      case "==":
        return currentValue === cond.value;
      case "!=":
        return currentValue !== cond.value;
      case ">":
        return currentValue > cond.value;
      case ">=":
        return currentValue >= cond.value;
      case "<":
        return currentValue < cond.value;
      case "<=":
        return currentValue <= cond.value;
      case "IN":
        return Array.isArray(cond.value) && cond.value.includes(currentValue);
      case "NOT_IN":
        return Array.isArray(cond.value) && !cond.value.includes(currentValue);
      default:
        return false;
    }
  }

  /**
   * Evaluates an array of conditions.
   * 'ALL' acts as AND logic; 'ANY' acts as OR logic.
   */
  evaluateAll(conditions: StateCondition[], mode: "ALL" | "ANY" = "ALL"): boolean {
    if (conditions.length === 0) return true;

    if (mode === "ALL") {
      return conditions.every(c => this.evaluateCondition(c));
    } else {
      return conditions.some(c => this.evaluateCondition(c));
    }
  }
}
