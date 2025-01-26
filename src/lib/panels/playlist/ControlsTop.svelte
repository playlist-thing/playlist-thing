<script>
  import { calculateTotalDuration, calculateTotalDurationWithoutPauses } from '$lib/timeInfo.ts';
  import { formatSeconds } from '$lib/format.ts';

  let { items, playlistName = $bindable(), timeInfoMode = $bindable() } = $props();

  let editingName = $state(false);

  let totalDuration = $derived(calculateTotalDuration(items));
  let totalDurationWithoutPauses = $derived(calculateTotalDurationWithoutPauses(items));

  function toggleEdit() {
    editingName = !editingName;
  }

  function dragstartHandler(ev) {
    const json = JSON.stringify(items);
    ev.dataTransfer.setData('application/x.playlist-json', json);
  }
</script>

<div class="controls-top">
  <div class="row">
    <div>
      {#if editingName}
        <form onsubmit={toggleEdit}>
          <span class="playlist-name">
            <input class="input-text name" type="text" bind:value={playlistName} />
          </span>
          <button type="submit" class="button transparent edit">
            <i class="bi bi-floppy" aria-hidden="true"></i>
            <span class="visually-hidden">Edit playlist name</span>
          </button>
        </form>
      {:else}
        <span ondragstart={dragstartHandler} draggable="true" class="playlist-name">
          {#if playlistName}
            {playlistName}
          {:else}
            <i>Untitled playlist</i>
          {/if}
        </span>
        <button class="button transparent edit" onclick={toggleEdit}>
          <i class="bi bi-pencil" aria-hidden="true"></i>
          <span class="visually-hidden">Save playlist name</span>
        </button>
      {/if}
    </div>
  </div>

  {#if items.length > 0}
    <div class="row duration-info">
      <div>
        <select bind:value={timeInfoMode}>
          <option value="duration">Duration</option>
          <option value="beginsAt">Begins At</option>
          <option value="timeUntilEnd">Time Until End</option>
        </select>
      </div>

      <div>
        Total duration: {formatSeconds(totalDuration)}
        Without pauses: {formatSeconds(totalDurationWithoutPauses)}
      </div>
    </div>
  {/if}
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';

  .controls-top {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 0.2em;
  }

  .row.duration-info {
    flex-wrap: wrap-reverse;
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
