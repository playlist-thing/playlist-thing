<script>
  import { calculateTotalDuration, calculateTotalDurationWithoutPauses } from '$lib/timeInfo.js';
  import { formatSeconds } from '$lib/format.js';

  export let items;
  export let playlistName;

  let editingName = false;

  $: totalDuration = calculateTotalDuration(items);
  $: totalDurationWithoutPauses = calculateTotalDurationWithoutPauses(items);

  function toggleEdit() {
    editingName = !editingName;
  }

  function dragstartHandler(ev) {
    const json = JSON.stringify(items);
    ev.dataTransfer.setData('application/x.playlist-json', json);
  }
</script>

<div class="controls-top">
  <div>
    {#if editingName}
      <form on:submit={toggleEdit}>
        <span class="playlist-name">
          <input class="input-text name" type="text" bind:value={playlistName} />
        </span>
        <button type="submit" class="button transparent edit">
          <i class="bi bi-floppy" />
        </button>
      </form>
    {:else}
      <span on:dragstart={dragstartHandler} draggable="true" class="playlist-name">
        {#if playlistName}
          {playlistName}
        {:else}
          <i>Untitled playlist</i>
        {/if}
      </span>
      <button class="button transparent edit" on:click={toggleEdit}>
        <i class="bi bi-pencil" />
      </button>
    {/if}
  </div>

  <div class="duration">
    Total duration: {formatSeconds(totalDuration)}
    Without pauses: {formatSeconds(totalDurationWithoutPauses)}
  </div>
</div>

<style>
  @import '$lib/style/forms.css';

  .controls-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.2em;
  }

  .playlist-name {
    font-size: 1.3em;

    -webkit-user-select: none; /* Safari */
    user-select: none;

    cursor: grab;
  }

  .button.edit {
    padding: 4px;
  }

  .input-text.name {
    padding: 0;
  }
</style>
