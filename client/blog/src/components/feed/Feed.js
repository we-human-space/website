import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';
import FeedQuote from './FeedQuote';
import quotes from '../../static/quotes.json';
import FeedPage from './FeedPage';

export default class Feed extends React.Component {

  constructor(props){
    super(props);
    this.props.fetchArticles();
    this.conditions = {
      scroll: 0,
      lastArticle: null
    };
  }

  componentDidMount() {
    // Refresh articles
    this.timerID = setInterval(
      () => {
        if(!this.props.isRefreshing()) {
          this.refresh();
        }
      },
      config.feed.refresh_timeout
    );
    // Load More articles
    let self = this;
    window.addEventListener('scroll', () => {
      // To ensure that the scroll position is checked only after reflow of DOM
      // http://stackoverflow.com/a/34999925/4442749
      setTimeout(function () {
        window.requestAnimationFrame(() => self.onScroll());
      }, 0);
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refresh() {
    this.props.expireFeed();
  }

  onScroll() {
    let prev_scroll = this.conditions.scroll;
    let curr_scroll = window.pageYOffset || document.documentElement.scrollTop;
    // Only trigger the action if scrolling direction is down
    if(curr_scroll > prev_scroll){
      let fetching = this.props.isLoadingMore() || this.props.isLoadingInitial();
      let dh = Math.max(document.body.scrollHeight,
                        document.body.offsetHeight,
                        document.documentElement.clientHeight,
                        document.documentElement.scrollHeight);
      let wh = 'innerHeight' in window
                ? window.innerHeight
                : document.documentElement.offsetHeight;
      // !fetching => wait until fetch is done
      // curr_scroll => to avoid trigger for the browser config of scroll to top onload
      // curr_scroll > dh - wh - config.feed.scroll_point => To check if at the bottom
      if(!fetching && curr_scroll && curr_scroll > dh - wh - config.feed.scroll_point) {
        // Valid attempt, but check if the last REQUEST_MORE has updated the articles
        // before issuing another request
        let prev_last_article = this.conditions.lastArticle;
        let last_article;
        // Assigns an integer ID value to the articles
        if(this.props.pages){
          let last_page = this.props.pages[Math.min.apply(null, Object.keys(this.props.pages))];
          last_article = last_page[0].page * 10 + last_page.reduce((acc, a) => Math.max(acc, a.pageIndex), 0);
        }
        if((!prev_last_article && last_article) || (last_article < prev_last_article)){
          this.props.fetchArticles();
          this.conditions = { ...(this.conditions), scroll: curr_scroll, lastArticle: last_article };
        }
      }else{
        this.conditions = { ...(this.conditions), scroll: curr_scroll };
      }
    }
  }

  render() {
    const quote = quotes[this.props.subject] ? quotes[this.props.subject].quote : quotes['default'].quote;
    const source = quotes[this.props.subject] ? quotes[this.props.subject].source : quotes['default'].source;
    const pages = Object.keys(this.props.pages).reverse().map((p) => (this.props.pages[p]));
    const list = pages.map((page, i) => {
      return (
        <FeedPage key={i} articles={page} />
      );
    });
    return (
      <div>
        <FeedQuote quote={quote} source={source} />
        <div>
          { list }
        </div>
      </div>
    );
  }
}

Feed.propTypes = {
  isLoadingMore: PropTypes.func.isRequired,
  isLoadingInitial: PropTypes.func.isRequired,
  isRefreshing: PropTypes.func.isRequired,
  fetchArticles: PropTypes.func.isRequired,
  expireFeed: PropTypes.func.isRequired,
  subject: PropTypes.string.isRequired,
  pages: PropTypes.objectOf(function(props, propName, componentName) {
    let error;
    let page = props[propName];
    if(Array.isArray(page)){
      page.forEach((a, i) => {
        /*eslint-disable*/
        if(!typeof a.hash === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].hash supplied to \`${componentName}\`. Validation failed.`);
        if(!Number.isInteger(a.page))
          error = new Error(`Invalid prop pages[${propName}][${i}].page supplied to \`${componentName}\`. Validation failed.`);
        if(!Number.isInteger(a.pageIndex))
          error = new Error(`Invalid prop pages[${propName}][${i}].pageIndex supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.title === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].title supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.url === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].url supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.subject === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].subject supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.category === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].Error supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.summary === 'string')
          error = new Error(`Invalid prop pages[${propName}][${i}].summary supplied to \`${componentName}\`. Validation failed.`);
        if(!typeof a.author === 'object')
          error = new Error(`Invalid prop pages[${propName}][${i}].author supplied to \`${componentName}\`. Validation failed.`);
        if(typeof a.thumbnail === 'object'){
          if(!Number.isInteger(a.thumbnail.width))
            error = new Error(`Invalid prop pages[${propName}][${i}].thumbnail.width supplied to \`${componentName}\`. Validation failed.`);
          if(!Number.isInteger(a.thumbnail.height))
            error = new Error(`Invalid prop pages[${propName}][${i}].thumbnail.height supplied to \`${componentName}\`. Validation failed.`);
          if(!typeof a.thumbnail.mime === 'string')
            error = new Error(`Invalid prop pages[${propName}][${i}].thumbnail.mime supplied to \`${componentName}\`. Validation failed.`);
        }else{
          error = new Error(`Invalid prop pages[${propName}][${i}].thumbnail supplied to \`${componentName}\`. Validation failed.`);
        }
        /*eslint-enable*/
      });
    }
    return error;
  })
};
