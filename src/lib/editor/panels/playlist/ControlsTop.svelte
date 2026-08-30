<script lang="ts">
  let { name = $bindable(), showOptions = $bindable(), autosaved, closePlaylist } = $props();

  let editingName = $state(false);

  function toggleEdit() {
    editingName = !editingName;
  }

  function toggleOptions() {
    showOptions = !showOptions;
  }
</script>

<div class="controls-top">
  <div class="row">
    <div class="row-left">
      <button class="button transparent back" onclick={closePlaylist}>
        <i class="bi bi-arrow-left" aria-hidden="true"></i>
        <span class="visually-hidden">Close playlist</span>
      </button>

      {#if editingName}
        <form onsubmit={toggleEdit}>
          <span class="playlist-name">
            <input class="input-text name" type="text" bind:value={name} />
          </span>

          <button type="submit" class="button transparent edit">
            <i class="bi bi-floppy" aria-hidden="true"></i>
            <span class="visually-hidden">Edit playlist name</span>
          </button>
        </form>
      {:else}
        <span class="playlist-name">
          {#if name}
            {name}
          {:else}
            <i>Untitled playlist</i>
          {/if}
        </span>

        <button class="button transparent edit" onclick={toggleEdit}>
          <i class="bi bi-pencil" aria-hidden="true"></i>
          <span class="visually-hidden">Save playlist name</span>
        </button>

        <button
          class="button transparent edit"
          onclick={toggleOptions}
          class:inverted={showOptions}
        >
          <i class="bi bi-three-dots" aria-hidden="true"></i>
          <span class="visually-hidden">Playlist options</span>
        </button>
      {/if}
    </div>

    <div>
      <span class="autosave-indicator">
        {#if autosaved}
          autosaved
        {/if}
      </span>
    </div>
  </div>
</div>

<style>
  .controls-top {
    display: flex;
    flex-direction: column;
  }

  .playlist-name {
    font-size: 1.5em;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 0.2em;
  }

  .row-left {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .button.back {
    font-size: 1.3em;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .button.edit {
    padding: 4px;
  }

  .input-text.name {
    padding: 0;
  }

  .autosave-indicator {
    padding-right: 0.2em;

    color: #666;

    -webkit-user-select: none; /* Safari */
    user-select: none;
  }
</style>
