import React from 'react';
import ReactDOM from 'react-dom';
import HamburgerIcon from './components/navmenu/HamburgerIcon';
import NavSections from './components/navmenu/NavSections';
import NavSubjects from './components/navmenu/NavSubjects';
import NavAuthors from './components/navmenu/NavAuthors';
// import { createStore } from 'redux';
// import counter from './reducers';

// const store = createStore(counter);
const render = () => {
  ReactDOM.render(<HamburgerIcon />, document.getElementsByClassName('hamburger')[0]);

  toArray(document.getElementsByClassName('exploreSection')).forEach((e) => {
    ReactDOM.render(<NavSections />, e);
  });
  toArray(document.getElementsByClassName('filterBy')).forEach((e) => {
    ReactDOM.render(<NavAuthors />, e);
  });
  toArray(document.getElementsByClassName('resonateWith')).forEach((e) => {
    ReactDOM.render(<NavSubjects />, e);
  });
  // ReactDOM.render(<NavMenu />, menu);
};

function toArray(x) {
  for(var i = 0, a = []; i < x.length; i++) {
    a.push(x[i]);
  }
  return a;
}

render();
