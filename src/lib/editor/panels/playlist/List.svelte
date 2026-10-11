<script lang="ts">
  import { dndzone, dragHandleZone, type DndEvent } from 'svelte-dnd-action';

  import Item from './Item.svelte';
  import type { PlaylistItem } from '$lib/schema/playlist';
  import { calculateTimeInfo, TimeInfoMode } from '$lib/timeInfo';
  import { displaySizeMedium } from '$lib/editor/state.svelte';
  import { calculateTotalDuration, calculateTotalDurationSongsOnly } from '$lib/timeInfo';
  import { formatSeconds } from '$lib/format';
  import { withFreshIds } from '$lib/editor/state.svelte';

  interface Props {
    name: 'Playlist' | 'Queue';
    items: PlaylistItem[];
  }

  let { name, items = $bindable() }: Props = $props();

  let timeInfoMode: TimeInfoMode = $state(TimeInfoMode.Duration);

  let totalDuration = $derived(calculateTotalDuration(items));
  let totalDurationSongsOnly = $derived(calculateTotalDurationSongsOnly(items));
  let timeInfo = $derived(calculateTimeInfo(items, timeInfoMode));

  let dndOptions = $derived({ items, dragDisabled: items.length === 0, type: 'playlist' });

  function deleteItem(id: number) {
    items = items.filter((item) => item.id !== id);
  }

  function insertItems(newItems: PlaylistItem[], atIndex: number) {
    items = items.toSpliced(atIndex, 0, ...withFreshIds(newItems));
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
    <Item
      bind:item={items[idx]}
      timeInfo={timeInfo[idx]}
      deleteItem={() => deleteItem(item.id)}
      insertItems={(items) => insertItems(items, idx)}
    />
  {:else}
    <div class="empty-item">
      {#if name === 'Playlist'}
        <div class="empty-item-icon">
          <i class="bi-music-note-list" aria-hidden="true"></i>
        </div>

        <p class="empty-item-text">
          There are no items in the playlist yet. During a broadcast, you can move items from the
          queue to the playlist.
        </p>
      {:else if name === 'Queue'}
        <div class="empty-item-icon">
          <i class="bi-collection-play" aria-hidden="true"></i>
        </div>

        <p class="empty-item-text">
          Your queue is empty. Unlike the playlist, the queue is never published.
        </p>
      {/if}
    </div>
  {/each}
{/snippet}

<div class="row top">
  <h4 ondragstart={dragstartHandler} draggable="true" class="list-name">
    {name}
  </h4>
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
  <ol class="playlist" use:dndzone={dndOptions} onconsider={handleSort} onfinalize={handleSort}>
    {@render playlistItems(items)}
  </ol>
{:else}
  <ol
    class="playlist"
    use:dragHandleZone={dndOptions}
    onconsider={handleSort}
    onfinalize={handleSort}
  >
    {@render playlistItems(items)}
  </ol>
{/if}

<style>
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 0.2em;
  }

  .row.duration-info {
    flex-wrap: wrap-reverse;
  }

  .list-name {
    font-size: 1.3em;
    margin-top: 15px;
    margin-bottom: 15px;

    -webkit-user-select: none; /* Safari */
    user-select: none;

    cursor: grab;
  }

  .playlist {
    display: flex;
    flex-direction: column;

    list-style: none;
    padding: 0px;
    margin: 0px;
  }

  .empty-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 20px;

    color: #666;

    -webkit-user-select: none; /* Safari */
    user-select: none;
  }

  .empty-item-icon {
    padding-bottom: 6px;

    font-size: 1.5em;
  }

  .empty-item-text {
    margin: 0px;
    max-width: 500px;
  }
</style>
