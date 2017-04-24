export const ActionTypes = {
  REQUEST_TAGS_AND_AUTHORS: 'REQUEST_TAGS_AND_AUTHORS', // Request all tags and authors for menu display
  RECEIVE_TAGS_AND_AUTHORS: 'RECEIVE_TAGS_AND_AUTHORS', // Receive all tags and authors for menu display
  REQUEST_ARTICLES: 'REQUEST_ARTICLES', // Request articles starting at article X for criteria Y
  RECEIVE_ARTICLES: 'RECEIVE_ARTICLES', // Receive articles stareting at article X for criteria Y
  UPDATE_QUERY: 'UPDATE_QUERY', // An update to the query has been issued.
  EXPIRE_FEED: 'EXPIRE_FEED', // Expresses that it is time to update the feed
  REQUEST_FEED_UPDATE: 'REQUEST_FEED_UPDATE', // Request a feed update (new articles)
  RECEIVE_FEED_UPDATE: 'RECEIVE_FEED_UPDATE', // Receive a non-empty response for feed update
  REQUEST_SEARCH_ARTICLES: 'SEARCH_ARTICLES', // Issue a search query
  RECEIVE_SEARCH_RESULTS: 'SEARCH_RESULTS', // Receive the search results
  REQUEST_AUTHORS: 'REQUEST_AUTHORS', // Request a list of authors
  RECEIVE_AUTHORS: 'RECEIVE_AUTHORS', // Receive the list of authors
  NEWSLETTER_SUBSCRIPTION: 'NEWSLETTER_SUBSCRIPTION' // Subscribe to the newsletter
};

export function request_articles() {
  return {
    type: ActionTypes.REQUEST_ARTICLES
  };
}

export function receive_articles(json) {
  return {
    type: ActionTypes.RECEIVE_ARTICLES,
    payload: {
      result: json.data.children.map(child => child.data)
    }
  };
}

export function request_authors() {
  return {
    type: ActionTypes.REQUEST_AUTHORS
  };
}

export function receive_authors(json) {
  return {
    type: ActionTypes.RECEIVE_AUTHORS,
    payload: {
      authors: json.data.children.map(child => child.data)
    }
  };
}

export function request_feed_update() {
  return {
    type: ActionTypes.REQUEST_FEED_UPDATE,
  };
}

export function receive_feed_update(json) {
  return {
    type: ActionTypes.REQUEST_FEED_UPDATE,
    payload: {
      articles: json.data.children.map(child => child.data)
    }
  };
}

export function update_query(query) {
  return {
    type: ActionTypes.UPDATE_QUERY,
    payload: {
      query
    }
  };
}
