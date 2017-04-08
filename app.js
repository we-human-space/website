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

  // console.log(hamburger);
  // console.log(menu);
  // console.log(line1);
  // console.log(WoL);
  console.log(menu320);

  hamburger.addEventListener("click", clickedMenu, preventDefault, preventDefaultForScrollKeys, disableScroll);
  // menu.addEventListener("animationend", menuTime);

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

  // function menuTime (e) {
  //   console.log(e);
  //   console.log("menuTime");
  //   if (menu.style.display === 'block') {
  //     menu320.style.animationName = 'slideUp';
  //   } else {
  //     menu320.style.animationName = 'slideDown';
  //   }
  // }


  var keys = {37: 1, 38: 1, 39: 1, 40: 1};

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
  }

  function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
          preventDefault(e);
          return false;
      }
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


  // var themeChosen = false;
  // var currentThemeClass = "dayclass";
  //
  // setInterval(function(){
  //   let timeOfDay = new Date().getUTCTime();
  //   if(timeOfDay > ...  && 1 themeChosen){
  //     document.getElementsByClassName("dayclass").class("nightclass");
  //   }
  // }, 60*20000)

})();
