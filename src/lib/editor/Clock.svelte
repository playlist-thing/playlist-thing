<script lang="ts">
  import { onMount } from 'svelte';

  import { clock } from '$lib/clock';
  import { formatClockDate, formatClockTime } from '$lib/format';

  // prevent server-side rendering
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  const now = $derived(new Date(clock.now));
  const time = $derived(formatClockTime(now));
  const date = $derived(formatClockDate(now));
</script>

{#if mounted}
  <div class="clock">
    <div class="clock-time">{time}</div>
    <div class="clock-date">{date}</div>
  </div>
{/if}

<style>
  .clock {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding-left: 20px;
    padding-right: 20px;
  }

  .clock-time {
    font-variant-numeric: tabular-nums;
    font-size: 1.1em;
  }

  .clock-date {
    font-size: 0.75em;
    color: #666;
  }
</style>
