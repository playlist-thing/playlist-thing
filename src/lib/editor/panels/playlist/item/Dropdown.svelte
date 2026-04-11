<script lang="ts">
  import { OutClick } from 'svelte-outclick';

  import { displaySizeMedium } from '$lib/editor/state.svelte.ts';

  interface Props {
    showMenu: boolean;
    duplicate: () => void;
    deleteItem: () => void;
  }

  let { showMenu = $bindable(), duplicate, deleteItem }: Props = $props();

  let dropdownButton: HTMLButtonElement | null = $state(null);

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

<div class="dropdown-container">
  <button
    class="button button-toggle-menu"
    class:inverted={showMenu}
    onclick={toggleMenu}
    bind:this={dropdownButton}
  >
    <i class="bi-three-dots" aria-hidden="true"></i>
    <span class="visually-hidden">More options</span>
  </button>

  {#if showMenu}
    <OutClick onOutClick={() => (showMenu = false)} excludeElements={dropdownButton}>
      <div class="dropdown-menu">
        <button class="button transparent align-left" onclick={duplicate}>
          <i class="bi-copy" aria-hidden="true"></i>
          Duplicate
        </button>
        {#if !displaySizeMedium.current}
          <button class="button transparent align-left" onclick={deleteItem}>
            <i class="bi-trash" aria-hidden="true"></i>
            Delete
          </button>
        {/if}
      </div>
    </OutClick>
  {/if}
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/dropdown.css';

  .button-toggle-menu {
    /* fix as this button is in a div */
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }
</style>
