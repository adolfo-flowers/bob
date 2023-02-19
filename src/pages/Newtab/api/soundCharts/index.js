import dayjs from 'dayjs';
import { asyncWait, cache } from '../../lib';
import { config } from '../../../../../config';

const rootUrl = 'https://customer.api.soundcharts.com';

async function plataformSongIdToSoundChartId({ id, platform = 'spotify' }) {
  let r;
  try {
    const cachedUuid = cache.getItem(`${platform}:${id}`);
    if (cachedUuid) {
      return cachedUuid;
    }
    r = await fetch(`${rootUrl}/api/v2.25/song/by-platform/${platform}/${id}`, {
      headers: {
        'x-app-id': config.soundCharts.appId,
        'x-api-key': config.soundCharts.apiKey,
      },
    });
    const json = await r.json();
    if (!r.ok) {
      throw json;
    }
    const {
      object: { uuid },
    } = json;
    cache.setItem(`${platform}:${id}`, uuid);
    return uuid;
  } catch (error) {
    console.log('Sound charts uuid error', r.statusText);
    console.log('Sound charts uuid error', error);
    throw error;
  }
}

async function songChartsStreams({ uuid, startDate, endDate }) {
  let r;
  try {
    const cachedStreams = cache.getItem(`${uuid}:${startDate}:${endDate}`);
    if (cachedStreams) {
      return cachedStreams;
    }
    const startDateq = startDate ? `startDate=${startDate}` : '';
    const endDateq = endDate ? `endDate=${endDate}` : '';
    r = await fetch(
      `${rootUrl}/api/v2.24/song/${uuid}/spotify/stream?${startDateq}&${endDateq}`,
      {
        headers: {
          'x-app-id': config.soundCharts.appId,
          'x-api-key': config.soundCharts.apiKey,
        },
      }
    );
    if (!r.ok) {
      throw await r.json();
    }
    const streams = (await r.json()).items;
    cache.setItem(`${uuid}:${startDate}:${endDate}`, streams);
    return streams;
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

export function addSpotifyStreamCount({ songs, dateSegments }) {
  return songs.reduce(async (p, s) => {
    const acc = await p;
    await await asyncWait(1);
    try {
      const result = await dateSegments.reduce(
        async (p, { startDate, endDate }) => {
          const acum = await p;
          const streams = await songChartsStreams({
            uuid: s.uuid,
            startDate,
            endDate,
          });

          return [
            ...acum,
            ...streams.map(({ date, plots }) => ({
              date,
              value: plots[0].value,
            })),
          ];
        },
        []
      );

      return [
        ...acc,
        {
          ...s,
          streams: [
            ...(s.streams || []),
            ...result.sort(
              (a, b) => dayjs.tz(a.date).unix() - dayjs.tz(b.date).unix()
            ),
          ],
        },
      ];
    } catch (error) {
      console.log('stream count error', error);
      return [...acc, { ...s, error: error }];
    }
  }, Promise.resolve([]));
}
