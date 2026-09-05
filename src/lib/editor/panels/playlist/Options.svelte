<script lang="ts">
  import { apiToken } from '$lib/auth/api';
  import ConfirmDeleteModal from './ConfirmDeleteModal.svelte';

  let showConfirmDeleteModal = $state(false);

  interface Props {
    name: string;
    description: string;
    isPublic: boolean;
    close: () => void;
    deletePlaylist: () => void;
    download: () => void;
    exportNotes: () => void;
  }

  let {
    name = $bindable(),
    description = $bindable(),
    isPublic = $bindable(),
    close,
    deletePlaylist,
    download,
    exportNotes
  }: Props = $props();

  let componentId = $props.id();
</script>

<div class="middle-container">
  <div class="padding-container">
    <div class="panel-header">
      <h2 class="panel-title">Options</h2>

      <button class="button transparent close" onclick={close}>
        <i class="bi-x-lg" aria-hidden="true"></i>
        <span class="visually-hidden">Close options</span>
      </button>
    </div>

    <section>
      <div class="input-block">
        <div class="input-block-item">
          <label class="label" for={`name-${componentId}`}>Playlist name</label>
          <input class="input-text" id={`name-${componentId}`} type="text" bind:value={name} />
        </div>

        <div class="input-block-item">
          <label class="label" for={`description-${componentId}`}>Description</label>
          <textarea
            class="input-text"
            id={`description-${componentId}`}
            rows="5"
            bind:value={description}></textarea>
        </div>

        <div class="input-block-item">
          <label class="label" for={`visibility-${componentId}`}>Visibility</label>
          <select
            class="button"
            id={`visibility-${componentId}`}
            bind:value={isPublic}
            class:disabled={!$apiToken}
            disabled={!$apiToken}
          >
            <option value={false}>Private</option>
            <option value={true}>Public</option>
          </select>

          {#if !$apiToken}
            <p class="hint">Sign in to publish playlists</p>
          {/if}
        </div>
      </div>
    </section>

    <section>
      <h3>Download</h3>

      <button class="button" onclick={download}>
        <i class="bi-download" aria-hidden="true"></i> Download playlist
      </button>

      <button class="button" onclick={exportNotes}>
        <i class="bi-list-ul" aria-hidden="true"></i> Export notes
      </button>
    </section>

    <section>
      <h3>Danger Zone</h3>

      <button class="button danger" onclick={() => (showConfirmDeleteModal = true)}>
        <i class="bi-trash" aria-hidden="true"></i> Delete playlist
      </button>
    </section>
  </div>
</div>

<ConfirmDeleteModal bind:showModal={showConfirmDeleteModal} onOk={deletePlaylist} />

<style>
  .middle-container {
    display: flex;
    justify-content: center;
  }

  .padding-container {
    width: 100%;
    max-width: 400px;
  }

  .input-block {
    display: flex;
    flex-direction: column;

    max-width: 600px;
  }

  .input-block-item {
    display: flex;
    flex-direction: column;
  }

  .input-block-item:not(:last-child) {
    padding-bottom: 7px;
  }

  .hint {
    margin: 0px;
    padding-top: 5px;

    font-size: 0.85em;
    color: #666;
  }
</style>
