<script lang="ts">
  import { OutClick } from 'svelte-outclick';

  interface Props {
    readonly: boolean;
  }

  let { readonly = $bindable() }: Props = $props();

  let showMenu = $state(false);
  let menuButton: HTMLButtonElement | null = $state(null);

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function setReadonly(value: boolean) {
    readonly = value;
    showMenu = false;
  }
</script>

<div class="dropdown-container">
  <button
    class="button transparent menu"
    class:inverted={showMenu}
    onclick={toggleMenu}
    bind:this={menuButton}
  >
    {#if readonly}
      <i class="bi bi-eye" aria-hidden="true"></i>
      Viewing
    {:else}
      <i class="bi bi-pencil" aria-hidden="true"></i>
      Editing
    {/if}

    <i class="bi bi-chevron-down" aria-hidden="true"></i>
  </button>

  {#if showMenu}
    <OutClick onOutClick={() => (showMenu = false)} excludeElements={menuButton}>
      <div class="dropdown-menu">
        <button
          class="button transparent align-left"
          class:inverted={!readonly}
          onclick={() => setReadonly(false)}
        >
          <i class="bi bi-pencil" aria-hidden="true"></i>
          Editing
        </button>
        <button
          class="button transparent align-left"
          class:inverted={readonly}
          onclick={() => setReadonly(true)}
        >
          <i class="bi bi-eye" aria-hidden="true"></i>
          Viewing
        </button>
      </div>
    </OutClick>
  {/if}
</div>

<style>
  .button.menu {
    padding: 4px;
  }

  .dropdown-menu {
    min-width: 200px;
  }
</style>
