<script lang="ts">
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';

  interface Props {
    showModal: boolean;
    addUrl: (url: string) => void;
  }

  let { showModal = $bindable(), addUrl }: Props = $props();

  let url = $state('');

  let componentId = $props.id();
</script>

<OkCancelModal bind:showModal title="Add Song from URL" onOk={() => addUrl(url)}>
  <div class="input-block">
    <div class="input-block-item">
      <label class="label" for={`url-${componentId}`}>URL</label>
      <input class="input-text" id={`url-${componentId}`} type="text" bind:value={url} />
    </div>

    <div class="hint">
      <p>Currently, only Spotify URLs are supported.</p>
    </div>
  </div>

  {#snippet buttonOkContent()}
    <i class="bi-plus-lg" aria-hidden="true"></i>
    Add URL
  {/snippet}

  {#snippet buttonCancelContent()}
    <i class="bi-x-lg" aria-hidden="true"></i>
    Cancel
  {/snippet}
</OkCancelModal>

<style>
  .input-block {
    display: flex;
    flex-direction: column;

    max-width: 600px;
  }

  .input-block-item {
    display: flex;
    flex-direction: column;
  }

  .input-block-item:not(:last-child) {
    padding-bottom: 7px;
  }

  .hint {
    padding-bottom: 10px;

    font-size: 0.85em;
    color: #666;
  }
</style>
