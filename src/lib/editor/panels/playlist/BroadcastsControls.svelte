<script lang="ts">
  import { clock } from '$lib/clock';
  import { formatSeconds } from '$lib/format';
  import { currentlyBroadcasting, type Broadcast } from '$lib/schema/playlist';

  import ManageBroadcastsModal from './broadcasts/ManageBroadcastsModal.svelte';
  import StartBroadcastModal from './broadcasts/StartBroadcastModal.svelte';
  import StopBroadcastModal from './broadcasts/StopBroadcastModal.svelte';

  interface Props {
    broadcasts: Broadcast[];
  }

  let { broadcasts = $bindable() }: Props = $props();

  let showManageBroadcastsModal = $state(false);
  let showStopBroadcastModal = $state(false);
  let showStartBroadcastModal = $state(false);

  let currentlyBroadcastingList = $derived(
    broadcasts.filter((broadcast) => currentlyBroadcasting(broadcast, clock.now))
  );
  let currentlyBroadcastingCount = $derived(currentlyBroadcastingList.length);
  let currentlyBroadcastingAny = $derived(currentlyBroadcastingCount > 0);

  let timeLeft = $derived.by(() => {
    const end = Math.min(
      ...currentlyBroadcastingList.map((broadcast) => broadcast.start + broadcast.duration)
    );
    return Math.max(0, Math.ceil((end - clock.now) / 1000));
  });

  let nextBroadcastList = $derived(
    broadcasts.filter((broadcast) => broadcast.start > clock.now).sort((a, b) => a.start - b.start)
  );

  let timeUntilNext = $derived.by(() => {
    if (nextBroadcastList.length === 0) return 0;

    return Math.max(0, Math.ceil((nextBroadcastList[0].start - clock.now) / 1000));
  });
  // only count down during the final hour before the broadcast starts
  let showTimeUntilNext = $derived(timeUntilNext > 0 && timeUntilNext < 60 * 60);

  let pastBroadcastCount = $derived(
    broadcasts.filter((broadcast) => broadcast.start + broadcast.duration <= clock.now).length
  );
  let futureBroadcastCount = $derived(
    broadcasts.filter((broadcast) => broadcast.start > clock.now).length
  );

  let broadcastsSummary = $derived(
    [
      { count: pastBroadcastCount, label: 'past' },
      { count: currentlyBroadcastingCount, label: 'current' },
      { count: futureBroadcastCount, label: 'future' }
    ]
      .filter(({ count }) => count > 0)
      .map(({ count, label }) => `${count} ${label}`)
      .join(', ')
  );

  function stopBroadcast() {
    const currentDate = Date.now();

    for (let broadcast of broadcasts) {
      if (currentlyBroadcasting(broadcast)) {
        broadcast.duration = currentDate - broadcast.start;
      }
    }
  }

  function startBroadcast(duration: number) {
    broadcasts.push({ start: Date.now(), duration });
  }
</script>

<div class="control-buttons">
  <button class="button" onclick={() => (showManageBroadcastsModal = true)}>
    {#if broadcasts.length > 0}
      <div>
        <i class="bi bi-calendar" aria-hidden="true"></i>
        Change broadcasts
      </div>

      <div class="hint">
        {broadcastsSummary}
      </div>
    {:else}
      <div>
        <i class="bi bi-calendar" aria-hidden="true"></i>
        Schedule broadcast
      </div>
    {/if}
  </button>

  {#if currentlyBroadcastingAny}
    <button class="button danger" onclick={() => (showStopBroadcastModal = true)}>
      <div>
        <i class="bi bi-stop-fill" aria-hidden="true"></i>
        Stop broadcast now
      </div>

      <div class="hint">
        {#if currentlyBroadcastingCount > 1}
          Multiple broadcasts
        {:else}
          <span class="hint-countdown">
            {formatSeconds(timeLeft)} left
          </span>
        {/if}
      </div>
    </button>
  {:else}
    <button class="button" onclick={() => (showStartBroadcastModal = true)}>
      <div>
        <i class="bi bi-broadcast" aria-hidden="true"></i>
        Start broadcast now
      </div>

      {#if showTimeUntilNext}
        <div class="hint">
          <span class="hint-countdown">
            will start in {formatSeconds(timeUntilNext)}
          </span>
        </div>
      {/if}
    </button>
  {/if}
</div>

<ManageBroadcastsModal
  bind:showModal={showManageBroadcastsModal}
  {broadcasts}
  saveBroadcasts={(newBroadcasts) => (broadcasts = newBroadcasts)}
/>
<StopBroadcastModal bind:showModal={showStopBroadcastModal} {stopBroadcast} />
<StartBroadcastModal bind:showModal={showStartBroadcastModal} {startBroadcast} />

<style>
  .control-buttons {
    display: flex;
    gap: 4px;

    padding: 6px;
  }

  .control-buttons > .button {
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  .hint {
    font-size: 0.8em;
  }

  .hint-countdown {
    font-variant-numeric: tabular-nums;
  }
</style>
