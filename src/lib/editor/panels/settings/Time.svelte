<script lang="ts">
  import { onMount } from 'svelte';

  import { clockSyncEnabled } from '#lib/clock.js';
  import { timeZone } from '#lib/editor/settings.js';

  let componentId = $props.id();

  let localTimeZone = $state('');
  let timeZones = $state<string[]>([]);

  // Browser-only APIs, so resolve them after mount to stay SSR-safe.
  onMount(() => {
    localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // The full list of supported time zones.
    //
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf
    timeZones = Intl.supportedValuesOf('timeZone');
  });
</script>

<div class="input-block">
  <div class="input-block-item">
    <label class="label" for={`time-zone-${componentId}`}>Timezone</label>

    <select class="button" id={`time-zone-${componentId}`} bind:value={$timeZone}>
      <option value={null}>Local ({localTimeZone})</option>
      {#each timeZones as zone (zone)}
        <option value={zone}>{zone}</option>
      {/each}
    </select>
  </div>

  <div class="input-block-item">
    <label class="label" for={`time-source-${componentId}`}>Time source</label>

    <select class="button" id={`time-source-${componentId}`} bind:value={$clockSyncEnabled}>
      <option value={true}>playlist-thing servers</option>
      <option value={false}>This device</option>
    </select>
  </div>
</div>

<style>
  .input-block {
    display: flex;
    flex-direction: column;

    gap: 10px;
  }

  .input-block-item {
    display: flex;
    flex-direction: column;
  }
</style>
