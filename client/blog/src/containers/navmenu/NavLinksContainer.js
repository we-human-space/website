import superagent from 'superagent';
import { connect } from 'react-redux';
import NavLinks from '../../components/navmenu/NavLinks';
import { author_link, nav_link, subject_link } from './link-helper';
import {update_query, request_articles, receive_articles} from '../../redux/actions/index';

const helpers = {
  'authors': author_link,
  'navlinks': nav_link,
  'subjects': subject_link
};
var cache;

const NavLinksContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavLinks);

/**
 * Summarizes the state of the pages loaded (cached page) in order to send to backend
 * for processing when fetching new articles
 **/
function summarize_cache(state){
  let page_ids = Object.keys(state.entities.pages).map(i => parseInt(i));
  let filter = window.location.search;
  let cursor;
  if(filter && state.feed[filter]){
    cursor = Object.keys(state.feed[filter]).map(i => parseInt(i)).reverse()[0];
  }
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
  return helpers[ownProps.type](state.entities[ownProps.type], ownProps.render_type);
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onClickWrapper: function(data){
      return function(e){
        // Changing the window.location without reloading
        if(data.location.pathname === window.location.pathname) {
          e.preventDefault();
          window.history.replaceState({}, data.title, data.url);

          // Close the nav menu
          if(data.render_type === 'navigation'){
            document.getElementsByClassName('hamburger')[0].click();
          }

          // Dispatching events
          dispatch(update_query(data.query));
          dispatch(request_articles(cache));

          // Updating articles
          return superagent
            .post(`/feed/`)
            .send({
              // cache + no query => initial already requested
              // cache + query + no cursor => pages already cached, but query not cached, so ask initial
              // cache + query + cursor => initial already requested for query
              action: (cache && cache.cursor)
                      ? 'REQUEST_MORE'
                      : 'REQUEST_INITIAL',
              cached: cache,
              query: data.query
            }).then(res => {
              dispatch(receive_articles(cache, data.query, res.body));

              // McGiver Stuff
              let quote_of_day = document.getElementsByClassName('quoteOfDay');
              if(quote_of_day[0]) {
                let contentContainer = quote_of_day[0].parentNode;
                contentContainer.style.margin = '-150px 0 0 0';
                contentContainer.removeChild(quote_of_day[0]);
              }
            });
        }
      };
    }
  };
}

export default NavLinksContainer;
