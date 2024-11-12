<script>
  import { tick } from 'svelte';

  export let text;
  export let cssClass = '';

  let tdElement;
  let editing = false;

  async function beginEdit() {
    editing = true;

    // wait until svelte has really set contenteditable
    await tick();

    // focus item, making edits possible right away
    tdElement.focus();
  }

  function endEdit() {
    editing = false;
    text = tdElement.textContent;
  }
</script>

<td
  class={cssClass + (editing ? ' editing' : '')}
  bind:this={tdElement}
  on:dblclick={beginEdit}
  on:focusout={endEdit}
  contenteditable={editing}
>
  {text}
</td>

<style>
  @import '$lib/style/table.css';
  @import '$lib/style/responsive.css';

  .editing {
    cursor: text;
  }
</style>
