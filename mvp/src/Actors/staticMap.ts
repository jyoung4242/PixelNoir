import {
  Actor,
  Entity,
  ColliderComponent,
  Vector,
  TransformComponent,
  BodyComponent,
  CollisionType,
  Shape,
  vec,
  Sprite,
  Color,
} from "excalibur";
import { DarknessComponent, AmbientLightComponent } from "../Lib/Lighting";

interface StaticMapConfig {
  width: number;
  height: number;
  walls: WallConfig[];
  upper: Sprite | null;
  lower: Sprite | null;
  zIndex: number;
}

interface WallConfig {
  pos: Vector;
  dims?: Vector;
}

export class StaticMap extends Actor {
  darkness: DarknessComponent | undefined = undefined;
  ambient: AmbientLightComponent | undefined = undefined;
  upper: StaticMap | undefined = undefined;
  constructor(public config: StaticMapConfig) {
    super({ width: config.width, height: config.height, z: config.zIndex, anchor: vec(0, 0) });

    if (config.lower && config.lower instanceof Sprite) {
      this.graphics.use(config.lower);
    } else if (!config.lower && config.upper && config.upper instanceof Sprite) {
      this.graphics.use(config.upper);
    }

    if (config.lower && config.upper && config.lower instanceof Sprite && config.upper instanceof Sprite) {
      this.upper = new StaticMap({
        width: config.width,
        height: config.height,
        walls: [],
        upper: config.upper,
        lower: null,
        zIndex: config.zIndex + 2,
      });
      this.addChild(this.upper);
    }
  }

  onInitialize(engine: ex.Engine) {
    for (let wallPos of this.config.walls) {
      let wall = new Wall(wallPos);
      this.addChild(wall);
    }

    if (this.upper == undefined) {
      this.darkness = new DarknessComponent(Color.fromRGB(5, 5, 20), 0.9);
      this.ambient = new AmbientLightComponent(
        Color.fromHex("#d8e2ec"), // cool ambient
        0.05,
      );
    }
  }
}

class Wall extends Entity {
  pos: Vector;
  constructor(config: WallConfig) {
    super();
    this.pos = config.pos;
    let width = config.dims?.x ? config.dims.x * 16 : 16;
    let height = config.dims?.y ? config.dims.y * 16 : 16;
    this.addComponent(new TransformComponent());
    this.addComponent(new ColliderComponent(Shape.Box(width, height, vec(0, 0))));
    this.addComponent(new BodyComponent());
    this.addTag("Wall");
  }

  onInitialize(engine: ex.Engine) {
    let tc = this.get(TransformComponent);
    if (tc) {
      tc.pos = vec(this.pos.x * 16, this.pos.y * 16);
    }

    let bc = this.get(BodyComponent);
    if (bc) {
      bc.collisionType = CollisionType.Fixed;
    }
  }
}
