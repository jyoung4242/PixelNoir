import { Engine, Keys, Vector } from "excalibur";
import { GlobalEvents } from "./GlobalEvents";

export function initializeInputMappings(game: Engine) {
  // NPC Interaction mapping
  game.inputMapper.on(
    ({ keyboard }) => {
      if (keyboard.wasPressed(Keys.Space)) {
        return true;
      }
      return false;
    },
    () => {
      GlobalEvents.emit("interact");
    },
  );

  // Movement mapping
  game.inputMapper.on(
    ({ keyboard }) => {
      // Check if movement keys are currently held
      const isHoldingRight = keyboard.isHeld(Keys.ArrowRight) || keyboard.isHeld(Keys.D);
      const isHoldingLeft = keyboard.isHeld(Keys.ArrowLeft) || keyboard.isHeld(Keys.A);
      const isHoldingUp = keyboard.isHeld(Keys.ArrowUp) || keyboard.isHeld(Keys.W);
      const isHoldingDown = keyboard.isHeld(Keys.ArrowDown) || keyboard.isHeld(Keys.S);

      if (isHoldingRight) return new Vector(1, 0);
      if (isHoldingLeft) return new Vector(-1, 0);
      if (isHoldingUp) return new Vector(0, -1);
      if (isHoldingDown) return new Vector(0, 1);

      // Check if key was JUST released this frame
      const wasReleasedRight = keyboard.wasReleased(Keys.ArrowRight) || keyboard.wasReleased(Keys.D);
      const wasReleasedLeft = keyboard.wasReleased(Keys.ArrowLeft) || keyboard.wasReleased(Keys.A);
      const wasReleasedUp = keyboard.wasReleased(Keys.ArrowUp) || keyboard.wasReleased(Keys.W);
      const wasReleasedDown = keyboard.wasReleased(Keys.ArrowDown) || keyboard.wasReleased(Keys.S);

      if (wasReleasedRight || wasReleasedLeft || wasReleasedUp || wasReleasedDown) {
        return Vector.Zero; // Signal stop / idle
      }

      return false; // No relevant input change
    },
    dir => {
      GlobalEvents.emit("player-move", dir);
    },
  );
}
