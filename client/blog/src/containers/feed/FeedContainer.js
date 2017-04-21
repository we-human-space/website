import fetch from 'whatwg-fetch';
import { connect } from 'react-redux';
import Feed from '../../components/feed/Feed';
import {
  request_articles,
  receive_articles,
  request_feed_update,
  receive_feed_update
} from '../../redux/reducers/index';

const config = require('../../config');
const SERVER_PATH = `${config.server.rest.host}${config.server.rest.port ? `:${config.server.rest.port}` : ''}`;

const FeedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);

function filter_articles(pages, feed) {
  let filter = window.location.search;
  if(filter && feed[filter]) {
    let filtered = {};
    for(let i in pages) {
      filtered[i] = pages[i].filter((article) => {
        return feed[filter].articles.findIndex(article.hash) !== -1;
      });
    }
    return filtered;
  }else{
    return pages;
  }
}

/**
 * Summarizes the state of the pages loaded (cached page) in order to send to backend
 * for processing when fetching new articles
 **/
function summarize_cache(state){
  let page_ids = Object.keys(state.entities.pages);
  if(page_ids.length){
    let index = state.entities.pages[Math.max.apply(null, page_ids)]
                .reduce((i, article) => {
                  return Math.max(article.pageIndex, i);
                }, 1);
    return {
      pages: page_ids,
      index: index
    }
  }
  return;
}


function mapStateToProps(state, ownProps) {
  let cache = summarize_cache(state);
  if(cache) {
    return {
      query: Object.keys(state.query).length ? state.query : undefined,
      cached: cache,
      pages: filter_articles(state.entities.pages, state.feed),
      isLoadingMore: () => state.fetching.load_more,
      isRefreshing: () => state.fetching.refresh
    };
  }else{
    return {
      query: Object.keys(state.query).length ? state.query : undefined,
      pages: filter_articles(state.entities.pages, state.feed),
      isLoadingMore: () => state.fetching.load_more,
      isRefreshing: () => state.fetching.refresh
    };
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    fetchArticles: () => {
      dispatch(request_articles());
      return fetch(
        `${SERVER_PATH}/feed/`,
        {
          method: 'POST',
          body: {
            action: 'LOAD_MORE',
            cached: ownProps.cache,
            query: ownProps.query
          }
        }).then(res => res.json())
        .then(json => dispatch(receive_articles(json)));
    },
    expireFeed: () => {
      dispatch(request_feed_update());
      return fetch(
        `${SERVER_PATH}/feed/`,
        {
          method: 'POST',
          body: {
            action: 'REFRESH',
            cached: ownProps.cache,
            query: ownProps.query
          }
        }).then(res => res.json())
        .then(json => dispatch(receive_feed_update(json)));
    }
  };
}

export default FeedContainer;
