<script lang="ts">
  import { formatSeconds, parseDuration } from '$lib/format';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    value: number;
    onNewValue: (newValue: number) => {};
  }

  let { value, onNewValue, ...rest }: Props = $props();

  let durationInputElement: HTMLInputElement;

  function inputDuration() {
    const raw = durationInputElement.value;
    const newValue = parseDuration(raw);
    onNewValue(newValue);
  }
</script>

<input
  class="input-text"
  type="text"
  bind:this={durationInputElement}
  value={formatSeconds(value)}
  onfocusout={inputDuration}
  {...rest}
/>
