<script lang="ts">
  import { onMount } from 'svelte';
  import { OutClick } from 'svelte-outclick';

  import { clock, clockMode, type ClockMode } from '#lib/clock.js';
  import { timeZone } from '#lib/editor/settings.js';
  import {
    formatClockDate,
    formatClockTime,
    formatSeconds,
    secondsToNextHour
  } from '#lib/format.js';

  // prevent server-side rendering
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  const now = $derived(new Date(clock.now));
  const time = $derived(formatClockTime(now, $timeZone));
  const date = $derived(formatClockDate(now, $timeZone));
  const countdown = $derived(formatSeconds(secondsToNextHour(now, $timeZone)));

  let showMenu = $state(false);
  let menuButton: HTMLButtonElement | null = $state(null);

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function setMode(value: ClockMode) {
    $clockMode = value;
    showMenu = false;
  }
</script>

{#if mounted}
  <div class="clock dropdown-container">
    <button
      class="button transparent menu"
      class:inverted={showMenu}
      onclick={toggleMenu}
      bind:this={menuButton}
    >
      {#if $clockMode === 'countdownToNextHour'}
        <span class="clock-text">
          <span class="clock-time">{countdown}</span>
          <span class="clock-date">to next hour</span>
        </span>
      {:else}
        <span class="clock-text">
          <span class="clock-time">{time}</span>
          <span class="clock-date">{date}</span>
        </span>
      {/if}

      <i class="bi bi-chevron-down clock-chevron" aria-hidden="true"></i>
    </button>

    {#if showMenu}
      <OutClick onOutClick={() => (showMenu = false)} excludeElements={menuButton}>
        <div class="dropdown-menu">
          <button
            class="button transparent align-left"
            class:inverted={$clockMode === 'clock'}
            onclick={() => setMode('clock')}
          >
            <i class="bi bi-clock" aria-hidden="true"></i>
            Clock
          </button>
          <button
            class="button transparent align-left"
            class:inverted={$clockMode === 'countdownToNextHour'}
            onclick={() => setMode('countdownToNextHour')}
          >
            <i class="bi bi-hourglass-split" aria-hidden="true"></i>
            Countdown to next hour
          </button>
        </div>
      </OutClick>
    {/if}
  </div>
{/if}

<style>
  .clock {
    margin-left: 10px;
    margin-right: 10px;
  }

  .button.menu {
    gap: 5px;

    padding: 4px 10px;
  }

  .clock-text {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .clock-time {
    font-variant-numeric: tabular-nums;
    font-size: 1.1em;
  }

  .clock-date {
    font-size: 0.75em;
    color: #666;
  }

  .button.inverted .clock-date {
    color: #ccc;
  }

  .clock-chevron {
    font-size: 0.5em;
  }

  .dropdown-menu {
    min-width: 200px;
  }
</style>
