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

import clockCover from "./Assets/Clock/cosmetic cover sans cog.png";
import dayNightDisc from "./Assets/Clock/day_night_disck.png";
import hourHand from "./Assets/Clock/hour hand.png";
import minHand from "./Assets/Clock/min hand.png";
import cog from "./Assets/Clock/cog.png";
import clockFace from "./Assets/Clock/clock_face.png";

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
  clockCover: new ImageSource(clockCover),
  dayNightDisc: new ImageSource(dayNightDisc),
  hourHand: new ImageSource(hourHand),
  minHand: new ImageSource(minHand),
  cog: new ImageSource(cog),
  clockFace: new ImageSource(clockFace),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
