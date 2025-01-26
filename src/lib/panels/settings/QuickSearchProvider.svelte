<script>
  import { searchProviders, quickSearchProviderId } from '$lib/settings.ts';
</script>

{#if $searchProviders.length > 0}
  <label class="label" for="quick-search-provider">Quick search provider</label>

  <select id="quick-search-provider" bind:value={$quickSearchProviderId}>
    {#each $searchProviders as searchProvider (searchProvider.id)}
      <option value={searchProvider.id}>{searchProvider.name}</option>
    {/each}
  </select>
{:else}
  <i>No search providers to choose from</i>
{/if}

<style>
  @import '$lib/style/forms.css';
</style>
