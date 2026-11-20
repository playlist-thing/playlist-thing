<script lang="ts">
  import {
    dndzone,
    dragHandleZone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    SOURCES,
    TRIGGERS,
    type DndEvent
  } from 'svelte-dnd-action';

  import Item from './Item.svelte';
  import type { PlaylistItem } from '#lib/schema/playlist.js';
  import { calculateTimeInfo, TimeInfoMode } from '#lib/timeInfo.js';
  import { displaySizeMedium, readonlyDrag, withFreshIds } from '#lib/editor/state.svelte.js';
  import { calculateTotalDuration, calculateTotalDurationSongsOnly } from '#lib/timeInfo.js';
  import { formatSeconds } from '#lib/format.js';

  interface Props {
    name: 'Playlist' | 'Queue';
    items: PlaylistItem[];
    readonly: boolean;
  }

  let { name, items = $bindable(), readonly }: Props = $props();

  let timeInfoMode: TimeInfoMode = $state(TimeInfoMode.Duration);

  let dragDisplayItems = $state<PlaylistItem[] | null>(null);
  let renderItems = $derived(dragDisplayItems ?? items);

  let totalDuration = $derived(calculateTotalDuration(renderItems));
  let totalDurationSongsOnly = $derived(calculateTotalDurationSongsOnly(renderItems));
  let timeInfo = $derived(calculateTimeInfo(renderItems, timeInfoMode));

  let dndOptions = $derived({
    items: renderItems,
    dragDisabled: renderItems.length === 0,
    dropFromOthersDisabled: readonly,
    type: 'playlist'
  });

  function finishReadonlyDrag() {
    // Restore the real (untouched) read-only list.
    dragDisplayItems = null;

    // Let all finalize handlers run first: on keyboard drags the source may
    // finalize before the target does.
    queueMicrotask(() => {
      readonlyDrag.sourceItemId = null;
    });
  }

  function isShadowItem(item: PlaylistItem) {
    return SHADOW_ITEM_MARKER_PROPERTY_NAME in item;
  }

  function startReadonlyDrag(e: CustomEvent<DndEvent>, draggedId: number) {
    const sourceItems = $state.snapshot(items) as PlaylistItem[];
    const index = sourceItems.findIndex((item) => item.id === draggedId);

    if (index === -1) {
      return;
    }

    // Display a copy in place of the dragged item without touching the real
    // read-only list. The copy keeps the dnd zone valid while the original is
    // dragged away.
    const copy = withFreshIds([sourceItems[index]])[0];
    const displayItems = (e.detail.items as PlaylistItem[]).filter((item) => !isShadowItem(item));
    displayItems.splice(index, 0, copy);

    dragDisplayItems = displayItems;
    readonlyDrag.sourceItemId = draggedId;
  }

  function withFreshIdForCopy(incomingItems: PlaylistItem[]) {
    const sourceItemId = readonlyDrag.sourceItemId;

    if (sourceItemId === null) {
      return incomingItems;
    }

    const index = incomingItems.findIndex((item) => item.id === sourceItemId);
    if (index === -1) {
      return incomingItems;
    }

    readonlyDrag.sourceItemId = null;

    // Give the dragged copy a new id, leaving the item in the read-only source
    // list untouched.
    return incomingItems.toSpliced(index, 1, withFreshIds([incomingItems[index]])[0]);
  }

  function handleDndConsider(e: CustomEvent<DndEvent>) {
    const info = e.detail.info;

    if (!readonly) {
      if (info.trigger === TRIGGERS.DRAG_STARTED) {
        readonlyDrag.sourceItemId = null;
      }

      items = e.detail.items as PlaylistItem[];
      return;
    }

    if (info.trigger === TRIGGERS.DRAG_STARTED) {
      startReadonlyDrag(e, Number(info.id));
      return;
    }

    if (info.trigger === TRIGGERS.DRAG_STOPPED) {
      finishReadonlyDrag();
      return;
    }

    // Dragula-like: keep the display stable while dragging so the read-only
    // list does not make space for the dragged item.
    if (dragDisplayItems !== null) {
      dragDisplayItems = [...dragDisplayItems];
    }
  }

  function handleDndFinalize(e: CustomEvent<DndEvent>) {
    const info = e.detail.info;

    if (!readonly) {
      items = withFreshIdForCopy(e.detail.items as PlaylistItem[]);
      return;
    }

    // Keyboard drags finalize on every intermediate move within the source.
    if (info.source === SOURCES.KEYBOARD && info.trigger !== TRIGGERS.DROPPED_INTO_ANOTHER) {
      if (dragDisplayItems !== null) {
        dragDisplayItems = [...dragDisplayItems];
      }
      return;
    }

    // Restore the untouched read-only list. Only the dropped copy gets a new
    // id in the editable list.
    finishReadonlyDrag();
  }

  function deleteItem(id: number) {
    items = items.filter((item) => item.id !== id);
  }

  function insertItems(newItems: PlaylistItem[], atIndex: number) {
    items = items.toSpliced(atIndex, 0, ...withFreshIds(newItems));
  }

  function dragstartHandler(ev: DragEvent) {
    if (readonly) {
      ev.preventDefault();
      return;
    }

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
      {readonly}
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

{#snippet dragPlaylistItems(dragItems: PlaylistItem[])}
  {#each dragItems as item, idx (item.id)}
    <Item
      item={dragItems[idx]}
      timeInfo={timeInfo[idx]}
      deleteItem={() => deleteItem(item.id)}
      insertItems={(newItems) => insertItems(newItems, idx)}
      {readonly}
    />
  {/each}
{/snippet}

<div class="row top">
  <h4
    ondragstart={dragstartHandler}
    draggable={!readonly}
    class="list-name"
    class:disabled={readonly}
  >
    {name}
    {#if renderItems.length > 0}
      <span class="name-badge">{renderItems.length}</span>
    {/if}
  </h4>
</div>

{#if renderItems.length > 0}
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
  <ol
    class="playlist"
    use:dndzone={dndOptions}
    onconsider={handleDndConsider}
    onfinalize={handleDndFinalize}
  >
    {#if dragDisplayItems !== null}
      {@render dragPlaylistItems(dragDisplayItems)}
    {:else}
      {@render playlistItems(items)}
    {/if}
  </ol>
{:else}
  <ol
    class="playlist"
    use:dragHandleZone={dndOptions}
    onconsider={handleDndConsider}
    onfinalize={handleDndFinalize}
  >
    {#if dragDisplayItems !== null}
      {@render dragPlaylistItems(dragDisplayItems)}
    {:else}
      {@render playlistItems(items)}
    {/if}
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
    display: flex;
    align-items: center;
    gap: 0.3em;

    font-size: 1.3em;
    margin-top: 15px;
    margin-bottom: 15px;

    -webkit-user-select: none; /* Safari */
    user-select: none;

    cursor: grab;
  }

  .list-name.disabled {
    cursor: default;
  }

  .name-badge {
    min-width: 1.4em;
    padding: 0 5px;

    background-color: #e2e2e2;
    border-radius: 999px;

    font-size: 0.75em;
    font-weight: 600;
    text-align: center;
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
