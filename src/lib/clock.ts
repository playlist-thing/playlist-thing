import { createSubscriber } from 'svelte/reactivity';

/**
 * Reactive clock. `now` is milliseconds since the epoch, floored to the
 * current second, and updates exactly when the system second changes.
 *
 * The timer only runs while something reactive (an $effect, $derived or
 * template expression) is reading `now`, and stops when nothing is.
 */
export class Clock {
  #subscribe: () => void;

  constructor() {
    this.#subscribe = createSubscriber((update) => {
      let timeout: ReturnType<typeof setTimeout>;

      // Aim for the next real second boundary of the system clock.
      // Recomputed from Date.now() every time, so it never drifts.
      const schedule = () => {
        const delay = 1000 - (Date.now() % 1000);
        timeout = setTimeout(tick, delay + 2); // +2ms to land just after rollover
      };
      const tick = () => {
        update();
        schedule();
      };
      schedule();

      // Browsers throttle timers in background tabs; resync on return.
      const onVisible = () => {
        if (!document.hidden) update();
      };
      document.addEventListener('visibilitychange', onVisible);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener('visibilitychange', onVisible);
      };
    });
  }

  /** ms since epoch, floored to the current second */
  get now(): number {
    this.#subscribe(); // registers this read as a dependency
    return Math.floor(Date.now() / 1000) * 1000;
  }
}

export const clock = new Clock();
