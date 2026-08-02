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
</script>

<div class="bottom" role="list" ondragenter={dragEnterHandler} ondragleave={dragLeaveHandler}>
  <div class="bottom-header">
    <i class="bi-plus-lg"></i>
    {#if draggingOverDepth > 0}
      Drop here to add to queue
    {:else}
      Add to queue
    {/if}
  </div>

  <div>
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

    <div class="add-item-buttons"></div>
  </div>

  <div class="bottom-hint">Only song metadata is stored, no audio is stored.</div>
</div>

<AddUrlModal bind:showModal={showAddUrlModal} {addUrl} />

<style>
  .bottom {
    display: flex;
    flex-direction: column;
  }

  .bottom-header {
    padding-top: 14px;
    padding-bottom: 10px;
    padding-left: 6px;
    padding-right: 6px;

    color: #666;
  }

  .add-item-buttons {
    display: flex;

    padding: 6px;
  }

  .add-item-buttons > :not(:last-child) {
    margin-right: 4px;
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
    padding-left: 6px;

    color: #666;
    font-size: 0.85em;
  }
</style>
