import { asyncWait } from '../../lib';
import secrets from 'secrets';

const rootUrl = 'https://customer.api.soundcharts.com';

async function plataformSongIdToSoundChartId({ id, platform = 'spotify' }) {
  const r = await fetch(
    `${rootUrl}/api/v2.25/song/by-platform/${platform}/${id}`,
    {
      headers: {
        'x-app-id': secrets.appId,
        'x-api-key': secrets.apiKey,
      },
    }
  );
  if (!r.ok) {
    return;
  }
  const {
    object: { uuid },
  } = await r.json();
  return uuid;
}

async function songChartsStreams({ uuid, startDate, endDate }) {
  const startDateq = startDate ? `startDate=${startDate}` : '';
  const endDateq = endDate ? `endDate=${endDate}` : '';
  const { items } = await fetch(
    `${rootUrl}/api/v2.24/song/${uuid}/spotify/stream?${startDateq}&${endDateq}`,
    {
      headers: {
        'x-app-id': secrets.appId,
        'x-api-key': secrets.apiKey,
      },
    }
  ).then((r) => r.json());

  return items;
}

export function addSoundChartsId(songs) {
  return songs.reduce(async (p, s) => {
    const acc = await p;
    await await asyncWait(10);
    return [
      ...acc,
      {
        ...s,
        uuid: await plataformSongIdToSoundChartId({ id: s.spotifyId }),
      },
    ];
  }, Promise.resolve([]));
}

export function addSpotifyStreamCount({ songs, startDate, endDate }) {
  return songs.reduce(async (p, s) => {
    const acc = await p;
    await await asyncWait(10);
    const streams = (
      await songChartsStreams({
        uuid: s.uuid,
        startDate,
        endDate,
      })
    ).map(({ date, plots }) => ({
      date,
      value: plots[0].value,
    }));
    const st = streams.map((a) => a.value);

    return [
      ...acc,
      {
        ...s,
        streams,
        totalStreams: st[0] - st[streams.length - 1],
      },
    ];
  }, Promise.resolve([]));
}
