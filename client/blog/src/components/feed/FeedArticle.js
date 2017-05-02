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

              <a href={props.article.url} className='superAnchor'>
                <div className='anchorPLACEMENT'>
                  <div className='articleTITLE'>
                    <div className='articleTitlePLACEMENT'>
                      <h1>{props.article.title}</h1>
                    </div>
                  </div>
                  <div className='articleCATEGORIES'>
                    <div className='articleCategoriesPLACEMENT'>
                      <span>{props.article.subject}{'\u00A0\u00A0•\u00A0\u00A0'}{props.article.category}{'\u00A0\u00A0•\u00A0\u00A0'}{props.article.author.firstname}</span>
                    </div>
                  </div>
                  <div className='articleSUMMARY'>
                    <div className='articleSummaryPLACEMENT'>
                      <h4>{props.article.summary}</h4>
                    </div>
                  </div>
                  <div className='readMORE'>
                    <span>Read more</span>
                  </div>
                </div>
              </a>

            </div>
          </div>
        </div>
      </div>

      <div className='lower1024'>
        <div className='postData'>
          <div className='postTitle'>
            <a href={props.article.url}><h1>{props.article.title}</h1></a>
          </div>
          <div className='post'>
            <div className='postCategories'>
              <span>{props.article.subject}{'\u00A0\u00A0•\u00A0\u00A0'} • {'\u00A0\u00A0•\u00A0\u00A0'}{props.article.category}{'\u00A0\u00A0•\u00A0\u00A0'} • {'\u00A0\u00A0•\u00A0\u00A0'}{props.article.author.firstname}</span>
            </div>
            <div className='postSummary'>
              <div className='postSummaryFlex'>
                <h4>{props.article.summary}</h4>
              </div>
            </div>
            <div className='postReadBtn'>
              <a href={props.article.url}><span>Read more</span></a>
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
    author: PropTypes.object.isRequired,
    thumbnail: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      mime: PropTypes.string.isRequired
    })
  }).isRequired,
  img_class: PropTypes.string.isRequired,
  summary_class: PropTypes.string.isRequired
};
