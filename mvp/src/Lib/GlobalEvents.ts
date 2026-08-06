import * as ex from "excalibur";

export const GlobalEvents = new ex.EventEmitter<CustomEvents>();
export type CustomEvents = {
  "player-move": ex.Vector;
};

export function initializeGlobalEvents() {
  // Example of how to listen for a global event
  GlobalEvents.on("player-move", vector => {});
}
