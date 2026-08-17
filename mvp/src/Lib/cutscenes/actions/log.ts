import { CutsceneContext } from "../CutScenes";

export const LogAction = async (args: Record<string, any>, ctx: CutsceneContext) => {
  const { message, level = "info" } = args;

  switch (level) {
    case "warn":
      console.warn(`[CutScene] ${message}`);
      break;
    case "error":
      console.error(`[CutScene] ${message}`);
      break;
    default:
      console.log(`[CutScene] ${message}`);
      break;
  }
};
