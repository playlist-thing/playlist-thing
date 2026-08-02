<script lang="ts">
  import { OutClick } from 'svelte-outclick';

  interface Props {
    showMenu: boolean;
    duplicatePlaylist: () => void;
    deletePlaylist: () => void;
  }

  let { showMenu = $bindable(), duplicatePlaylist, deletePlaylist }: Props = $props();

  let dropdownButton: HTMLButtonElement | null = $state(null);

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

<div class="dropdown-container">
  <button
    class="button transparent button-toggle-menu"
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
        <button class="button transparent align-left" onclick={duplicatePlaylist}>
          <i class="bi-copy" aria-hidden="true"></i>
          Duplicate
        </button>
        <button class="button transparent align-left" onclick={deletePlaylist}>
          <i class="bi-trash" aria-hidden="true"></i>
          Delete
        </button>
      </div>
    </OutClick>
  {/if}
</div>

<style>
  .button-toggle-menu {
    /* fix as this button is in a div */
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;

    height: 100%;
  }

  .dropdown-menu {
    min-width: 200px;
  }
</style>
