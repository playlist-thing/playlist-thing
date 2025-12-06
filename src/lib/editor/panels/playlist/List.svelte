<script lang="ts">
  import { dndzone, dragHandleZone, type DndEvent } from 'svelte-dnd-action';

  import Song from './Song.svelte';
  import type { PlaylistItem } from '$lib/playlist';
  import { calculateTimeInfo, TimeInfoMode } from '$lib/timeInfo';
  import { displaySizeMedium } from '$lib/editor/state.svelte.ts';
  import { calculateTotalDuration, calculateTotalDurationSongsOnly } from '$lib/timeInfo.ts';
  import { formatSeconds } from '$lib/format.ts';

  interface Props {
    name: string;
    items: PlaylistItem[];
  }

  let { name, items = $bindable() }: Props = $props();

  let timeInfoMode: TimeInfoMode = $state(TimeInfoMode.Duration);

  let totalDuration = $derived(calculateTotalDuration(items));
  let totalDurationSongsOnly = $derived(calculateTotalDurationSongsOnly(items));
  let timeInfo = $derived(calculateTimeInfo(items, timeInfoMode));

  let dndOptions = $derived({ items, dragDisabled: items.length === 0 });

  function deleteItem(id: number) {
    items = items.filter((item) => item.id !== id);
  }

  function handleSort(e: CustomEvent<DndEvent>) {
    items = e.detail.items as PlaylistItem[];
  }

  function dragstartHandler(ev: DragEvent) {
    const json = JSON.stringify(items);

    // The property can be null when the event is created using the
    // constructor. It is never null when dispatched by the browser.
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/dataTransfer
    ev.dataTransfer!.setData('application/x.playlist-json', json);
  }
</script>

{#snippet playlistItems(renderItems: PlaylistItem[])}
  {#each renderItems as item, idx (item.id)}
    <Song bind:item={items[idx]} timeInfo={timeInfo[idx]} deleteItem={() => deleteItem(item.id)} />
  {:else}
    <div class="empty-item">
      <i>Empty playlist</i>
    </div>
  {/each}
{/snippet}

<div class="row top">
  <span ondragstart={dragstartHandler} draggable="true" class="name">
    {name}
  </span>
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

{#if displaySizeMedium.current}
  <div
    class="playlist"
    role="list"
    use:dndzone={dndOptions}
    onconsider={handleSort}
    onfinalize={handleSort}
  >
    {@render playlistItems(items)}
  </div>
{:else}
  <div
    class="playlist"
    role="list"
    use:dragHandleZone={dndOptions}
    onconsider={handleSort}
    onfinalize={handleSort}
  >
    {@render playlistItems(items)}
  </div>
{/if}

<style>
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 0.2em;
  }

  .row.top {
    padding-top: 10px;
  }

  .row.duration-info {
    flex-wrap: wrap-reverse;
  }

  .name {
    font-size: 1.3em;

    -webkit-user-select: none; /* Safari */
    user-select: none;

    cursor: grab;
  }

  .playlist {
    display: flex;
    flex-direction: column;
  }

  .empty-item {
    display: flex;
    flex-direction: row;
    justify-content: center;

    padding: 20px;

    color: #666;

    -webkit-user-select: none; /* Safari */
    user-select: none;
  }
</style>
