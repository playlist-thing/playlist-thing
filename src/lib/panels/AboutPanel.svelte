<div class="outer-container">
  <div class="inner-container overflow">
    <div class="padding-container">
      <h1>playlist-thing</h1>

      <section class="content-container">
        <div class="content">
          <p><strong>playlist-thing</strong> is a playlist manager primarily for radio DJs.</p>

          <ul class="showcase">
            <li class="showcase-item">
              <div class="showcase-item-icon">
                <i class="bi-music-note-list" aria-hidden="true"></i>
              </div>

              <div>
                Prepare your playlists before a show. Gather song metadata from different sources.
                Add notes to tracks.
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
                playlist-thing is open-source software. Anyone is free to inspect, modify, and
                contribute to the source code.
              </div>
            </li>
          </ul>
        </div>
      </section>

      <p>
        <a href="https://github.com/playlist-thing/playlist-thing" rel="external" target="_blank">
          <i class="bi-github" aria-hidden="true"></i> View source on GitHub
        </a>
      </p>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/panel.css';

  .content-container {
    display: flex;
    justify-content: center;
  }

  .content {
    max-width: 450px;
  }

  .showcase {
    list-style: none;
    padding: 0px;
  }

  .showcase-item {
    display: flex;
    align-items: center;
  }

  .showcase-item-icon {
    font-size: 3em;
    padding-right: 15px;
  }
</style>
