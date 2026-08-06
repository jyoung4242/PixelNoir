// resources.ts
import { ImageSource, Loader } from "excalibur";
import detective from "./Assets/PI.png"; // replace this
import upper from "./Assets/StreetUpper.png";
import lower from "./Assets/StreetLower.png";

export const Resources = {
  detective: new ImageSource(detective),
  upper: new ImageSource(upper),
  lower: new ImageSource(lower),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
