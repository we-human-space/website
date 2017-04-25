import superagent from 'superagent';
import { connect } from 'react-redux';
import config from '../../config';
import Feed from '../../components/feed/Feed';
import {
  request_articles,
  receive_articles,
  request_refresh_articles,
  receive_refresh_articles
} from '../../redux/actions/index';

const SERVER_PATH = `http://${config.server.rest.host}${config.server.rest.port ? `:${config.server.rest.port}` : ''}`;

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
    };
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
      dispatch(request_articles(ownProps.cache));
      return superagent
        .post(`${SERVER_PATH}/feed/`)
        .send({
          action: ownProps.cache ? 'REQUEST_MORE' : 'REQUEST_INITIAL',
          cached: ownProps.cache || undefined,
          query: ownProps.query
        }).then(res => { console.log(res.body); dispatch(receive_articles(ownProps, res.body)); });
    },
    expireFeed: () => {
      dispatch(request_refresh_articles(ownProps.cache));
      return superagent
        .post(`${SERVER_PATH}/feed/`)
        .send({
          action: ownProps.cache ? 'REFRESH' : 'REQUEST_INITIAL',
          cached: ownProps.cache,
          query: ownProps.query
        }).then(res => { console.log(res.body); dispatch(receive_refresh_articles(ownProps, res.body)); });
    }
  };
}

export default FeedContainer;
