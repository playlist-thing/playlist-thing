<script lang="ts">
  import { dragHandle } from 'svelte-dnd-action';

  import EditSearchProviderModal from './EditSearchProviderModal.svelte';

  import type { SearchProvider } from '$lib/editor/search.ts';

  interface Props {
    searchProvider: SearchProvider;
    deleteSearchProvider: (id: number) => void;
  }

  let { searchProvider = $bindable(), deleteSearchProvider }: Props = $props();

  let showModal = $state(false);
</script>

<div class="search-provider">
  <EditSearchProviderModal
    bind:showModal
    {searchProvider}
    saveSearchProvider={(newSearchProvider) => (searchProvider = newSearchProvider)}
  />

  <div use:dragHandle aria-label="drag-handle for {searchProvider.name}" class="drag-handle">
    <i class="bi-list"></i>
  </div>
  <div class="search-provider-info">
    <div class="info-item">
      <div class="info-item-text">{searchProvider.name}</div>
    </div>
  </div>

  <div class="button-group">
    <button class="button" onclick={() => (showModal = true)}>
      <i class="bi-pencil" aria-hidden="true"></i>
      <span class="visually-hidden">Edit search provider</span>
    </button>
    <button class="button" onclick={() => deleteSearchProvider(searchProvider.id)}>
      <i class="bi-trash" aria-hidden="true"></i>
      <span class="visually-hidden">Delete search provider</span>
    </button>
  </div>
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';

  .search-provider {
    display: flex;
    align-items: center;

    padding: 2px;
  }

  .search-provider-info {
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  .info-item {
    display: flex;
    align-items: center;

    width: 100%;
  }

  .info-item-text {
    width: 100%;
    padding: 5px 0;
  }

  .drag-handle {
    font-size: 1.3em;

    padding: 7px;
  }
</style>
