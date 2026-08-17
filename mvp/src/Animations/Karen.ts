import { ImageSource, SpriteSheet, Animation, AnimationStrategy } from "excalibur";
import { Resources } from "../resources";

// Create spritesheet using grid-based parsing
const spriteSheet = SpriteSheet.fromImageSource({
  image: Resources.npcKaren,
  grid: {
    rows: 4,
    columns: 4,
    spriteWidth: 32,
    spriteHeight: 32,
  },
});

// Frame graphics (with optional per-frame flipping)

const IdleDown_Frame0Graphic = spriteSheet.sprites[0];
const IdleRight_Frame0Graphic = spriteSheet.sprites[4];
const IdleUp_Frame0Graphic = spriteSheet.sprites[8];
const IdleLeft_Frame0Graphic = spriteSheet.sprites[12];
const WalkDown_Frame0Graphic = spriteSheet.sprites[0];
const WalkDown_Frame1Graphic = spriteSheet.sprites[1];
const WalkDown_Frame2Graphic = spriteSheet.sprites[2];
const WalkDown_Frame3Graphic = spriteSheet.sprites[3];
const WalkRight_Frame0Graphic = spriteSheet.sprites[4];
const WalkRight_Frame1Graphic = spriteSheet.sprites[5];
const WalkRight_Frame2Graphic = spriteSheet.sprites[6];
const WalkRight_Frame3Graphic = spriteSheet.sprites[7];
const WalkUp_Frame0Graphic = spriteSheet.sprites[8];
const WalkUp_Frame1Graphic = spriteSheet.sprites[9];
const WalkUp_Frame2Graphic = spriteSheet.sprites[10];
const WalkUp_Frame3Graphic = spriteSheet.sprites[11];
const walkLeft_Frame0Graphic = spriteSheet.sprites[12];
const walkLeft_Frame1Graphic = spriteSheet.sprites[13];
const walkLeft_Frame2Graphic = spriteSheet.sprites[14];
const walkLeft_Frame3Graphic = spriteSheet.sprites[15];

// Animation definitions

const IdleDownBase = new Animation({
  frames: [{ graphic: IdleDown_Frame0Graphic, duration: 125 }],
  strategy: AnimationStrategy.Loop,
});

const IdleDown = IdleDownBase;

const IdleRightBase = new Animation({
  frames: [{ graphic: IdleRight_Frame0Graphic, duration: 125 }],
  strategy: AnimationStrategy.Loop,
});

const IdleRight = IdleRightBase;

const IdleUpBase = new Animation({
  frames: [{ graphic: IdleUp_Frame0Graphic, duration: 125 }],
  strategy: AnimationStrategy.Loop,
});

const IdleUp = IdleUpBase;

const IdleLeftBase = new Animation({
  frames: [{ graphic: IdleLeft_Frame0Graphic, duration: 125 }],
  strategy: AnimationStrategy.Loop,
});

const IdleLeft = IdleLeftBase;

const WalkDownBase = new Animation({
  frames: [
    { graphic: WalkDown_Frame0Graphic, duration: 125 },
    { graphic: WalkDown_Frame1Graphic, duration: 125 },
    { graphic: WalkDown_Frame2Graphic, duration: 125 },
    { graphic: WalkDown_Frame3Graphic, duration: 125 },
  ],
  strategy: AnimationStrategy.Loop,
});

const WalkDown = WalkDownBase;

const WalkRightBase = new Animation({
  frames: [
    { graphic: WalkRight_Frame0Graphic, duration: 125 },
    { graphic: WalkRight_Frame1Graphic, duration: 125 },
    { graphic: WalkRight_Frame2Graphic, duration: 125 },
    { graphic: WalkRight_Frame3Graphic, duration: 125 },
  ],
  strategy: AnimationStrategy.Loop,
});

const WalkRight = WalkRightBase;

const WalkUpBase = new Animation({
  frames: [
    { graphic: WalkUp_Frame0Graphic, duration: 125 },
    { graphic: WalkUp_Frame1Graphic, duration: 125 },
    { graphic: WalkUp_Frame2Graphic, duration: 125 },
    { graphic: WalkUp_Frame3Graphic, duration: 125 },
  ],
  strategy: AnimationStrategy.Loop,
});

const WalkUp = WalkUpBase;

const walkLeftBase = new Animation({
  frames: [
    { graphic: walkLeft_Frame0Graphic, duration: 125 },
    { graphic: walkLeft_Frame1Graphic, duration: 125 },
    { graphic: walkLeft_Frame2Graphic, duration: 125 },
    { graphic: walkLeft_Frame3Graphic, duration: 125 },
  ],
  strategy: AnimationStrategy.Loop,
});

const walkLeft = walkLeftBase;

export const karenAnimations = {
  IdleDown,
  IdleRight,
  IdleUp,
  IdleLeft,
  WalkDown,
  WalkRight,
  WalkUp,
  walkLeft,
};
