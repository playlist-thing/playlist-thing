<script lang="ts">
  import { airBreakDurationSeconds } from '$lib/editor/settings';
  import DurationInput from '$lib/ui/DurationInput.svelte';

  let componentId = $props.id();
</script>

<div class="flex-column">
  <label class="label" for={`air-break-duration-${componentId}`}>Default air break duration</label>
  <DurationInput
    value={$airBreakDurationSeconds}
    onNewValue={(value) => ($airBreakDurationSeconds = value)}
    id={`air-break-duration-${componentId}`}
  />
</div>
