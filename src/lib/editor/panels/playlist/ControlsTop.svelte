<script lang="ts">
  import {
    TimeInfoMode,
    calculateTotalDuration,
    calculateTotalDurationSongsOnly
  } from '$lib/timeInfo.ts';
  import { formatSeconds } from '$lib/format.ts';

  let { items, name = $bindable(), timeInfoMode = $bindable() } = $props();

  let editingName = $state(false);

  let totalDuration = $derived(calculateTotalDuration(items));
  let totalDurationSongsOnly = $derived(calculateTotalDurationSongsOnly(items));

  function toggleEdit() {
    editingName = !editingName;
  }

  function dragstartHandler(ev: DragEvent) {
    const json = JSON.stringify({
      name: name,
      items: items
    });

    // The property can be null when the event is created using the
    // constructor. It is never null when dispatched by the browser.
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/dataTransfer
    ev.dataTransfer!.setData('application/x.playlist-json', json);
  }
</script>

<div class="controls-top">
  <div class="row">
    <div>
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
        <span ondragstart={dragstartHandler} draggable="true" class="playlist-name">
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
      {/if}
    </div>
  </div>

  {#if items.length > 0}
    <div class="row duration-info">
      <div>
        <select bind:value={timeInfoMode}>
          <option value={TimeInfoMode.Duration}>Duration</option>
          <option value={TimeInfoMode.BeginsAt}>Begins At</option>
          <option value={TimeInfoMode.TimeUntilEnd}>Time Until End</option>
        </select>
      </div>

      <div>
        Total duration: {formatSeconds(totalDuration)}
        Songs only: {formatSeconds(totalDurationSongsOnly)}
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
