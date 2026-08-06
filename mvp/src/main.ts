// main.ts
import { Detective } from "./Actors/detective";
import { StaticMap } from "./Actors/staticMap";
import { initializeGlobalEvents } from "./Lib/GlobalEvents";
import { initializeInputMappings } from "./Lib/InputMapper";
import { loader, Resources } from "./resources";
import "./style.css";

import { Engine, DisplayMode, vec } from "excalibur";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
});

await game.start(loader);
initializeInputMappings(game);
initializeGlobalEvents();
game.add(new Detective(vec(7, 12)));

game.add(
  new StaticMap({
    width: 640,
    height: 320,
    walls: [
      { pos: vec(4, 8), dims: vec(1, 2) },
      { pos: vec(5, 7) },
      { pos: vec(25, 4) },
      { pos: vec(29, 7) },
      { pos: vec(23, 5) },
      { pos: vec(6, 8), dims: vec(7, 2) },
      { pos: vec(13, 8), dims: vec(2, 1) },
      { pos: vec(16, 9), dims: vec(2, 3) },
      { pos: vec(15, 6), dims: vec(8, 2) },
      { pos: vec(24, 5), dims: vec(1, 3) },
      { pos: vec(26, 5), dims: vec(2, 3) },
      { pos: vec(25, 9), dims: vec(2, 3) },
      { pos: vec(28, 8), dims: vec(1, 2) },
      { pos: vec(30, 8), dims: vec(4, 2) },
      { pos: vec(34, 10), dims: vec(1, 9) },
      { pos: vec(3, 10), dims: vec(1, 9) },
      { pos: vec(4, 19), dims: vec(30, 1) },
    ],
    upper: Resources.upper.toSprite(),
    lower: Resources.lower.toSprite(),
    zIndex: 0,
  }),
);
