import React from 'react';
import PropTypes from 'prop-types';

export default class NavLinks extends React.Component{

  isActive(link){
    return window.location.search && link.location.search && window.location.search.match(link.location.search);
  }

  render(){
    const list = this.props.links.map((link) => {
      return (
        <li key={link.key}>
          <a href={link.url}
            onClick={this.props.type !== 'navlinks' ? this.props.onClickWrapper(link) : () => {}}
            className={this.isActive(link) ? 'liActive' : undefined}
          >{link.text}</a>
        </li>
      );
    });
    if(this.props.render_type === 'navigation'){
      return (
        <div className={this.props.class}>
          <div className='sectionTitle'>
            <span>{this.props.subtitle}</span>
          </div>
          <div className='separator blockTwo'></div>
          <ul className='ulBlock'>
            { list }
          </ul>
        </div>
      );
    }else if(this.props.render_type === 'filter'){
      return (
        <div className='filtersPlacement'>
          <ul className='ulTop1024'>
            { list }
          </ul>
        </div>
      );
    }
  }
}

NavLinks.propTypes = {
  onClickWrapper: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  render_type: PropTypes.string.isRequired,
  class: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
      search: PropTypes.string
    }),
    key: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired
};
