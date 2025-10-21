<script lang="ts">
  let showConfirmClear = $state(false);

  interface Props {
    close: () => void;
    clear: () => void;
    download: () => void;
    exportNotes: () => void;
  }

  let { close, clear, download, exportNotes }: Props = $props();

  function clearAndClose() {
    clear();
    close();
  }
</script>

{#if showConfirmClear}
  <div class="outer-modal">
    <div>
      <div class="icon">
        <i class="bi-trash-fill"></i>
      </div>

      <div class="text">Are you sure you want to remove all playlist items?</div>

      <div class="modal-buttons">
        <button class="button" onclick={() => (showConfirmClear = false)}>Cancel</button>
        <button class="button danger" onclick={clearAndClose}>
          <i class="bi-trash-fill"></i>
          Clear
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

        <button class="button danger" onclick={() => (showConfirmClear = true)}>
          <i class="bi-trash" aria-hidden="true"></i> Delete all playlist items
        </button>
      </section>
    </div>
  </div>
{/if}

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

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
</style>
