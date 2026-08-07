import { WorldClock } from "./WorldClock";
import { GlobalEvents } from "./GlobalEvents";

export class ClockManager {
  public clock: WorldClock;
  private lastHour: number = -1;
  private lastDay: number = 1;

  constructor() {
    this.clock = new WorldClock({ initialHour: 12, realMinutesPerDay: 24 });
  }

  public update(deltaMs: number) {
    const deltaSeconds = deltaMs / 1000;
    this.clock.update(deltaSeconds);

    // Emit tick for UI & Tint
    GlobalEvents.emit("clock-tick", {
      normalizedTime: this.clock.normalizedTime,
      timeString: this.clock.timeString,
    });

    // Hour change check
    if (this.clock.hour !== this.lastHour) {
      this.lastHour = this.clock.hour;
      GlobalEvents.emit("hour-changed", {
        hour: this.clock.hour,
        day: this.clock.dayCount,
      });
    }

    // Day change check
    if (this.clock.dayCount !== this.lastDay) {
      this.lastDay = this.clock.dayCount;
      GlobalEvents.emit("day-changed", { day: this.clock.dayCount });
    }
  }
}
