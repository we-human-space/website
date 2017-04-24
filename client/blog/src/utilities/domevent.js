
export function preventDefaultForScrollKeys(e) {
  var keys = [37, 38, 39, 40];
  if(keys.indexOf(e.keyCode) !== -1) {
    preventDefault(e);
    return false;
  }
}

export function preventDefault(e) {
  e = e || window.event;
  if(e.preventDefault) {
    e.preventDefault();
  }
  e.returnValue = false;
}

export function disableScroll() {
  if(window.addEventListener) {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  }
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove = preventDefault; // mobile
  document.onkeydown = preventDefaultForScrollKeys;
}

export function enableScroll() {
  if(window.addEventListener) {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  }
  window.onmousewheel = document.onmousewheel = null;
  window.onwheel = null;
  window.ontouchmove = null;
  document.onkeydown = null;
}
