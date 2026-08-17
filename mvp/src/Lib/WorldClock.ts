export interface WorldClockOptions {
  initialHour?: number;
  initialMinute?: number;
  /** Real-time minutes required for a full 24-hour game cycle. Default: 24 */
  realMinutesPerDay?: number;
}

export class WorldClock {
  private totalGameSeconds: number = 0;
  private timeScale: number;
  public isPaused: boolean = false;
  public dayCount: number = 1;

  private static readonly SECONDS_PER_DAY = 86400; // 24 * 60 * 60
  private static readonly SECONDS_PER_HOUR = 3600;
  private static readonly SECONDS_PER_MINUTE = 60;

  constructor(options: WorldClockOptions = {}) {
    const { initialHour = 8, initialMinute = 0, realMinutesPerDay = 24 } = options;

    // Calculate time scale multiplier
    // 24 real minutes = 1440 real seconds.
    // 86400 game seconds / 1440 real seconds = 60x speed factor.
    const realSecondsPerDay = realMinutesPerDay * 60;
    this.timeScale = WorldClock.SECONDS_PER_DAY / realSecondsPerDay;

    this.setTime(initialHour, initialMinute);
  }

  /**
   * Advances game time based on frame delta time.
   * @param deltaTimeRealSeconds Seconds elapsed since last frame (e.g., 0.016 for 60fps)
   */
  public update(deltaTimeRealSeconds: number): void {
    if (this.isPaused) return;

    this.totalGameSeconds += deltaTimeRealSeconds * this.timeScale;

    // Handle day rollover
    if (this.totalGameSeconds >= WorldClock.SECONDS_PER_DAY) {
      this.totalGameSeconds %= WorldClock.SECONDS_PER_DAY;
      this.dayCount++;
    }
  }

  /**
   * Sets the clock to a specific time of day.
   */
  public setTime(hour: number, minute: number = 0): void {
    const h = Math.max(0, Math.min(23, hour));
    const m = Math.max(0, Math.min(59, minute));
    this.totalGameSeconds = h * WorldClock.SECONDS_PER_HOUR + m * WorldClock.SECONDS_PER_MINUTE;
  }

  // --- GETTERS FOR UI & TINT SYSTEMS ---

  /** 0.0 at 00:00:00 to 1.0 at 23:59:59. Ideal for Lerp calculations on your tint overlay. */
  public get normalizedTime(): number {
    return this.totalGameSeconds / WorldClock.SECONDS_PER_DAY;
  }

  /** Current 24-hour clock hour (0 - 23) */
  public get hour(): number {
    return Math.floor(this.totalGameSeconds / WorldClock.SECONDS_PER_HOUR);
  }

  /** Current clock minute (0 - 59) */
  public get minute(): number {
    return Math.floor((this.totalGameSeconds % WorldClock.SECONDS_PER_HOUR) / WorldClock.SECONDS_PER_MINUTE);
  }

  /** Formatted digital clock string (e.g., "08:05", "14:30") */
  public get timeString(): string {
    const hh = this.hour.toString().padStart(2, "0");
    const mm = this.minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }

  /** Formatted 12-hour clock string (e.g., "8:05 AM", "2:30 PM") */
  public get timeString12H(): string {
    const rawHour = this.hour;
    const displayHour = rawHour % 12 === 0 ? 12 : rawHour % 12;
    const period = rawHour >= 12 ? "PM" : "AM";
    const mm = this.minute.toString().padStart(2, "0");
    return `${displayHour}:${mm} ${period}`;
  }
}
