import React from 'react';
import PropTypes from 'prop-types';

export default function FeedArticle(props){
  return (
    <div className='article'>
      <div className='postIMG'>
        <div className={props.img_class}>
          <a href={props.article.url}><img src={`/blog/${props.article.hash}/thumbnail${props.article.thumbnail.mime}`} alt='' /></a>
          <div className='upper1024'>
            <div className='overlayPlacement'>
              <div className='hover'>
                <div className='postData'>
                  <div className='postTitle'>
                    <a href={props.article.url}><h1>{props.article.title}</h1></a>
                  </div>
                  <div className='post'>
                    <div className='postCategories'>
                      <span><a href='#'>{props.article.subject}</a>{'\u00A0\u00A0•\u00A0\u00A0'}<a href='#'>{props.article.category}</a>{'\u00A0\u00A0•\u00A0\u00A0'}<a href='#'>{props.article.author}</a></span>
                    </div>
                    <div className='postSummary'>
                      <div className={props.summary_class}>
                        <h4>{props.article.summary}</h4>
                      </div>
                    </div>
                    <div className='postReadBtn'>
                      <a href='#'><span>> </span> {'\u00A0Read more'}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='lower1024'>
        <div className='postData'>
          <div className='postTitle'>
            <a href='#'><h1>{props.article.title}</h1></a>
          </div>
          <div className='post'>
            <div className='postCategories'>
              <span><a href='#'>{props.article.subject}</a>&nbsp&nbsp • &nbsp&nbsp<a href='#'>{props.article.category}</a>&nbsp&nbsp • &nbsp&nbsp<a href='#'>{props.article.author}</a></span>
            </div>
            <div className='postSummary'>
              <div className='postSummaryFlex'>
                <h4>{props.article.summary}</h4>
              </div>
            </div>
            <div className='postReadBtn'>
              <a href='#'><span>> </span> &nbspRead more</a>
            </div>
          </div>
        </div>
      </div>

    </div>

  );
}

FeedArticle.propTypes = {
  article: PropTypes.shape({
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
  }).isRequired,
  img_class: PropTypes.string.isRequired,
  summary_class: PropTypes.string.isRequired
};
