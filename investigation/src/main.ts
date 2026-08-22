// main.ts
import { CrimeManager } from "./Lib/CrimeManager/CrimeManager";
import "./style.css";

import { Engine, DisplayMode, KeyEvent, Keys } from "excalibur";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
});

await game.start();

let cm = new CrimeManager();
cm.generateCrime();
cm.listFacts();
cm.listSuspects();
cm.printSolvability();

game.input.keyboard.on("press", (k: KeyEvent) => {
  if (k.key == Keys.Key1) {
    let fact = window.prompt("enter id key");
    if (typeof fact != "string") return;
    cm.discoverFactById(fact);
  } else if (k.key == Keys.Key2) {
    let sus = window.prompt("enter suspect");
    if (typeof sus != "string") return;
    cm.interrogateSuspect(sus);
  } else if (k.key == Keys.Key3) {
    cm.printPlayerKnowledge();
  }
});
