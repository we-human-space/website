import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configure_store from './redux/store/configure';
import FeedContainer from './containers/feed/FeedContainer';
import HamburgerIcon from './components/navmenu/HamburgerIcon';
import NavSections from './components/navmenu/NavSections';
import NavSubjects from './components/navmenu/NavSubjects';
import NavAuthors from './components/navmenu/NavAuthors';
const env = process.NODE_ENV || 'development';

global.__PROD__ = env === 'production';
global.__DEV__ = env === 'development';
global.__TEST__ = env === 'test';

const store = configure_store();

if(__DEV__ || __TEST__) {
  // Log the initial state
  console.log(store.getState());
  // Subscribe to store changes
  store.subscribe(() =>
    console.log(store.getState())
  );
}

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <FeedContainer />
    </Provider>,
    document.getElementById('feed')
  );

  ReactDOM.render(<HamburgerIcon />, document.getElementsByClassName('hamburger')[0]);

  // TODO: Refactor the following three in a single component to which important
  // class names & text are passed
  toArray(document.getElementsByClassName('exploreSection')).forEach((e) => {
    ReactDOM.render(<NavSections />, e);
  });
  toArray(document.getElementsByClassName('filterBy')).forEach((e) => {
    ReactDOM.render(<NavAuthors />, e);
  });
  toArray(document.getElementsByClassName('resonateWith')).forEach((e) => {
    ReactDOM.render(<NavSubjects />, e);
  });
};

function toArray(x) {
  for(var i = 0, a = []; i < x.length; i++) {
    a.push(x[i]);
  }
  return a;
}

render();
