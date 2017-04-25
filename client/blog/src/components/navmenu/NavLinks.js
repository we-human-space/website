import React from 'react';
import PropTypes from 'prop-types';
import config from '../../config';

const SERVER_PATH = `http://${config.server.rest.host}${config.server.rest.port ? `:${config.server.rest.port}` : ''}`;

export default function NavLinks(props) {



  const list = props.links.map((link) =>
    <li key={link.key}><a href={`${SERVER_PATH}${link.href}`}>{link.text}</a></li>
  );

  return (
    <div className={props.class}>
      <div className='sectionTitle'>
        <span>{props.subtitle}</span>
      </div>
      <div className='separator blockTwo'></div>
      <ul className='ulBlock'>
        { list }
      </ul>
    </div>
  );
}

NavLinks.propTypes = {
  class: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired
};
