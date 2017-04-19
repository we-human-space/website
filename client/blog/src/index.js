(function () {
  const hamburger = document.getElementsByClassName('hamburger')[0];
  const menu = document.getElementsByClassName('menu')[0];
  const menu320 = document.querySelector('.slideDown');
  const menu768 = document.getElementsByClassName('menuContainer768')[0];
  const menu1024 = document.getElementsByClassName('menuWrapper1024')[0];
  const line1 = document.getElementsByClassName('lineUp')[0];
  const line2 = document.getElementsByClassName('lineMid')[0];
  const line3 = document.getElementsByClassName('lineDown')[0];
  const WoL = document.getElementsByClassName('WoL')[0];
  const FB = document.getElementsByClassName('FB')[0];
  const TC = document.getElementsByClassName('TC')[0];

  hamburger.addEventListener("click", clickedMenu, preventDefault, preventDefaultForScrollKeys, disableScroll);

  function clickedMenu (e) {
    if (menu.style.display === "block") {
      menu.style.display = "none";
      line1.style.display = "block";
      line3.style.display = "block";
      WoL.style.display = "block";
      FB.style.display = "block";
      TC.style.display = "block";

      e.preventDefault();
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
      document.onkeydown = null;

    } else {

      menu.style.display = "block";
      line1.style.display = "none";
      line3.style.display = "none";
      WoL.style.display = "none";
      FB.style.display = "none";
      TC.style.display = "none";

      e.preventDefault();
      window.onwheel = preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
      window.ontouchmove  = preventDefault; // mobile
      document.onkeydown  = preventDefaultForScrollKeys;
    }
  }

  function preventDefaultForScrollKeys(e) {
    var keys = [37, 38, 39, 40];
    if (keys.indexOf(e.keyCode) !== -1) {
      preventDefault(e);
      return false;
    }
  }

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
  }

  function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
  }

  function enableScroll() {
      if (window.removeEventListener)
          window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
      document.onkeydown = null;
  }
})();

import React from 'react';
import ReactDOM from 'react-dom';
import NavSections from './components/navmenu/NavSections';
import NavSubjects from './components/navmenu/NavSubjects';
import NavAuthors from './components/navmenu/NavAuthors';
// import { createStore } from 'redux';
// import counter from './reducers';

// const store = createStore(counter);
const render = () => {
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
  for(var i = 0, a = []; i < x.length; i++){
    a.push(x[i]);
  }
  return a;
}

render();
