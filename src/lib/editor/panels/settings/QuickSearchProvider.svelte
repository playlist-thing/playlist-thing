<script lang="ts">
  import { searchProviders, quickSearchProviderId } from '$lib/editor/settings';

  let componentId = $props.id();
</script>

{#if $searchProviders.length > 0}
  <label class="label" for={`quick-search-provider-${componentId}`}>Quick search provider</label>

  <select id={`quick-search-provider-${componentId}`} bind:value={$quickSearchProviderId}>
    {#each $searchProviders as searchProvider (searchProvider.id)}
      <option value={searchProvider.id}>{searchProvider.name}</option>
    {/each}
  </select>
{:else}
  <i>No search providers to choose from</i>
{/if}
