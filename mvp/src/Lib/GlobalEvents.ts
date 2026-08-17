import { EventEmitter, Vector } from "excalibur";

export interface GlobalEventMap {
  "player-move": Vector;
  // --- Cutscenes (Session 10 — CutsceneManager) ---
  "cutscene:started": { cutsceneId: string };
  "cutscene:ended": { cutsceneId: string };
}

export const GlobalEvents = new EventEmitter<GlobalEventMap>();
