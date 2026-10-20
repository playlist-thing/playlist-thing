<script lang="ts">
  import { clock } from '$lib/clock';
  import { formatInputDateTime, parseInputDateTime } from '$lib/format';
  import { timeZone } from '$lib/editor/settings';
  import { currentlyBroadcasting, type Broadcast } from '$lib/schema/playlist';

  interface Props {
    broadcast: Broadcast;
    broadcastDurationMs: number;
    deleteBroadcast: () => void;
  }

  let { broadcast = $bindable(), broadcastDurationMs, deleteBroadcast }: Props = $props();

  let currentlyBroadcastingThis = $derived(
    currentlyBroadcasting(broadcast, broadcastDurationMs, clock.now)
  );

  let componentId = $props.id();
</script>

<li class="broadcast-list-item">
  <div class="broadcast-info">
    {#if currentlyBroadcastingThis}
      <div class="currently-broadcasting-indicator">
        <i class="bi bi-broadcast" aria-hidden="true"></i>
        Currently broadcasting
      </div>
    {/if}

    <div class="broadcast-inputs">
      <div class="flex-column">
        <label class="label" for={`start-${componentId}`}>Start</label>
        <input
          class="input-text"
          type="datetime-local"
          id={`start-${componentId}`}
          bind:value={
            () => formatInputDateTime(broadcast.start, $timeZone),
            (newValue) => {
              const epochOffsetMs = parseInputDateTime(newValue, $timeZone);
              if (!Number.isNaN(epochOffsetMs)) broadcast.start = epochOffsetMs;
            }
          }
        />
      </div>
    </div>
  </div>

  <button class="button" onclick={deleteBroadcast}>
    <i class="bi-trash" aria-hidden="true"></i>
    <span class="visually-hidden">Delete</span>
  </button>
</li>

<style>
  .broadcast-list-item {
    display: flex;
    justify-content: space-between;
    gap: 5px;
  }

  .broadcast-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .currently-broadcasting-indicator {
    color: var(--danger-color);
  }

  .broadcast-inputs {
    display: flex;
    gap: 5px;
  }
</style>
