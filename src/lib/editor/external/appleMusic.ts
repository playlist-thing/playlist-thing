export function appleMusicTrackIdFromUrl(url: string) {
  // https://music.apple.com/us/song/good-luck-babe/1737497080
  const patternSong = /https:\/\/music.apple.com\/.+\/song\/.+\/([0-9]+)/;
  const matchesSong = url.match(patternSong);
  if (matchesSong !== null && matchesSong.length === 2) return matchesSong[1];

  // https://music.apple.com/us/album/good-luck-babe/1737497078?i=1737497080
  const patternAlbum = /https:\/\/music.apple.com\/.+\/album\/.+\/[0-9]+\?i=([0-9]+)/;
  const matchesAlbum = url.match(patternAlbum);
  if (matchesAlbum !== null && matchesAlbum.length === 2) return matchesAlbum[1];

  return null;
}

export function urlFromAppleMusicId(appleMusicId: string) {
  return `https://music.apple.com/song/${appleMusicId}`;
}
