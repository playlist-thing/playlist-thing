<script lang="ts">
  import AddUrlModal from './AddUrlModal.svelte';

  interface Props {
    addEmpty: () => void;
    addAirBreak: () => void;
    addUrl: (url: string) => void;
    addFile: (file: File) => void;
  }

  let { addEmpty, addAirBreak, addUrl, addFile }: Props = $props();

  let files: FileList | undefined = $state();
  let showAddUrlModal = $state(false);
  let draggingOverDepth = $state(0);

  let componentId = $props.id();

  $effect(() => {
    if (files !== undefined && files.length === 1) {
      addFile(files[0]);
    }
  });

  function dragEnterHandler() {
    draggingOverDepth += 1;
  }

  function dragLeaveHandler() {
    draggingOverDepth -= 1;
  }

  function dropHandler() {
    // event will bubble up and will be handled by parent component(s)
    draggingOverDepth -= 1;
  }
</script>

<div
  class={['bottom', draggingOverDepth > 0 && 'dragging-over']}
  role="list"
  ondragenter={dragEnterHandler}
  ondragleave={dragLeaveHandler}
  ondrop={dropHandler}
>
  <div class="bottom-header">
    <i class="bi-plus-lg"></i>
    {#if draggingOverDepth > 0}
      Drop here to add to queue
    {:else}
      Add to queue
    {/if}
  </div>

  <div class="add-item-buttons">
    <div class="button-group">
      <button class="button" onclick={addEmpty}>
        <i class="bi bi-music-note" aria-hidden="true"></i>
        Add song
      </button>
      <label class="button" for={`add-file-${componentId}`}>
        <i class="bi bi-file-earmark-music" aria-hidden="true"></i>
        From File
      </label>
      <input class="file-input" id={`add-file-${componentId}`} type="file" bind:files />
      <button class="button" onclick={() => (showAddUrlModal = true)}>
        <i class="bi bi-link-45deg" aria-hidden="true"></i>
        From URL
      </button>
    </div>

    <div class="button-group">
      <button class="button" onclick={addAirBreak}>
        <i class="bi bi-mic" aria-hidden="true"></i>
        Add air break
      </button>
    </div>
  </div>

  <div class="bottom-hint">Only song metadata is stored, no audio is stored.</div>
</div>

<AddUrlModal bind:showModal={showAddUrlModal} {addUrl} />

<style>
  .bottom {
    display: flex;
    flex-direction: column;

    padding: 3px;
  }

  .bottom.dragging-over {
    border: 3px solid #666;
    padding: 0px;
  }

  .bottom-header {
    padding: 14px 3px 10px;

    color: #666;
  }

  .add-item-buttons {
    display: flex;
    gap: 4px;

    padding: 6px 3px;
  }

  .add-item-buttons > .button-group {
    width: 100%;
  }

  .button-group > .button {
    width: 100%;
  }

  .file-input {
    display: none;
  }

  .bottom-hint {
    padding-left: 3px;

    color: #666;
    font-size: 0.85em;
  }
</style>
