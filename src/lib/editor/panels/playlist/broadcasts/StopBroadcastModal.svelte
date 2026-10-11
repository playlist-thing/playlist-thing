<script lang="ts">
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';

  interface Props {
    showModal: boolean;
    stopBroadcast: () => void;
  }

  let { showModal = $bindable(), stopBroadcast }: Props = $props();
</script>

<OkCancelModal
  bind:showModal
  title="Stop broadcast"
  onOk={stopBroadcast}
  extraButtonOkClasses="danger"
>
  Are you sure you want to stop all current broadcasts?

  {#snippet buttonOkContent()}
    <i class="bi-stop-fill" aria-hidden="true"></i>
    Stop broadcast
  {/snippet}

  {#snippet buttonCancelContent()}
    <i class="bi-x-lg" aria-hidden="true"></i>
    Cancel
  {/snippet}
</OkCancelModal>
