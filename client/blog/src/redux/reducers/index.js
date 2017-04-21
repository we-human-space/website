import { combineReducers } from 'redux';
import { ActionTypes } from '../actions/index';

const initial_state = {
  fetching: {
    refresh: false,
    load_more: false
  },
  query: {},
  entities: {
    pages: {},
    authors: {}
  },
  feed: {}
};

function fetching(state = initial_state.fetching, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_ARTICLES:
  case ActionTypes.RECEIVE_ARTICLES:
    return {refresh: state.refresh, load_more: !state.load_more};
  case ActionTypes.REQUEST_FEED_UPDATE:
  case ActionTypes.RECEIVE_FEED_UPDATE:
    return {refresh: !state.refresh, load_more: state.load_more};
  default:
    return state;
  }
}

function entities(state = initial_state.entities, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_ARTICLES:
  case ActionTypes.REQUEST_FEED_UPDATE:
    return { ...state };
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_FEED_UPDATE:
    return update_pages(state, action);
  default:
    return state;
  }
}

function feed(state = initial_state.feed, action) {
  switch(action.type) {
  case ActionTypes.REQUEST_ARTICLES:
  case ActionTypes.REQUEST_FEED_UPDATE:
    return { ...state };
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_FEED_UPDATE:
    return update_feed(state, action);
  default:
    return state;
  }
}

function query(state = initial_state.query, action){
  switch(action.type) {
  case ActionTypes.UPDATE_QUERY:
    return { ...state }
  default:
    return state;
  }
}

function update_pages(state, action) {
  let pages = action.payload.result.pages;
  return {
    pages: { ...state.pages, ...pages },
    authors: { ...state.authors }
  };
}

function update_feed(state, action) {
  let match = action.payload.result.match;
  return {
    ...state,
    [window.location.search]: Array.isArray(match)
                              ? state[window.location.search].concat(...action.payload.result.match)
                              : state[window.location.search].slice()
  };
}

const reducer = combineReducers({
  entities,
  feed,
  query,
  fetching
});

export default reducer;
