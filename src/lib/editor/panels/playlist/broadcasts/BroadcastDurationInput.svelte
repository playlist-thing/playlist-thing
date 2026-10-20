<script lang="ts">
  import DurationInput from '$lib/ui/DurationInput.svelte';

  interface Props {
    value: number;
    onNewValue: (newValueMs: number) => void;
    label?: string;
  }

  let { value, onNewValue, label = 'Broadcast duration' }: Props = $props();

  let componentId = $props.id();
</script>

<div class="flex-column">
  <label class="label" for={`broadcast-duration-${componentId}`}>{label}</label>
  <DurationInput
    value={value / 1000}
    onNewValue={(newDurationSeconds) => onNewValue(newDurationSeconds * 1000)}
    id={`broadcast-duration-${componentId}`}
  />
</div>
