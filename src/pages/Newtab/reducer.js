import _ from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';

dayjs.extend(utc);
dayjs.extend(timezone);

const d = [
  ['01', '02'],
  ['03', '04'],
  ['05', '06'],
  ['07', '08'],
  ['09', '10'],
  ['11', '12'],
];
function getDateSegments(dates) {
  const [startYear, endYear] = dates;
  if (!startYear && !endYear) {
    return [{ startDate: undefined, endDate: undefined }];
  }
  return d
    .reduce(
      (acc, [startMonth, endMonth]) => [
        ...acc,
        {
          startDate: `${startYear}-${startMonth}-01`,
          endDate: `${startYear}-${endMonth}-${new Date(
            Number(startYear),
            Number(endMonth),
            0
          ).getDate()}`,
        },
        startYear === endYear
          ? undefined
          : {
              startDate: `${endYear}-${startMonth}-01`,
              endDate: `${endYear}-${endMonth}-${new Date(
                Number(endYear),
                Number(endMonth),
                0
              ).getDate()}`,
            },
      ],
      []
    )
    .filter((d) => d);
}

async function spotify({ track, artist, album, dispatch }) {
  console.log(track, artist, album);
  const spotifySearchResult = await searchSpotify({
    track: track?.trim(),
    artist: artist?.trim(),
    album: album?.trim(),
  });

  if (!spotifySearchResult || !spotifySearchResult.length) {
    dispatch(
      actionSetMessages({
        messages: [
          { name: track, album, artist, message: 'Not found on spotify' },
        ],
      })
    );
  }
  return spotifySearchResult;
}

function normalizedDate(dates) {
  // set dates to the first day of the month if not the current month
  return dates;
}

function handleSoundChartsErrors({ result, dispatch }) {
  const valid = result.filter((s) => !s.error);
  const errors = result
    .filter((s) => s.error)
    .map((s) => ({
      message: s?.error?.errors[0]?.message,
      name: s?.trackName,
      artist: s?.artist,
      album: s?.album?.name,
    }));
  if (errors.length) {
    dispatch(actionSetMessages({ messages: errors }));
    console.log('errors', errors);
  }
  return valid;
}

async function hidrateWithSoundChartsData({
  spotifySearchResult,
  dates,
  dispatch,
}) {
  const songsWithUUID = handleSoundChartsErrors({
    result: await addSoundChartsId(spotifySearchResult),
    dispatch,
  });
  const dateSegments = getDateSegments(dates);
  console.log('!!!!!!!!!!!!!!!!!!!!', dateSegments);
  const songsWithStreams = handleSoundChartsErrors({
    result: await addSpotifyStreamCount({
      songs: songsWithUUID,
      dateSegments,
    }),
    dispatch,
  });

  return songsWithStreams;
}

function addTotalStreamsForPeriod(songs) {
  return songs.map((s) => {
    const perodTotalStreams =
      s.streams[s.streams.length - 1].value - s.streams[0].value;

    return { ...s, perodTotalStreams };
  });
}

function addTotalStreamsByYearAndMonth(songs) {
  return songs.map((song) => {
    const streamsByDate = _(song.streams)
      .groupBy(({ date }) => dayjs.tz(date).year())
      .mapValues((d) => _.groupBy(d, ({ date }) => dayjs.tz(date).month()))
      .value();
    console.log('Streams by year month', streamsByDate);
    return { ...song, streamsByDate };
  });
}

function formatTrackData(tracks) {
  console.log(tracks);
  const resultsWithTotalStreams = addTotalStreamsForPeriod(tracks);
  const resultsWithStreamsByYearAndMonth = addTotalStreamsByYearAndMonth(
    resultsWithTotalStreams
  );
  return resultsWithStreamsByYearAndMonth;
}

export const searchAction = async (setInitLoading, dispatch, state, data) => {
  const { artist, track, album, endYear, startYear } = data;
  if (!artist && !track && !album) {
    return;
  }
  const dates = [startYear?.year(), endYear?.year()];

  setInitLoading(true);

  dispatch(actionSetMessages({ reset: true }));
  const spotifySearchResult = await spotify({ track, artist, album, dispatch });
  console.log('Spotify serach results', spotifySearchResult);
  const hidratedResultsWithSoundChartsData = await hidrateWithSoundChartsData({
    spotifySearchResult,
    dates,
    dispatch,
  });
  const formatedTrackData = formatTrackData(hidratedResultsWithSoundChartsData);
  dispatch(actionSetSearchResults(formatedTrackData));
  setInitLoading(false);
};

export const actionSetSearchResults = (results) => ({
  type: 'set_search_results',
  payload: results,
});

export const actionSetMessages = (errors) => ({
  type: 'set_messages',
  payload: errors,
});

const handlers = {
  set_messages: (state, { payload: { messages, reset } }) => {
    console.log('MEssages', messages);
    return {
      ...state,
      messages: reset ? [] : [...state.messages, ...messages],
    };
  },
  set_search_results: (state, { payload = [] }) => {
    return {
      ...state,
      searchResults: payload,
    };
  },
};

const reducer = (state = {}, action) => {
  const handler = handlers[action.type] || ((s) => s);
  return handler(state, action);
};

export default reducer;
