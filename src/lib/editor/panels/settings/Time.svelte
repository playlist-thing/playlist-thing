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

<label class="label" for={`time-zone-${componentId}`}>Timezone</label>

<select id={`time-zone-${componentId}`} bind:value={$timeZone}>
  <option value={null}>Local ({localTimeZone})</option>
  {#each timeZones as zone (zone)}
    <option value={zone}>{zone}</option>
  {/each}
</select>

<div class="checkbox">
  <input
    id={`clock-sync-enabled-${componentId}`}
    type="checkbox"
    checked={$clockSyncEnabled}
    onchange={(event) => ($clockSyncEnabled = event.currentTarget.checked)}
  />
  <label class="label" for={`clock-sync-enabled-${componentId}`}>
    Keep time in sync with playlist-thing servers
  </label>
</div>

<style>
  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5em;

    padding-top: 10px;
  }
</style>
