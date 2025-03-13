<script lang="ts">
  interface Props {
    children: any;
    attribute: string;
    urlFromAttribute: (attribute: string) => string;
    onadd: (input: string) => void;
    onremove: () => void;
  }

  let { children, attribute, urlFromAttribute, onadd, onremove }: Props = $props();

  let input = $state('');
</script>

<div>
  {#if attribute}
    <div>
      <a href={urlFromAttribute(attribute)} target="_blank" rel="external">
        {@render children()}
      </a>

      <button class="button transparent" onclick={onremove}>
        <i class="bi-trash" aria-hidden="true"></i>
        <span class="visually-hidden">Delete</span>
      </button>
    </div>
  {:else}
    <form>
      <div>
        <label>
          {@render children()}
          <input type="text" class="input-text" bind:value={input} />
        </label>

        <button type="submit" class="button" onclick={() => onadd(input)}>
          <i class="bi-plus-lg" aria-hidden="true"></i>
          Add
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
</style>
