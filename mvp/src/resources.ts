// resources.ts
import { ImageSource, Loader } from "excalibur";
import detective from "./Assets/PI.png"; // replace this
import upper from "./Assets/StreetUpper.png";
import lower from "./Assets/StreetLower.png";
import barUpper from "./Assets/BarUpper.png";
import barLower from "./Assets/BarLower.png";
import PIofficeUpper from "./Assets/PIofficeUpper.png";
import PIofficeLower from "./Assets/PIofficeLower.png";
import warehouseUpper from "./Assets/warehouseUpper.png";
import warehouseLower from "./Assets/warehouseLower.png";
import npcChef from "./Assets/chef.png";

export const Resources = {
  detective: new ImageSource(detective),
  upper: new ImageSource(upper),
  lower: new ImageSource(lower),
  barUpper: new ImageSource(barUpper),
  barLower: new ImageSource(barLower),
  PIofficeUpper: new ImageSource(PIofficeUpper),
  PIofficeLower: new ImageSource(PIofficeLower),
  warehouseUpper: new ImageSource(warehouseUpper),
  warehouseLower: new ImageSource(warehouseLower),
  npcChef: new ImageSource(npcChef),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
