// import superagent from 'superagent';
import { connect } from 'react-redux';
import config from '../../config';
import NavLinks from '../../components/navmenu/NavLinks';
import { author_link, nav_link, subject_link } from './link-helper';
// import {
//   request_articles,
//   receive_articles,
//   request_refresh_articles,
//   receive_refresh_articles
// } from '../../redux/actions/index';

// const SERVER_PATH = `http://${config.server.rest.host}${config.server.rest.port ? `:${config.server.rest.port}` : ''}`;
const helpers = {
  'authors': author_link,
  'navlinks': nav_link,
  'subjects': subject_link
};

const NavLinksContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavLinks);


function mapStateToProps(state, ownProps) {
  let type = ownProps.type;
  return helpers[type](state.entities[type]);
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onClick: function(e){
      // dispatch(request_articles(cache));
      // return superagent
      //   .post(`${SERVER_PATH}/feed/`)
      //   .send({
      //     action: cache ? 'REQUEST_MORE' : 'REQUEST_INITIAL',
      //     cached: cache,
      //     query: query
      //   }).then(res => { dispatch(receive_articles(cache, query, res.body)); });
    }
  };
}

export default NavLinksContainer;
