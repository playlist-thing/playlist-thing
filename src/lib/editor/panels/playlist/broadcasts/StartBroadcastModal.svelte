<script lang="ts">
  import DurationInput from '$lib/ui/DurationInput.svelte';
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';

  interface Props {
    showModal: boolean;
    startBroadcast: (duration: number) => void;
  }

  let { showModal = $bindable(), startBroadcast }: Props = $props();

  let durationSeconds = $state(3600);

  let componentId = $props.id();
</script>

<OkCancelModal
  bind:showModal
  title="Start broadcast"
  onOk={() => startBroadcast(durationSeconds * 1000)}
  extraButtonOkClasses="danger"
>
  <label class="label" for={`duration-${componentId}`}>Broadcast duration</label>
  <DurationInput
    value={durationSeconds}
    onNewValue={(newDurationSeconds) => (durationSeconds = newDurationSeconds)}
    id={`duration-${componentId}`}
  />

  {#snippet buttonOkContent()}
    <i class="bi-broadcast" aria-hidden="true"></i>
    Start broadcast
  {/snippet}

  {#snippet buttonCancelContent()}
    <i class="bi-x-lg" aria-hidden="true"></i>
    Cancel
  {/snippet}
</OkCancelModal>
