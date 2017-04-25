export const ActionTypes = {
  REQUEST_TAGS_AND_AUTHORS: 'REQUEST_TAGS_AND_AUTHORS', // Request all tags and authors for menu display
  RECEIVE_TAGS_AND_AUTHORS: 'RECEIVE_TAGS_AND_AUTHORS', // Receive all tags and authors for menu display
  REQUEST_INITIAL_ARTICLES: 'REQUEST_INITIAL_ARTICLES', // Request latest articles
  RECEIVE_INITIAL_ARTICLES: 'RECEIVE_INITIAL_ARTICLES', // Receive latest articles
  REQUEST_MORE_ARTICLES: 'REQUEST_MORE_ARTICLES', // Request articles starting at article X for criteria Y
  RECEIVE_MORE_ARTICLES: 'RECEIVE_MORE_ARTICLES', // Receive articles stareting at article X for criteria Y
  UPDATE_QUERY: 'UPDATE_QUERY', // An update to the query has been issued.
  REQUEST_REFRESH_ARTICLES: 'REQUEST_REFRESH_ARTICLES', // Request a feed update (new articles)
  RECEIVE_REFRESH_ARTICLES: 'RECEIVE_REFRESH_ARTICLES' // Receive a non-empty response for feed update
};

export function request_tags_and_authors() {
  return {
    type: ActionTypes.REQUEST_TAGS_AND_AUTHORS
  };
}

export function receive_tags_and_authors(data) {
  return {
    type: ActionTypes.RECEIVE_TAGS_AND_AUTHORS,
    payload: {
      result: data
    }
  };
}

export function request_articles(cache) {
  if(cache){
    return request_more_articles();
  }else{
    return request_initial_articles();
  }
}

export function receive_articles(cache, query, data) {
  if(cache){
    return receive_more_articles(query, data);
  }else{
    return receive_initial_articles(query, data);
  }
}

function request_more_articles() {
  return {
    type: ActionTypes.REQUEST_MORE_ARTICLES
  };
}

function receive_more_articles(query, data) {
  return {
    type: ActionTypes.RECEIVE_MORE_ARTICLES,
    payload: {
      query,
      ...data
    }
  };
}

function request_initial_articles() {
  return {
    type: ActionTypes.REQUEST_INITIAL_ARTICLES
  };
}

function receive_initial_articles(query, data) {
  return {
    type: ActionTypes.RECEIVE_INITIAL_ARTICLES,
    payload: {
      query,
      ...data
    }
  };
}

export function request_refresh_articles() {
  return {
    type: ActionTypes.REQUEST_REFRESH_ARTICLES
  };
}

export function receive_refresh_articles(query, data) {
  return {
    type: ActionTypes.RECEIVE_REFRESH_ARTICLES,
    payload: {
      query,
      ...data
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
