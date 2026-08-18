import { Actor, Color, Engine } from "excalibur";
import { AmbientLightComponent, DarknessComponent } from "../Lib/Lighting";
import { GlobalEvents } from "../Lib/GlobalEvents";

interface LightingKeyframe {
  /** Time in 24-hour decimal format (e.g. 18.5 = 18:30) */
  time: number;
  color: Color;
  ambientIntensity: number;
  darknessIntensity: number;
}

const LIGHTING_SCHEDULE: LightingKeyframe[] = [
  { time: 0.0, color: Color.fromHex("#060919"), ambientIntensity: 0.03, darknessIntensity: 0.95 },
  { time: 4.5, color: Color.fromHex("#0a0d24"), ambientIntensity: 0.05, darknessIntensity: 0.9 },
  { time: 5.5, color: Color.fromHex("#d96b52"), ambientIntensity: 0.25, darknessIntensity: 0.8 },
  { time: 6.5, color: Color.fromHex("#f4a261"), ambientIntensity: 0.55, darknessIntensity: 0.6 },
  { time: 8.0, color: Color.fromHex("#ffffff"), ambientIntensity: 0.1, darknessIntensity: 0.3 },
  { time: 16.0, color: Color.fromHex("#ffffff"), ambientIntensity: 0.1, darknessIntensity: 0.0 },
  { time: 17.0, color: Color.fromHex("#f1a208"), ambientIntensity: 0.4, darknessIntensity: 0.15 },
  { time: 18.0, color: Color.fromHex("#e76f51"), ambientIntensity: 0.5, darknessIntensity: 0.35 },
  { time: 19.0, color: Color.fromHex("#6b2d5c"), ambientIntensity: 0.6, darknessIntensity: 0.55 },
  { time: 20.25, color: Color.fromHex("#1d1e4e"), ambientIntensity: 0.1, darknessIntensity: 0.8 },
  { time: 22.0, color: Color.fromHex("#0c102b"), ambientIntensity: 0.05, darknessIntensity: 0.9 },
  { time: 24.0, color: Color.fromHex("#060919"), ambientIntensity: 0.03, darknessIntensity: 0.95 },
];

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function lerpColor(c1: Color, c2: Color, t: number): Color {
  return new Color(
    Math.round(lerp(c1.r, c2.r, t)),
    Math.round(lerp(c1.g, c2.g, t)),
    Math.round(lerp(c1.b, c2.b, t)),
    lerp(c1.a, c2.a, t),
  );
}

export class LightingActor extends Actor {
  darkness: DarknessComponent;
  ambient: AmbientLightComponent;

  constructor() {
    super();

    this.darkness = new DarknessComponent(Color.fromRGB(5, 5, 20), 0.9, Infinity, Infinity);
    this.ambient = new AmbientLightComponent(Color.fromHex("#d8e2ec"), 0.05);

    this.addComponent(this.darkness);
    this.addComponent(this.ambient);
  }

  onInitialize(engine: Engine): void {
    // Listen to continuous time ticks instead of hour snapshots
    GlobalEvents.on("clock-tick", ({ normalizedTime }) => {
      this.updateLightingContinuous(normalizedTime);
    });
  }

  private updateLightingContinuous(normalizedTime: number): void {
    // Convert 0.0-1.0 normalized time to 0.0-24.0 hour float
    const currentHour = normalizedTime * 24;

    // Find bounding keyframes
    let prevIndex = 0;
    for (let i = 0; i < LIGHTING_SCHEDULE.length - 1; i++) {
      if (currentHour >= LIGHTING_SCHEDULE[i].time) {
        prevIndex = i;
      }
    }

    const prevFrame = LIGHTING_SCHEDULE[prevIndex];
    const nextFrame = LIGHTING_SCHEDULE[prevIndex + 1];

    // Progress percentage between keyframes (0.0 to 1.0)
    const span = nextFrame.time - prevFrame.time;
    const progress = span > 0 ? (currentHour - prevFrame.time) / span : 0;

    // Interpolate parameters smoothly
    this.ambient.color = lerpColor(prevFrame.color, nextFrame.color, progress);
    this.ambient.intensity = lerp(prevFrame.ambientIntensity, nextFrame.ambientIntensity, progress);
    this.darkness.intensity = lerp(prevFrame.darknessIntensity, nextFrame.darknessIntensity, progress);
  }
}
