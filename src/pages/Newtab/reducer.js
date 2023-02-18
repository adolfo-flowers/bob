import _ from 'lodash';
import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';

function getDateSegments({ startDate, endDate }) {
  const start = startDate?.format('YYYY-MM-DD').split('');
  const end = endDate?.format('YYYY-MM-DD').split('');
  if (start && end) {
    start[8] = '0';
    start[9] = '1';
    end[8] = '2';
    end[9] = '8';
  }
  console.log('DATES:', start, end);
  return [
    {
      startDate: '2022-12-01',
      endDate: '2022-12-30',
    },
    {
      startDate: '2022-01-01',
      endDate: '2022-01-30',
    },
  ];

  //  Passing in month will check month and year
  const isNinityDayPeriod = endDate
    .substract(90, 'days')
    .isSameOrAfter(startDate, 'month');
  console.log('IS 90 day period?', isNinityDayPeriod);
  if (isNinityDayPeriod) {
    return [
      {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      },
    ];
  }
}

async function spotify({ track, artist, album, dispatch }) {
  console.log(track, artist, album);
  const spotifySearchResult = await searchSpotify({
    track: track?.trim(),
    artist: artist?.trim(),
    album: album?.trim(),
  });

  if (!spotifySearchResult || !spotifySearchResult.length) {
    dispatch(actionSetMessages({ messages: ['Not found on spotify'] }));
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
    .map((s) => [{ message: s.error.errors[0].message }]);
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
  const [startDate, endDate] = normalizedDate(dates);
  const dateSegments = getDateSegments({ startDate, endDate });
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
    const streams = s.streams.map((s) => s.value);

    const perodTotalStreams = streams[0] - streams[streams.length - 1];
    return { ...s, perodTotalStreams };
  });
}

function addTotalStreamsByYearAndMonth(songs) {
  return songs.map((song) => {
    const totalStreamsByYearAndMonth = _(song.streams)
      .groupBy(({ date }) => new Date(date).getFullYear())
      .mapValues((d) =>
        _.groupBy(d, ({ date }) =>
          new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
            new Date(date)
          )
        )
      )
      .value();
    console.log('!!!!!', totalStreamsByYearAndMonth);
    return { ...song, totalStreamsByYearAndMonth };
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
  const { artist, track, album, dates = [] } = data;
  if (!artist && !track && !album) {
    return;
  }
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
    console.log(messages);
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
