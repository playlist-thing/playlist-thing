export default class Item {
  id: number;

  artist = $state();
  title = $state();
  album = $state();
  released = $state();
  seconds = $state();
  label = $state();

  pause = $state();
  notes = $state();

  file = $state();
  spotifyTrackId = $state();
  youtubeId = $state();
  appleMusicTrackId = $state();
  bandcampTrackUrl = $state();

  constructor({
    id = -1,

    artist = '',
    title = '',
    album = '',
    released = '',
    seconds = 0,
    label = '',

    pause = false,
    notes = '',

    file = '',
    spotifyTrackId = '',
    youtubeId = '',
    appleMusicTrackId = '',
    bandcampTrackUrl = ''
  } = {}) {
    this.id = id;

    this.artist = artist;
    this.title = title;
    this.album = album;
    this.released = released;
    this.seconds = seconds;
    this.label = label;

    this.pause = pause;
    this.notes = notes;

    this.file = file;
    this.spotifyTrackId = spotifyTrackId;
    this.youtubeId = youtubeId;
    this.appleMusicTrackId = appleMusicTrackId;
    this.bandcampTrackUrl = bandcampTrackUrl;
  }

  toJSON(key: any) {
    return {
      id: this.id,

      artist: this.artist,
      title: this.title,
      album: this.album,
      released: this.released,
      seconds: this.seconds,
      label: this.label,

      pause: this.pause,
      notes: this.notes,

      file: this.file,
      spotifyTrackId: this.spotifyTrackId,
      youtubeId: this.youtubeId,
      appleMusicTrackId: this.appleMusicTrackId,
      bandcampTrackUrl: this.bandcampTrackUrl,
    };
  }
}
