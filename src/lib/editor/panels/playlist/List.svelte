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
      <i>Empty playlist</i>
    </div>
  {/each}
{/snippet}

<div class="row top">
  <h3 ondragstart={dragstartHandler} draggable="true" class="list-name">
    {name}
  </h3>
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

  .row.duration-info {
    flex-wrap: wrap-reverse;
  }

  .list-name {
    display: flex;

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
