<script lang="ts">
  import { OutClick } from 'svelte-outclick';

  let showMenu = $state(false);
  let menuButton: HTMLButtonElement | null = $state(null);

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

<div class="dropdown-container">
  <button
    class="button transparent menu"
    class:inverted={showMenu}
    onclick={toggleMenu}
    bind:this={menuButton}
  >
    <i class="bi bi-cloud-slash" aria-hidden="true"></i>
    <span class="visually-hidden">Sync options</span>
  </button>

  {#if showMenu}
    <OutClick onOutClick={() => (showMenu = false)} excludeElements={menuButton}>
      <div class="dropdown-menu">Saved locally</div>
    </OutClick>
  {/if}
</div>

<style>
  .button.menu {
    padding: 4px;
  }

  .dropdown-menu {
    min-width: 200px;

    padding: 10px;
  }
</style>
