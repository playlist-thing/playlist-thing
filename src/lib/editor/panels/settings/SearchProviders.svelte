<script lang="ts">
  import type { DndEvent } from 'svelte-dnd-action';
  import { dragHandleZone } from 'svelte-dnd-action';

  import SearchProviderItem from './search/SearchProvider.svelte';

  import { searchProviders } from '$lib/editor/settings.ts';
  import type { SearchProvider } from '$lib/editor/search.ts';
  import { defaultSearchProviders } from '$lib/editor/search.ts';

  function handleSort(e: CustomEvent<DndEvent>) {
    $searchProviders = e.detail.items as SearchProvider[];
  }

  function resetSearchProviders() {
    $searchProviders = defaultSearchProviders;
  }

  function addSearchProvider() {
    const ids = $searchProviders.map((searchProvider) => searchProvider.id);
    const nextId = Math.max(...ids) + 1;

    $searchProviders = [...$searchProviders, { id: nextId, name: 'New search provider', url: '' }];
  }

  function deleteSearchProvider(id: number) {
    $searchProviders = $searchProviders.filter((item) => item.id !== id);
  }
</script>

{#if $searchProviders.length > 0}
  <div
    use:dragHandleZone={{ items: $searchProviders }}
    onconsider={handleSort}
    onfinalize={handleSort}
    class="search-provider-list"
  >
    {#each $searchProviders as searchProvider, idx (searchProvider.id)}
      <SearchProviderItem bind:searchProvider={$searchProviders[idx]} {deleteSearchProvider} />
    {/each}
  </div>
{/if}

<div class="controls-bottom">
  <button class="button" onclick={addSearchProvider}>
    <i class="bi-plus-lg" aria-hidden="true"></i>
    Add search provider
  </button>
  <button class="button" onclick={resetSearchProviders}>
    <i class="bi-arrow-counterclockwise" aria-hidden="true"></i>
    Reset search providers
  </button>
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';

  .search-provider-list {
    display: flex;
    flex-direction: column;
  }

  .search-provider-list > :not(:last-child) {
    padding-bottom: 5px;
  }

  .controls-bottom {
    display: flex;

    padding-top: 5px;
  }

  .controls-bottom > :not(:last-child) {
    margin-right: 4px;
  }

  .controls-bottom > .button {
    width: 100%;
  }
</style>
