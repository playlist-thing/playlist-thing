export default class Item {
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
}
