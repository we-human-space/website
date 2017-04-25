import React from 'react';
import PropTypes from 'prop-types';
import FeedArticle from './FeedArticle';

export default function FeedPage(props) {
  const list = props.articles.map((article) => {
    return (
      <FeedArticle
        key={`${article.pageIndex}-${article.hash}`}
        article={article}
        img_class={article.thumbnail.width > 750 ? 'imgWIDER750PX' : 'imgLESS750PX'}
        summary_class={article.thumbnail.width > 900 ? 'postSummaryFlex' : 'widerSummaryFlex'}
      />
    );
  });
  return (
    <div>
      { list }
    </div>
  );
};

FeedPage.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.shape({
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
      mime: PropTypes.string.isRequired
    })
  })).isRequired
};
