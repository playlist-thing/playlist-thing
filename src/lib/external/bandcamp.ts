export function validBandcampUrl(url: string) {
  const parsed = URL.parse(url);
  if (parsed === null) return false;

  return parsed.hostname.endsWith('bandcamp.com');
}
