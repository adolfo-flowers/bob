export const actionSetSearchResults = (results) => ({
  type: 'set_search_results',
  payload: results,
});
export const actionSetMessages = (errors) => ({
  type: 'set_messages',
  payload: errors,
});

function addTotalStreamsForPeriod(songs) {
  return songs.map((r) => {
    const streams = r.streams((s) => s.value);
    const perodTotalStreams = streams[0] - streams[streams.length - 1];
    return { ...r, perodTotalStreams };
  });
}

function addTotalStreamsByYearAndMonth(songs) {
  return songs;
}

const handlers = {
  set_messages: (state, { payload: { messages, reset } }) => {
    return {
      ...state,
      messages: reset
        ? []
        : [
            ...state.messages,
            ...messages.map((m) => ({
              track: m.name,
              message: m.error.errors[0].message,
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
      searchResults: resultsWithTotalStreams || [],
    };
  },
};

const reducer = (state = {}, action) => {
  const handler = handlers[action.type] || ((s) => s);
  return handler(state, action);
};

export default reducer;
