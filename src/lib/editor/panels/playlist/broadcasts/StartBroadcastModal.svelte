<script lang="ts">
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';
  import BroadcastDurationInput from './BroadcastDurationInput.svelte';
  import CurrentTimeInfo from './CurrentTimeInfo.svelte';

  interface Props {
    showModal: boolean;
    duration: number;
    startBroadcast: (duration: number) => void;
  }

  let { showModal = $bindable(), duration, startBroadcast }: Props = $props();

  let editingDuration = $state(0);

  // preload with the playlist's current broadcast duration each time the modal opens
  $effect(() => {
    if (showModal) {
      editingDuration = duration;
    }
  });
</script>

<OkCancelModal
  bind:showModal
  title="Start broadcast"
  onOk={() => startBroadcast(editingDuration)}
  extraButtonOkClasses="danger"
>
  <div class="content">
    <CurrentTimeInfo />

    <BroadcastDurationInput value={editingDuration} onNewValue={(v) => (editingDuration = v)} />
  </div>

  {#snippet buttonOkContent()}
    <i class="bi-broadcast" aria-hidden="true"></i>
    Start broadcast
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
</style>
