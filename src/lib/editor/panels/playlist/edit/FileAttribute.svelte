<script lang="ts">
  interface Props {
    children: any;
    attribute: string;
    onadd: (files: FileList | undefined) => void;
    onremove: () => void;
  }

  let { children, attribute, onadd, onremove }: Props = $props();

  let files: FileList | undefined = $state();
</script>

<div>
  {#if attribute}
    <div>
      {@render children()}
      {attribute}

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
          <input type="file" bind:files />
        </label>

        <button type="submit" class="button" onclick={() => onadd(files)}>
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
