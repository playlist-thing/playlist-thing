<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    attribute: string;
    onadd: (files: FileList | undefined) => void;
    onremove: () => void;
    readonly: boolean;
  }

  let { children, attribute, onadd, onremove, readonly }: Props = $props();

  let files: FileList | undefined = $state();
</script>

<div>
  {#if attribute}
    <div>
      {@render children()}
      {attribute}

      <button
        class="button transparent"
        class:disabled={readonly}
        disabled={readonly}
        onclick={onremove}
      >
        <i class="bi-trash" aria-hidden="true"></i>
        <span class="visually-hidden">Delete</span>
      </button>
    </div>
  {:else}
    <form>
      <div>
        <label>
          {@render children()}
          <input type="file" disabled={readonly} bind:files />
        </label>

        <button
          type="submit"
          class="button"
          class:disabled={readonly}
          disabled={readonly}
          onclick={() => onadd(files)}
        >
          <i class="bi-plus-lg" aria-hidden="true"></i>
          Add
        </button>
      </div>
    </form>
  {/if}
</div>
