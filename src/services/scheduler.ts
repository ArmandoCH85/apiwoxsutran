import { Scheduler } from '../ports';

export class IntervalScheduler implements Scheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(callback: () => void, intervalMs: number): void {
    if (this.intervalId) {
      this.stop();
    }
    this.intervalId = setInterval(callback, intervalMs);
    // Allow process to exit even if timer is active
    this.intervalId.unref?.();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
