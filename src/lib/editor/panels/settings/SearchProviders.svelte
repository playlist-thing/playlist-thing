<script lang="ts">
  import type { DndEvent } from 'svelte-dnd-action';
  import { dragHandleZone, dragHandle } from 'svelte-dnd-action';

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

    $searchProviders = [...$searchProviders, { id: nextId, name: '', url: '' }];
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
    {#each $searchProviders as searchProvider (searchProvider.id)}
      <div class="search-provider">
        <div use:dragHandle aria-label="drag-handle for {searchProvider.name}" class="drag-handle">
          <i class="bi-list"></i>
        </div>
        <div class="search-provider-info">
          <div class="info-item">
            <div class="info-item-label">
              <i class="bi-search"></i>
            </div>
            <input
              class="input-text info-item-input"
              type="text"
              bind:value={searchProvider.name}
            />
          </div>
          <div class="info-item">
            <div class="info-item-label">
              <i class="bi-link-45deg"></i>
            </div>
            <input class="input-text info-item-input" type="text" bind:value={searchProvider.url} />
          </div>
        </div>

        <div>
          <button
            class="button transparent"
            onclick={() => deleteSearchProvider(searchProvider.id)}
          >
            <i class="bi-trash" aria-hidden="true"></i>
            <span class="visually-hidden">Delete search provider</span>
          </button>
        </div>
      </div>
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

  .search-provider {
    display: flex;
    align-items: center;
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

  .info-item-label {
    padding-right: 5px;
  }

  .info-item-input {
    width: 100%;
  }

  .drag-handle {
    font-size: 1.3em;

    padding: 5px;
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
