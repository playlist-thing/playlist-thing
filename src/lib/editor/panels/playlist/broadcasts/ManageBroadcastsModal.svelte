<script lang="ts">
  import type { Broadcast } from '$lib/schema/playlist';

  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';
  import BroadcastListItem from './BroadcastListItem.svelte';
  import BroadcastDurationInput from './BroadcastDurationInput.svelte';
  import CurrentTimeInfo from './CurrentTimeInfo.svelte';

  interface Props {
    showModal: boolean;
    broadcasts: Broadcast[];
    broadcastDurationMs: number;
    saveBroadcasts: (broadcasts: Broadcast[], broadcastDurationMs: number) => void;
  }

  let {
    showModal = $bindable(),
    broadcasts,
    broadcastDurationMs,
    saveBroadcasts
  }: Props = $props();

  interface EditingBroadcast extends Broadcast {
    id: number;
  }

  let editingBroadcasts: EditingBroadcast[] = $state([]);
  let editingBroadcastDurationMs = $state(0);

  $effect(() => {
    if (showModal) {
      let newEditingBroadcasts: EditingBroadcast[] = [];

      const broadcastSnapshot = $state.snapshot(broadcasts);
      let id = 0;
      for (const broadcast of broadcastSnapshot) {
        newEditingBroadcasts.push({ ...broadcast, id: id++ });
      }

      editingBroadcasts = newEditingBroadcasts;
      editingBroadcastDurationMs = broadcastDurationMs;
    }
  });

  function finalizeAndSaveBroadcasts() {
    saveBroadcasts(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      editingBroadcasts.map(({ id, ...broadcast }) => broadcast),
      editingBroadcastDurationMs
    );
  }

  function addBroadcast() {
    const ids = editingBroadcasts.map((broadcast) => broadcast.id);
    const nextId = ids.length === 0 ? 0 : Math.max(...ids) + 1;

    editingBroadcasts = [...editingBroadcasts, { id: nextId, start: Date.now(), stationId: null }];
  }

  function deleteBroadcast(id: number) {
    editingBroadcasts = editingBroadcasts.filter((broadcast) => broadcast.id != id);
  }
</script>

<OkCancelModal bind:showModal title="Edit broadcasts" onOk={finalizeAndSaveBroadcasts}>
  <div class="content">
    <CurrentTimeInfo />

    <BroadcastDurationInput
      value={editingBroadcastDurationMs}
      onNewValue={(v) => (editingBroadcastDurationMs = v)}
    />

    <ul class="broadcast-list">
      {#each editingBroadcasts as broadcast, idx (broadcast.id)}
        <BroadcastListItem
          bind:broadcast={editingBroadcasts[idx]}
          broadcastDurationMs={editingBroadcastDurationMs}
          deleteBroadcast={() => deleteBroadcast(broadcast.id)}
        />
      {/each}
    </ul>

    <button class="button" onclick={addBroadcast}>
      <i class="bi-plus-lg" aria-hidden="true"></i>
      Add broadcast
    </button>
  </div>

  {#snippet buttonOkContent()}
    <i class="bi-floppy" aria-hidden="true"></i>
    Save broadcasts
  {/snippet}

  {#snippet buttonCancelContent()}
    <i class="bi-x-lg" aria-hidden="true"></i>
    Cancel
  {/snippet}
</OkCancelModal>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .broadcast-list {
    display: flex;
    flex-direction: column;
    gap: 5px;

    list-style: none;
    padding: 0px;
    margin: 0px;
  }
</style>
