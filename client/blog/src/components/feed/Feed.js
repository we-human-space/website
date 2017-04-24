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
  query: PropTypes.object.isRequired,
  isLoadingMore: PropTypes.func.isRequired,
  isRefreshing: PropTypes.func.isRequired,
  fetchArticles: PropTypes.func.isRequired,
  expireFeed: PropTypes.func.isRequired,
  pages: PropTypes.arrayOf(PropTypes.shape({
    hash: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    pageIndex: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    thumbnail: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      src: PropTypes.string.isRequired
    })
  })).isRequired
};
