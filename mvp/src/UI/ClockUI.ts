import { Color, Engine, Font, ScreenElement, toRadians, vec, Vector } from "excalibur";
import { Resources } from "../resources";
import { UILabel } from "./UILabel";
import { GlobalEvents } from "../Lib/GlobalEvents";

export class ClockUI extends ScreenElement {
  private disk: DayNightDisk;
  private hourHand: HourHand;
  private minHand: MinHand;
  private dayTracker: Daytracker;

  constructor() {
    super({
      pos: vec(690, 10),
      width: 512,
      height: 512,
      z: 1000,
    });
    this.graphics.use(Resources.clockCover.toSprite());

    this.disk = new DayNightDisk();
    this.hourHand = new HourHand();
    this.minHand = new MinHand();
    this.dayTracker = new Daytracker();

    this.addChild(this.disk);
    this.addChild(new Cog(vec(375, 340), 100, vec(0.65, 0.65)));
    this.addChild(new Cog(vec(150, 340), 50, vec(0.4, 0.4)));
    this.addChild(new ClockFace());
    this.addChild(this.hourHand);
    this.addChild(this.minHand);
    this.addChild(this.dayTracker);
  }

  onAdd(engine: Engine): void {
    this.scale = vec(0.2, 0.2);
  }

  onInitialize(engine: Engine): void {
    // Listen to time updates and rotate UI elements precisely
    GlobalEvents.on("clock-tick", ({ normalizedTime }) => {
      this.updateClockHands(normalizedTime);
    });
  }

  /**
   * Updates hand angles instantly based on normalized game time (0.0 to 1.0)
   */
  public updateClockHands(normalizedTime: number): void {
    const TWO_PI = Math.PI * 2;
    const HOUR_HAND_OFFSET = toRadians(54); // Adjusts default texture to point straight up to 12
    const MIN_HAND_OFFSET = toRadians(-45); // Adjusts default texture to point straight up to 12
    const DISC_OFFSET = toRadians(180);

    // 1. Day/Night Disc: 1 full rotation per 24 hours
    this.disk.rotation = normalizedTime * TWO_PI + DISC_OFFSET;

    // 2. Hour Hand: 2 full rotations per 24 hours + 54-degree offset
    this.hourHand.rotation = normalizedTime * 2 * TWO_PI + HOUR_HAND_OFFSET;

    // 3. Minute Hand: 24 full rotations per 24 hours
    // (If Minute hand also needs an offset, add + toRadians(...) here as well)
    this.minHand.rotation = normalizedTime * 24 * TWO_PI + MIN_HAND_OFFSET;
  }
}

class DayNightDisk extends ScreenElement {
  constructor() {
    super({
      pos: vec(256, 256),
      width: 512,
      height: 512,
      z: -2,
      anchor: Vector.Half,
    });
    this.graphics.use(Resources.dayNightDisc.toSprite());
  }
}

class HourHand extends ScreenElement {
  constructor() {
    super({
      pos: vec(256, 256),
      width: 512,
      height: 512,
      z: 5,
      anchor: Vector.Half,
    });
    this.graphics.use(Resources.hourHand.toSprite());
  }
}

class MinHand extends ScreenElement {
  constructor() {
    super({
      pos: vec(256, 256),
      width: 512,
      height: 512,
      z: 6,
      anchor: Vector.Half,
    });
    this.graphics.use(Resources.minHand.toSprite());
  }
}

class Daytracker extends UILabel {
  constructor() {
    super({
      pos: vec(220, 390),
      width: 100,
      height: 100,
      textOptions: { font: new Font({ size: 90, color: Color.Black }) },
      z: 5,
    });
    this.setText("1");
  }

  onInitialize(engine: Engine): void {
    GlobalEvents.on("day-changed", ({ day }) => {
      this.setText(`${day}`);
    });
  }
}

class Cog extends ScreenElement {
  constructor(
    pos: Vector,
    public spinspeed: number,
    scale: Vector,
  ) {
    super({ pos, z: 0, scale, anchor: Vector.Half });
    this.graphics.use(Resources.cog.toSprite());
  }

  onInitialize(engine: Engine): void {
    this.actions.repeatForever(ctx => ctx.rotateBy({ angleRadiansOffset: toRadians(1), duration: this.spinspeed }));
  }
}

class ClockFace extends ScreenElement {
  constructor() {
    super({
      z: 2,
    });
    this.graphics.use(Resources.clockFace.toSprite());
  }
}
