import superagent from 'superagent';
import { connect } from 'react-redux';
import Feed from '../../components/feed/Feed';
import {
  request_articles,
  receive_articles,
  request_refresh_articles,
  receive_refresh_articles
} from '../../redux/actions/index';

var cache;
var query;

const FeedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);

function apply_authorship(authors, pages) {
  return Object.keys(pages).reduce((acc, p) => {
    acc[p] = pages[p].map((a) => {
      return {
        ...a,
        author: authors[a.author]
      };
    });
    return acc;
  }, {});
}

function filter_articles(pages, feed) {
  let filter = window.location.search;
  if(filter && feed[filter]) {
    let filtered = {};
    for(let i in pages) {
      filtered[i] = pages[i].filter((article) => {
        return feed[filter][i] && feed[filter][i].findIndex((a) => a.hash === article.hash) !== -1;
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
  let page_ids = Object.keys(state.entities.pages).map(i => parseInt(i));
  let filter = window.location.search;
  let cursor;
  if(filter){
    if(state.feed[filter]) cursor = Object.keys(state.feed[filter]).reverse()[0];
    else cursor = page_ids[page_ids.length - 1];
  }
  console.log(`cursor: ${cursor}`);
  if(page_ids.length){
    let index = state.entities.pages[Math.max.apply(null, page_ids)]
                .reduce((i, article) => {
                  return Math.max(article.pageIndex, i);
                }, 1);
    return {
      pages: page_ids,
      index,
      cursor
    };
  }
  return;
}


function mapStateToProps(state, ownProps) {
  cache = summarize_cache(state);
  query = Object.keys(state.query).length ? state.query : undefined;
  return {
    pages: apply_authorship(state.entities.authors, filter_articles(state.entities.pages, state.feed)),
    isLoadingMore: () => state.fetching.load_more,
    isLoadingInitial: () => state.fetching.initial,
    isRefreshing: () => state.fetching.refresh
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    fetchArticles: () => {
      console.log('payload');
      console.log({
        action: cache ? 'REQUEST_MORE' : 'REQUEST_INITIAL',
        cached: cache,
        query: query
      });
      dispatch(request_articles(cache));
      return superagent
        .post(`/feed/`)
        .send({
          action: cache ? 'REQUEST_MORE' : 'REQUEST_INITIAL',
          cached: cache,
          query: query
        }).then(res => { dispatch(receive_articles(cache, query, res.body)); });
    },
    expireFeed: () => {
      dispatch(request_refresh_articles(cache));
      return superagent
        .post(`/feed/`)
        .send({
          action: cache ? 'REFRESH' : 'REQUEST_INITIAL',
          cached: cache,
          query: query
        }).then(res => { dispatch(receive_refresh_articles(cache, query, res.body)); });
    }
  };
}

export default FeedContainer;
