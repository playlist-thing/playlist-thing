<script lang="ts">
  import { searchUrl, type SearchProvider } from '$lib/editor/search';
  import type { SongMetadata } from '$lib/playlist';
  import OkCancelModal from '$lib/ui/OkCancelModal.svelte';

  interface Props {
    showModal: boolean;
    searchProvider: SearchProvider;
    saveSearchProvider: (searchProvider: SearchProvider) => void;
  }

  let { showModal = $bindable(), searchProvider, saveSearchProvider }: Props = $props();

  let exampleSong: SongMetadata = {
    artist: 'The Beatles',
    title: 'A Day In The Life',
    album: '',
    released: '',
    label: '',
    attributes: {}
  };

  let exampleSongSearchUrl = $derived(searchUrl(exampleSong, searchProvider.url));
</script>

<OkCancelModal
  bind:showModal
  title="Edit search provider"
  buttonCancelText="Cancel"
  buttonOkText="Save"
  onOk={() => saveSearchProvider(searchProvider)}
>
  <div class="input-block">
    <div class="input-block-item">
      <label class="label" for="name">Name</label>
      <input class="input-text" id="name" type="text" bind:value={searchProvider.name} />
    </div>

    <div class="input-block-item">
      <label class="label" for="url">URL</label>
      <input class="input-text" id="url" type="text" bind:value={searchProvider.url} />
    </div>

    <div class="hint">
      <p>
        Song title and artist will be appended to this URL to form the search URL. For example, the
        search URL for {exampleSong.artist} - {exampleSong.title} would be
      </p>
      <p><a href={exampleSongSearchUrl}>{exampleSongSearchUrl}</a></p>
    </div>
  </div>
</OkCancelModal>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';

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
    padding-bottom: 10px;

    font-size: 0.85em;
    color: #666;
  }
</style>
