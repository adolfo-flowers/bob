export const actionSetSearchResults = (results) => ({
  type: 'set_search_results',
  payload: results,
});

const handlers = {
  set_search_results: (state, { payload }) => {
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
