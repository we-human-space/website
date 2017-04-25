import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';
import FeedPage from './FeedPage';

export default class Feed extends React.Component {

  constructor(props){
    super(props);
    this.props.fetchArticles();
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
    window.addEventListener('scroll', () => this.onScroll());
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refresh() {
    this.props.expireFeed();
  }

  onScroll() {
    var wtop = window.pageYOffset || document.documentElement.scrollTop;
    var fetching = !this.props.isLoadingMore();
    var dh = Math.max(document.body.scrollHeight,
                      document.body.offsetHeight,
                      document.documentElement.clientHeight,
                      document.documentElement.scrollHeight);
    var wh = 'innerHeight' in window
              ? window.innerHeight
              : document.documentElement.offsetHeight;
    if(!fetching && wtop > dh - wh - config.feed.scroll_point) {
      this.props.fetchArticles(this.generateQuery);
    }
  }

  render() {
    const pages = Object.keys(this.props.pages).reverse().map((p) => (this.props.pages[p]));
    const list = pages.map((page, i) => {
      return (
        <FeedPage key={i} articles={page} />
      );
    });
    return (
      <div>
        { list }
      </div>
    );
  }
}

Feed.propTypes = {
  query: PropTypes.object,
  cache: PropTypes.object,
  isLoadingMore: PropTypes.func.isRequired,
  isRefreshing: PropTypes.func.isRequired,
  fetchArticles: PropTypes.func.isRequired,
  expireFeed: PropTypes.func.isRequired,
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
        if(!typeof a.author === 'string')
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
