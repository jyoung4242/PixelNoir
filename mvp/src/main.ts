// main.ts
import { Detective } from "./Actors/detective";
import { initializeGlobalEvents } from "./Lib/GlobalEvents";
import { initializeInputMappings } from "./Lib/InputMapper";
import { loader } from "./resources";
import { Bar } from "./Scenes/Bar";
import { OverWorld } from "./Scenes/Overworld";
import { PIOffice } from "./Scenes/PIOffice";
import { Warehouse } from "./Scenes/Warehouse";
//@ts-expect-error
import "./style.css";

import { Engine, DisplayMode, vec, FadeInOut, Color, Vector, PreUpdateEvent } from "excalibur";
import { TransitionContext } from "./types";
import { InitializeGameNPCs, npcManager } from "./Lib/NPCManager";
import { ClockManager } from "./Lib/ClockManager";
import { StoryResolver, StoryStore } from "./Lib/StoryPoints";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  backgroundColor: Color.Black,
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
InitializeGameNPCs();

export const clockManager = new ClockManager();
export const storyPoints = new StoryStore();
export const storyResolver = new StoryResolver(storyPoints);

export const player: Detective = new Detective(vec(5, 5));
Object.assign(game.currentScene, { name: "root" });
game.goToScene<TransitionContext>("Overworld", { sceneActivationData: { player, facing: Vector.Down, leavingScene: "root" } });

const preUpdateHandler = (evt: PreUpdateEvent<Engine>) => {
  clockManager.update(evt.elapsed);
  // console.log(clockManager.clock.timeString);

  npcManager.updateNPCs(
    evt.elapsed,
    clockManager.clock.timeString,
    new Set(), // Story points
    game.currentScene,
    game.currentSceneName,
  );
};

game.on("preupdate", preUpdateHandler);
