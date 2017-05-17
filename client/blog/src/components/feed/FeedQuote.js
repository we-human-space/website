import React from 'react';
import PropTypes from 'prop-types';

export default function FeedQuote(props){
  return (
    <div className='quoteOfDay'>
      <div className='quoteOfDayPlacement'>
        <span className='quote320'>
          <h2>{props.quote}</h2>
          <span className='quoteAuthor'>{props.source}</span>
        </span>
        <span className='quote768'>
          <h2>{props.quote}</h2>
          <span className='quoteAuthor'>{props.source}</span>
        </span>
      </div>
    </div>
  );
}

FeedQuote.propTypes = {
  quote: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired
};
