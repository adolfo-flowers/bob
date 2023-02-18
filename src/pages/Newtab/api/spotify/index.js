import * as spotify from './token';
import { config } from '../../../../../config';

let token;

export async function searchSpotify({ track, artist, album }) {
  const trackq = track ? `track:${track}` : '';
  const artistq = artist ? ` artist:${artist}` : '';
  const albumq = album ? ` album:${album}` : '';
  const query = encodeURIComponent(`${trackq}${artistq}${albumq}`);
  const url = `https://api.spotify.com/v1/search?q=${query}&type=album,track`;

  let tries = 0;
  let r;
  let errors = [];

  if (!token) {
    token = await spotify.getLoginToken({
      client_id: config.spotify.clientId,
      client_secret: config.spotify.clientSecret,
    });
  }

  while (tries < 3) {
    try {
      r = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!r.ok) {
        console.log(r);
        throw Error('Spotify error');
      }
      const { tracks } = await r.json();
      console.log('dbg', tracks);
      return tracks.items.map(({ id, name, album, artists }) => ({
        spotifyId: id,
        trackName: name,
        artist: artists.map((a) => a.name).join(','),
        album: { spotifyId: album.id, name: album.name, thumbs: album.images },
      }));
    } catch (e) {
      errors.push(e);
      console.log('HEy', e);
      token = await spotify.getLoginToken({
        client_id: config.spotify.clientId,
        client_secret: config.spotify.clientSecret,
      });
      tries += 1;
    }
    throw errors;
  }
}
