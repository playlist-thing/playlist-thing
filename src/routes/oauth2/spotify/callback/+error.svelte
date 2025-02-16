<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>Spotify authorization error</title>
</svelte:head>

<div class="content-container">
  <div class="content">
    <h1>Sorry, an error occured</h1>

    <p>
      {page.error!.message}
    </p>

    <p>
      Try connecting to Spotify again. If an error still occurs, clear your browser cache and
      reload.
    </p>

    <p>
      If an error still occurs,
      <a
        href="https://github.com/playlist-thing/playlist-thing/issues/new"
        rel="external"
        target="_blank"
      >
        file a bug report
      </a>
      with a detailed description of your problem and steps to reproduce it.
    </p>

    <p>
      <a href="/editor">Back to editor</a>
    </p>
  </div>
</div>

<style>
  .content-container {
    display: flex;
    justify-content: center;
  }

  .content {
    max-width: 450px;
  }
</style>
