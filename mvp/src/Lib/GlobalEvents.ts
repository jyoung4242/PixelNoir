import { EventEmitter } from "excalibur";

export const GlobalEvents = new EventEmitter<CustomEvents>();
export type CustomEvents = {
  "player-move": ex.Vector;
  "clock-tick": { normalizedTime: number; timeString: string };
  "hour-changed": { hour: number; day: number };
  "day-changed": { day: number };
  "cutscene:started": { cutsceneId: string };
  "cutscene:ended": { cutsceneId: string };
};

export function initializeGlobalEvents() {
  GlobalEvents.on("player-move", vector => {
    // Player movement logic
  });

  // Listener for screen overlay tinting
  GlobalEvents.on("clock-tick", ({ normalizedTime }) => {
    // updateTintOverlay(normalizedTime);
  });

  // Listener for schedule events (e.g., shop closure at 20:00)
  GlobalEvents.on("hour-changed", ({ day, hour }) => {
    console.log(`[CLOCK] Day ${day} - Hour ${hour}:00`);
  });
}
