import React from 'react';

export default function FeedArticle(props){
  return (
    <div className='article'>
      <div className='postIMG'>
        <div className={props.img_class}>
          <a href={props.article.url}><img src={props.article.thumbnail.src} alt='' /></a>
          <div className='overlay'>
            <div className='overlayPlacement'>
              <div className='hover'>
                <div className='postData'>
                  <div className='postTitle'>
                    <a href={props.article.url}><h1>{props.article.title}</h1></a>
                  </div>
                  <div className='post'>
                    <div className='postCategories'>
                      <span><a href='#'>{props.article.subject}</a>&nbsp&nbsp • &nbsp&nbsp<a href='#'>{props.article.category}</a>&nbsp&nbsp • &nbsp&nbsp<a href='#'>{props.article.author.firstName}</a></span>
                    </div>
                    <div className='postSummary'>
                      <div className={props.summary_class}>
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
