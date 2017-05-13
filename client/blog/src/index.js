import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configure_store from './redux/store/configure';
import FeedContainer from './containers/feed/FeedContainer';
import HamburgerIcon from './components/navmenu/HamburgerIcon';
import NavLinksContainer from './containers/navmenu/NavLinksContainer';
import NewsletterFormContainer from './containers/newsletter/NewsletterFormContainer';

// Browser Window Configuration
window.onload = () => { document.body.scrollTop = document.documentElement.scrollTop = 0; };

// Store Configuration
const store = configure_store(window.__PRELOADED_STATE__);

const render = () => {
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

  // Newsletter Form
  if(window.location.pathname.match(/^\/(vision|team)/)){
    ReactDOM.render(
      <Provider store={store}>
        <NewsletterFormContainer />
      </Provider>,
      document.getElementsByClassName('emailForm')[0]
    );
  }

  if(document.getElementsByClassName('hamburger').length){
    ReactDOM.render(<HamburgerIcon />, document.getElementsByClassName('hamburger')[0]);

    a(document.getElementsByClassName('exploreSection')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='navlinks' render_type='navigation' />
        </Provider>,
        e
      );
    });
    a(document.getElementsByClassName('filterBy')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='authors' render_type='navigation' />
        </Provider>,
        e
      );
    });
    a(document.getElementsByClassName('resonateWith')).forEach((e) => {
      ReactDOM.render(
        <Provider store={store}>
          <NavLinksContainer type='subjects' render_type='navigation' />
        </Provider>,
        e
      );
    });
  }
};

/**
 * Transforms an HTMLElementCollection in an Array
 **/
function a(x) { for(var i = 0, y = []; i < x.length; i++) y.push(x[i]); return y; }

render();
