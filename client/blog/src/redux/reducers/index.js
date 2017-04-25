import { combineReducers } from 'redux';
import { ActionTypes } from '../actions/index';

const initial_state = {
  fetching: {
    refresh: false,
    initial: false,
    load_more: false
  },
  query: {},
  entities: {
    subjects: {},
    pages: {},
    authors: {},
    navlinks: []
  },
  feed: {}
};

function fetching(state = initial_state.fetching, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_MORE_ARTICLES:
  case ActionTypes.RECEIVE_MORE_ARTICLES:
    return { ...state, load_more: !state.load_more };
  case ActionTypes.REQUEST_INITIAL_ARTICLES:
  case ActionTypes.RECEIVE_INITIAL_ARTICLES:
    return { ...state, initial: !state.initial };
  case ActionTypes.REQUEST_REFRESH_ARTICLES:
  case ActionTypes.RECEIVE_REFRESH_ARTICLES:
    return { ...state, refresh: !state.refresh };
  default:
    return state;
  }
}

function entities(state = initial_state.entities, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_MORE_ARTICLES:
  case ActionTypes.REQUEST_INITIAL_ARTICLES:
  case ActionTypes.REQUEST_REFRESH_ARTICLES:
    return { ...state };
  case ActionTypes.RECEIVE_MORE_ARTICLES:
  case ActionTypes.RECEIVE_INITIAL_ARTICLES:
  case ActionTypes.RECEIVE_REFRESH_ARTICLES:
    return update_pages(state, action);
  default:
    return state;
  }
}

function feed(state = initial_state.feed, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_MORE_ARTICLES:
  case ActionTypes.REQUEST_INITIAL_ARTICLES:
  case ActionTypes.REQUEST_REFRESH_ARTICLES:
    return { ...state };
  case ActionTypes.RECEIVE_MORE_ARTICLES:
  case ActionTypes.RECEIVE_INITIAL_ARTICLES:
  case ActionTypes.RECEIVE_REFRESH_ARTICLES:
    return update_feed(state, action);
  default:
    return state;
  }
}

function query(state = initial_state.query, action){
  switch(action.type) {
  case ActionTypes.UPDATE_QUERY:
    return { ...state };
  default:
    return state;
  }
}

function update_pages(state, action) {
  let pages = action.payload.pages;
  return {
    ...state,
    pages: { ...state.pages, ...pages },
    authors: { ...state.authors }
  };
}

function update_feed(state, action) {
  let match = action.payload.match;
  let search = Array.isArray(state[window.location.search])
               ? state[window.location.search].slice()
               : [];
  return {
    ...state,
    [window.location.search]: Array.isArray(match)
                              ? search.concat(...action.payload.match)
                              : search
  };
}

const reducer = combineReducers({
  entities,
  feed,
  query,
  fetching
});

export default reducer;
