<script lang="ts">
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

  let currentlyBroadcastingAny = $derived(broadcasts.some(currentlyBroadcasting));

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
      <i class="bi bi-calendar" aria-hidden="true"></i>Change broadcasts
    {:else}
      <i class="bi bi-calendar" aria-hidden="true"></i>Schedule broadcast
    {/if}
  </button>

  {#if currentlyBroadcastingAny}
    <button class="button danger" onclick={() => (showStopBroadcastModal = true)}>
      <div>
        <i class="bi bi-stop-fill" aria-hidden="true"></i>Stop broadcast now
      </div>
    </button>
  {:else}
    <button class="button" onclick={() => (showStartBroadcastModal = true)}>
      <i class="bi bi-broadcast" aria-hidden="true"></i>Start broadcast now
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
    width: 100%;
  }
</style>
