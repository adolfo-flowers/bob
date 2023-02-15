import { asyncWait } from '../../lib';
import secrets from 'secrets';

const rootUrl = 'https://customer.api.soundcharts.com';

async function plataformSongIdToSoundChartId({ id, platform = 'spotify' }) {
  let r;
  try {
    r = await fetch(`${rootUrl}/api/v2.25/song/by-platform/${platform}/${id}`, {
      headers: {
        'x-app-id': secrets.appId,
        'x-api-key': secrets.apiKey,
      },
    });
    const {
      object: { uuid },
    } = await r.json();
    return uuid;
  } catch (error) {
    console.log('Sound charts uuid error', await r.text());
    console.log('Sound charts uuid error', error);
    throw error;
  }
}

async function songChartsStreams({ uuid, startDate, endDate }) {
  let r;
  try {
    const startDateq = startDate ? `startDate=${startDate}` : '';
    const endDateq = endDate ? `endDate=${endDate}` : '';
    r = await fetch(
      `${rootUrl}/api/v2.24/song/${uuid}/spotify/stream?${startDateq}&${endDateq}`,
      {
        headers: {
          'x-app-id': secrets.appId,
          'x-api-key': secrets.apiKey,
        },
      }
    );
    if (!r.ok) {
      throw await r.json();
    }

    return (await r.json()).items;
  } catch (error) {
    console.log('SONG chart streams error', error);
    throw error;
  }
}

export function addSoundChartsId(songs) {
  return songs.reduce(async (p, s) => {
    const acc = await p;
    await await asyncWait(10);
    try {
      const uuid = await plataformSongIdToSoundChartId({ id: s.spotifyId });
      return [
        ...acc,
        {
          ...s,
          uuid,
        },
      ];
    } catch (error) {
      return [...acc, { ...s, error: error }];
    }
  }, Promise.resolve([]));
}

export function addSpotifyStreamCount({ songs, startDate, endDate }) {
  return songs.reduce(async (p, s) => {
    const acc = await p;
    await await asyncWait(10);
    try {
      const result = await songChartsStreams({
        uuid: s.uuid,
        startDate,
        endDate,
      });

      const streams = result.map(({ date, plots }) => ({
        date,
        value: plots[0].value,
      }));
      return [
        ...acc,
        {
          ...s,
          streams,
        },
      ];
    } catch (error) {
      console.log('strem count error', error);
      return [...acc, { ...s, error: error }];
    }
  }, Promise.resolve([]));
}
