<script>
  import Playlist from '$lib/Playlist.svelte';
  import EditModal from '$lib/EditModal.svelte';
</script>

<div class="app">
  <div class="global-controls"></div>

  <div class="playlists">
    <Playlist id={'A'} />
    <Playlist id={'B'} />
  </div>
</div>

<EditModal />

<style>
  .app {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
  }

  .global-controls {
    padding: 0.3em;
  }

  .playlists {
    display: flex;
    min-height: 0;
    padding-left: 0.3em;
    padding-right: 0.3em;
    padding-bottom: 0.3em;
  }
</style>
