<script lang="ts">
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';

  interface Props {
    showModal: boolean;
    onOk: () => void;
  }

  let { showModal = $bindable(), onOk }: Props = $props();
</script>

<OkCancelModal bind:showModal title="Delete playlist" {onOk} extraButtonOkClasses="danger">
  <div>Are you sure you want to delete this playlist?</div>

  {#snippet buttonOkContent()}
    <i class="bi-trash-fill" aria-hidden="true"></i>
    Delete playlist
  {/snippet}

  {#snippet buttonCancelContent()}
    <i class="bi-x-lg" aria-hidden="true"></i>
    Cancel
  {/snippet}
</OkCancelModal>
