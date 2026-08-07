import { Color, ScreenElement, Vector } from "excalibur";
import { AmbientLightComponent, DarknessComponent } from "../Lib/Lighting";

export class LightingActor extends ScreenElement {
  darkness: DarknessComponent;
  ambient: AmbientLightComponent;
  constructor() {
    super({
      width: 800,
      height: 600,
      pos: Vector.Zero,
      color: Color.Transparent,
      z: 10,
    });

    this.darkness = new DarknessComponent(
      Color.fromRGB(5, 5, 20),
      0.9,
      this.width, // ← match your room width
      this.height, // ← match your room height
    );
    this.ambient = new AmbientLightComponent(
      Color.fromHex("#d8e2ec"), // cool ambient
      0.05,
    );
    this.addComponent(this.darkness);
    this.addComponent(this.ambient);
    console.log(this.darkness);
  }
}
