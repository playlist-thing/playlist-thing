import { createSubscriber } from 'svelte/reactivity';
import { get } from 'svelte/store';

import localStorageStore from '#lib/localStorageStore.js';

export const clockSyncEnabled = localStorageStore('clockSyncEnabled', true);

/** Corrective offset in milliseconds added to the system clock. */
export const clockOffset = localStorageStore('clockOffset', 0);

/**
 * Reactive clock. `now` is milliseconds since the epoch, floored to the
 * current second, and updates exactly when the system second changes.
 *
 * The timer only runs while something reactive (an $effect, $derived or
 * template expression) is reading `now`, and stops when nothing is.
 */
export class Clock {
  #subscribe: () => void;

  // Set while the clock has subscribers, so an offset change can notify them.
  #update: (() => void) | null = null;

  // Set while the clock has subscribers, so an offset change can reschedule it.
  #reschedule: (() => void) | null = null;

  constructor() {
    this.#subscribe = createSubscriber((update) => {
      this.#update = update;

      let timeout: ReturnType<typeof setTimeout>;

      // Aim for the next real second boundary of the corrected clock.
      // Recomputed from Date.now() and the offset every time, so it never
      // drifts.
      const schedule = () => {
        clearTimeout(timeout);
        const delay = 1000 - mod(this.#corrected(Date.now()), 1000);
        timeout = setTimeout(tick, delay + 2); // +2ms to land just after rollover
      };
      const tick = () => {
        update();
        schedule();
      };
      schedule();
      this.#reschedule = schedule;

      // Browsers throttle timers in background tabs; resync on return.
      const onVisible = () => {
        if (!document.hidden) update();
      };
      document.addEventListener('visibilitychange', onVisible);

      return () => {
        this.#update = null;
        this.#reschedule = null;
        clearTimeout(timeout);
        document.removeEventListener('visibilitychange', onVisible);
      };
    });

    // React to offset changes, including ones from other browsing contexts.
    clockOffset.subscribe(() => {
      this.#reschedule?.();
      this.#update?.();
    });
  }

  /** Corrective offset in milliseconds added to the system clock. */
  get offset(): number {
    return get(clockOffset);
  }

  set offset(value: number) {
    clockOffset.set(value);
  }

  /** The given system timestamp shifted by the corrective offset. */
  #corrected(timestamp: number): number {
    return timestamp + get(clockOffset);
  }

  /** ms since epoch of the corrected clock, floored to the current second */
  get now(): number {
    this.#subscribe(); // registers this read as a dependency
    return Math.floor(this.#corrected(Date.now()) / 1000) * 1000;
  }
}

/** Non-negative remainder, unlike JavaScript's `%`. */
function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export const clock = new Clock();
