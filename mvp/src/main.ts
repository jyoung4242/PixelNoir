// main.ts
import { Detective } from "./Actors/detective";
import { StaticMap } from "./Actors/staticMap";
import { initializeGlobalEvents } from "./Lib/GlobalEvents";
import { initializeInputMappings } from "./Lib/InputMapper";
import { loader, Resources } from "./resources";
import { Bar } from "./Scenes/Bar";
import { OverWorld } from "./Scenes/Overworld";
import { PIOffice } from "./Scenes/PIOffice";
import { Warehouse } from "./Scenes/Warehouse";
//@ts-expect-error
import "./style.css";

import { Engine, DisplayMode, vec, FadeInOut, Color, Vector } from "excalibur";
import { TransitionContext } from "./types";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  scenes: {
    Overworld: {
      scene: new OverWorld(),
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    PIOffice: {
      scene: new PIOffice(),
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    Warehouse: {
      scene: new Warehouse(),
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    Bar: {
      scene: new Bar(),
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
  },
});

await game.start(loader);
initializeInputMappings(game);
initializeGlobalEvents();

export const player: Detective = new Detective(vec(5, 5));
Object.assign(game.currentScene, { name: "root" });
game.goToScene<TransitionContext>("Warehouse", { sceneActivationData: { player, facing: Vector.Down, leavingScene: "root" } });
