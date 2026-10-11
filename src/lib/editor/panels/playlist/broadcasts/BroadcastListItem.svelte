<script lang="ts">
  import { currentlyBroadcasting, type Broadcast } from '$lib/schema/playlist';

  import DurationInput from '$lib/ui/DurationInput.svelte';

  interface Props {
    broadcast: Broadcast;
    deleteBroadcast: () => void;
  }

  let { broadcast = $bindable(), deleteBroadcast }: Props = $props();

  let currentlyBroadcastingThis = $derived(currentlyBroadcasting(broadcast));

  let componentId = $props.id();

  // epoch ms -> "YYYY-MM-DDTHH:mm" in local time
  function toLocalInput(epochOffsetMs: number) {
    const d = new Date(epochOffsetMs);
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  // "YYYY-MM-DDTHH:mm" (local) -> epoch ms
  function fromLocalInput(localDateTimeString: string) {
    return new Date(localDateTimeString).getTime(); // no "Z" => parsed as local time
  }
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
            () => toLocalInput(broadcast.start),
            (newValue) => {
              const epochOffsetMs = fromLocalInput(newValue);
              if (!Number.isNaN(epochOffsetMs)) broadcast.start = epochOffsetMs;
            }
          }
        />
      </div>

      <div class="flex-column">
        <label class="label" for={`duration-${componentId}`}>Duration</label>
        <DurationInput
          value={broadcast.duration / 1000}
          onNewValue={(newDurationSeconds) => (broadcast.duration = newDurationSeconds * 1000)}
          id={`duration-${componentId}`}
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
