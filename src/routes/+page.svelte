<script lang="ts">
  import { env } from '$env/dynamic/public';
</script>

<svelte:head>
  <title>playlist-thing</title>
</svelte:head>

<div class="content-container">
  <div class="content">
    <h1>playlist-thing</h1>

    <p><strong>playlist-thing</strong> is a playlist manager primarily for radio DJs.</p>

    <ul class="showcase">
      <li class="showcase-item">
        <div class="showcase-item-icon">
          <i class="bi-music-note-list" aria-hidden="true"></i>
        </div>

        <div>
          Prepare your playlists before a show. Gather song metadata from different sources. Add
          notes to tracks.
        </div>
      </li>

      <li class="showcase-item">
        <div class="showcase-item-icon">
          <i class="bi-cloud-slash" aria-hidden="true"></i>
        </div>

        <div>
          playlist-thing works offline. All playlists and settings are stored in your browser.
        </div>
      </li>

      <li class="showcase-item">
        <div class="showcase-item-icon">
          <i class="bi-code-slash" aria-hidden="true"></i>
        </div>

        <div>
          playlist-thing is open-source software. Anyone is free to inspect, modify, and contribute
          to the source code.
        </div>
      </li>
    </ul>

    <p><strong>playlist-thing</strong> does not...</p>

    <ul class="showcase">
      <li class="showcase-item">
        <div class="showcase-item-icon">
          <i class="bi-book" aria-hidden="true"></i>
        </div>

        <div>...manage your song library.</div>
      </li>

      <li class="showcase-item">
        <div class="showcase-item-icon">
          <i class="bi-volume-mute-fill" aria-hidden="true"></i>
        </div>

        <div>...deal with audio files. Only metadata like links to tracks can be stored here.</div>
      </li>
    </ul>

    <div class="call-to-action">
      <a class="button" href="/editor">
        <i class="bi-music-note-list" aria-hidden="true"></i>
        Open Editor
      </a>
    </div>

    <ul class="links-bottom">
      <li class="links-bottom-item">
        <a href="https://github.com/playlist-thing/playlist-thing" rel="external" target="_blank">
          <i class="bi-github" aria-hidden="true"></i>
          View source on GitHub
        </a>
      </li>

      <li class="links-bottom-item">
        <a
          href="https://github.com/playlist-thing/playlist-thing/issues/new"
          rel="external"
          target="_blank"
        >
          <i class="bi-bug-fill" aria-hidden="true"></i>
          Report bug or request feature
        </a>
      </li>

      {#if 'PUBLIC_PRIVACY_POLICY_URL' in env}
        <li class="links-bottom-item">
          <a href={env.PUBLIC_PRIVACY_POLICY_URL} rel="external" target="_blank">
            <i class="bi-lock" aria-hidden="true"></i>
            Privacy policy
          </a>
        </li>
      {/if}
    </ul>
  </div>
</div>

<style>
  @import '$lib/style/forms.css';

  .content-container {
    display: flex;
    justify-content: center;
  }

  .content {
    max-width: 800px;

    padding-left: 15px;
    padding-right: 15px;
  }

  .showcase {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    list-style: none;
    padding: 0px;
  }

  .showcase-item {
    display: flex;
    align-items: center;

    width: 100%;
    max-width: 380px;
    padding: 10px;
  }

  .showcase-item:not(:last-child) {
    padding-bottom: 30px;
  }

  .showcase-item-icon {
    font-size: 3em;
    padding-right: 15px;
  }

  .call-to-action {
    display: flex;
    justify-content: center;

    font-size: 1.3em;
  }

  .links-bottom {
    list-style: none;
    padding: 0px;
    margin-top: 50px;
  }

  .links-bottom-item {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
