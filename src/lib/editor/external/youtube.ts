export function youtubeIdFromUrl(url: string) {
  // don't specify domain exactly to allow for different youtube
  // domains (e.g. music.youtube.com or youtube.de) or alternative
  // youtube frontends
  const pattern = /https:\/\/[a-z.]+\/watch\?v=([a-zA-Z0-9-_]+)/;
  const matches = url.match(pattern);
  if (matches !== null && matches.length === 2) return matches[1];

  return null;
}

export function urlFromYoutubeId(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}
