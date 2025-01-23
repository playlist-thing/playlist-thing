<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

{@render children?.()}

<style>
  @import 'bootstrap-icons';

  :global(body) {
    font-family: Sans-Serif;
    margin: 0;
  }
</style>
