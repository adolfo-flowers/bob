import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';

function getDateSegments({ startDate, endDate }) {
  if (!startDate && !endDate) {
    return [{ startDate, endDate }];
  }
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

function normalizedDate(dates) {
  // set dates to the first day of the month if not the current month
  return dates;
}

export const searchAction = async (setInitLoading, dispatch, state, data) => {
  const { artist, track, album, dates = [] } = data;
  if (!artist && !track && !album) {
    return;
  }
  setInitLoading(true);
  dispatch(actionSetMessages({ reset: true }));
  const [startDate, endDate] = normalizedDate(dates);
  const spotifySearchResult = await searchSpotify({
    track,
    artist,
    album,
  });

  if (!spotifySearchResult || !spotifySearchResult.length) {
    dispatch(
      actionSetMessages({
        messages: [
          {
            error: {
              errors: [{ message: 'Not found on spotify' }],
            },
          },
        ],
      })
    );
  }
  console.log('Spotify serach results', spotifySearchResult);
  const uuidResult = await addSoundChartsId(spotifySearchResult);
  const songsWithUUID = uuidResult.filter((s) => !s.error);
  const uuidErrors = uuidResult.filter((s) => s.error);
  if (uuidErrors.length) {
    dispatch(actionSetMessages({ messages: uuidErrors }));
    console.log('UUID errors', uuidErrors);
  }
  const dateSegments = getDateSegments({ startDate, endDate });
  const results = await dateSegments.reduce(
    async (p, { startDate, endDate }) => {
      const acc = await p;
      const results = await addSpotifyStreamCount({
        songs: songsWithUUID,
        startDate,
        endDate,
      });
      return [...acc, ...results];
    },
    []
  );

  const streamCountErrors = results.filter((r) => r.error);
  const validResults = results.filter((r) => !r.error);
  if (streamCountErrors.length) {
    dispatch(actionSetMessages({ messages: streamCountErrors }));
    console.log('streamCountErrors', streamCountErrors);
  }
  dispatch(actionSetSearchResults(validResults));
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

function addTotalStreamsForPeriod(songs) {
  return songs.map((s) => {
    const streams = s.streams.map((s) => s.value);
    const perodTotalStreams = streams[0] - streams[streams.length - 1];
    return { ...s, perodTotalStreams };
  });
}

function addTotalStreamsByYearAndMonth(songs) {
  return songs.map((song) => {
    const totalStreamsByDate = song.streams.map((s, i) => ({
      ...s,
      value: s.value - (song.streams[i + 1] || {}).value,
    }));
    return { ...song, totalStreamsByDate };
  });
}

const handlers = {
  set_messages: (state, { payload: { messages, reset } }) => {
    console.log(messages);
    return {
      ...state,
      messages: reset
        ? []
        : [
            ...state.messages,
            ...messages.map((m) => ({
              track: m.name,
              message: (m.error.errors || [])[0]?.message,
            })),
          ],
    };
  },
  set_search_results: (state, { payload }) => {
    const resultsWithTotalStreams = addTotalStreamsForPeriod(payload);
    const resultsWithStreamsByYearAndMonth = addTotalStreamsByYearAndMonth(
      resultsWithTotalStreams
    );
    return {
      ...state,
      searchResults: resultsWithStreamsByYearAndMonth || [],
    };
  },
};

const reducer = (state = {}, action) => {
  const handler = handlers[action.type] || ((s) => s);
  return handler(state, action);
};

export default reducer;
