<script>
  import { calculateTotalDuration, calculateTotalDurationWithoutPauses } from '$lib/timeInfo.js';
  import { formatSeconds } from '$lib/format.js';

  export let items;
  export let playlistName;

  $: totalDuration = calculateTotalDuration(items);
  $: totalDurationWithoutPauses = calculateTotalDurationWithoutPauses(items);

  function dragstartHandler(ev) {
    const json = JSON.stringify(items);
    ev.dataTransfer.setData('application/x.playlist-json', json);
  }
</script>

<div class="controls-top">
  <div>
    <span on:dragstart={dragstartHandler} draggable="true" class="playlist-draggable">
      Playlist
    </span>
    <span bind:textContent={playlistName} contenteditable></span>
  </div>

  <div class="duration">
    Total duration: {formatSeconds(totalDuration)}
    Without pauses: {formatSeconds(totalDurationWithoutPauses)}
  </div>
</div>

<style>
  .controls-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.2em;
  }

  .playlist-draggable {
    padding-left: 0.2em;

    -webkit-user-select: none; /* Safari */
    user-select: none;

    cursor: grab;
  }

  .duration {
    padding-right: 0.2em;
  }
</style>
