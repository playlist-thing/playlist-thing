<script lang="ts">
  import { onMount } from 'svelte';

  import { timeZone } from '$lib/editor/settings';

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
