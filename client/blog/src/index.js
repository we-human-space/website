import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configure_store from './redux/store/configure';
import FeedContainer from './containers/feed/FeedContainer';
import HamburgerIcon from './components/navmenu/HamburgerIcon';
import NavLinksContainer from './containers/navmenu/NavLinksContainer';

// Browser Window Configuration
window.onload = () => { document.body.scrollTop = document.documentElement.scrollTop = 0; };
window.onbeforeunload = () => { document.body.scrollTop = document.documentElement.scrollTop = 0; };

// Store Configuration
const store = configure_store(window.__PRELOADED_STATE__);

let render = () => {
  // Feed and articles
  if(window.location.pathname.match(/^\/blog\//)){
    // Feed only
    if(window.location.pathname.match(/^\/blog\/$/)){
      ReactDOM.render(
        <Provider store={store}>
          <FeedContainer />
        </Provider>,
        document.getElementById('feed')
      );
    }
    ReactDOM.render(
      <Provider store={store}>
        <NavLinksContainer type='subjects' render_type='filter' />
      </Provider>,
      document.getElementsByClassName('filters')[0]
    );
  }

  if(document.getElementsByClassName('hamburger').length){
    ReactDOM.render(<HamburgerIcon />, document.getElementsByClassName('hamburger')[0]);

    toArray(document.getElementsByClassName('exploreSection')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='navlinks' render_type='navigation' />
        </Provider>,
        e
      );
    });
    toArray(document.getElementsByClassName('filterBy')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='authors' render_type='navigation' />
        </Provider>,
        e
      );
    });
    toArray(document.getElementsByClassName('resonateWith')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='subjects' render_type='navigation' />
        </Provider>,
        e
      );
    });
  }
};

function toArray(x) {
  for(var i = 0, a = []; i < x.length; i++) {
    a.push(x[i]);
  }
  return a;
}

render();
