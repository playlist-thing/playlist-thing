<script lang="ts">
  let showConfirmDelete = $state(false);

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
</script>

{#if showConfirmDelete}
  <div class="outer-modal">
    <div>
      <div class="icon">
        <i class="bi-trash-fill"></i>
      </div>

      <div class="text">Are you sure you want to delete this playlist?</div>

      <div class="modal-buttons">
        <button class="button" onclick={() => (showConfirmDelete = false)}>Cancel</button>
        <button class="button danger" onclick={deletePlaylist}>
          <i class="bi-trash-fill"></i>
          Delete playlist
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="middle-container">
    <div class="padding-container">
      <div class="header">
        <h1 class="title">Options</h1>

        <button class="button transparent close" onclick={close}>
          <i class="bi-x-lg" aria-hidden="true"></i>
          <span class="visually-hidden">Close options</span>
        </button>
      </div>

      <section>
        <div class="input-block">
          <div class="input-block-item">
            <label class="label" for="name">Playlist name</label>
            <input class="input-text" id="name" type="text" bind:value={name} />
          </div>

          <div class="input-block-item">
            <label class="label" for="description">Description</label>
            <textarea class="input-text" id="description" rows="5" bind:value={description}
            ></textarea>
          </div>

          <div class="input-block-item">
            <label class="label" for="visibility">Visibility</label>
            <select class="button" id="visibility" bind:value={isPublic}>
              <option value={false}>Private</option>
              <option value={true}>Public</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2>Download</h2>

        <button class="button" onclick={download}>
          <i class="bi-download" aria-hidden="true"></i> Download playlist
        </button>

        <button class="button" onclick={exportNotes}>
          <i class="bi-list-ul" aria-hidden="true"></i> Export notes
        </button>
      </section>

      <section>
        <h2>Danger Zone</h2>

        <button class="button danger" onclick={() => (showConfirmDelete = true)}>
          <i class="bi-trash" aria-hidden="true"></i> Delete playlist
        </button>
      </section>
    </div>
  </div>
{/if}

<style>
  .outer-modal {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    height: 200px;
  }

  .icon {
    display: flex;
    justify-content: center;

    padding-bottom: 20px;

    font-size: 3em;
  }

  .text {
    padding-bottom: 20px;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;

    padding-top: 15px;
  }

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
</style>
