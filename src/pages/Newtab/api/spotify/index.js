import * as spotify from './token.js';
import secrets from 'secrets';

function searchSpotifyApi({ token, query }) {
  const url = `https://api.spotify.com/v1/search?q=${query}&type=album,track`;

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json());
}

export async function searchSpotify({ track, artist, album }) {
  const trackq = track ? `track:${track}` : '';
  const artistq = artist ? ` artist:${artist}` : '';
  const albumq = album ? ` album:${album}` : '';
  const query = encodeURIComponent(`${trackq}${artistq}${albumq}`);

  let tries = 0;
  let r;
  while (tries < 3) {
    try {
      const token = await spotify.getLoginToken({
        client_id: secrets.clientId,
        client_secret: secrets.clientSecret,
      });
      r = await searchSpotifyApi({ token, query });
      break;
    } catch (e) {
      console.log(e);
      tries += 1;
    }
  }

  return r.tracks.items.map(({ id, name, album }) => ({
    spotifyId: id,
    name,
    album: { spotifyId: album.id, name: album.name },
  }));
}
