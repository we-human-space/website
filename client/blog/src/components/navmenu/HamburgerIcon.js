import React from 'react';
import {
  preventDefault,
  disableScroll,
  enableScroll,
  preventDefaultForScrollKeys
} from '../../utilities/domevent';

export default class HamburgerIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: document.getElementsByClassName('menu')[0],
      navLinks: [...document.getElementsByClassName('navLink')],
      button: document.getElementsByClassName('hamburger')[0],
      isVisible: false
    };
  }

  render() {
    return (
      <a href='#'>
        <div
          style={{display: !this.state.isVisible ? 'block' : 'none'}}
          className='lineUp lineStyle'>
        </div>
        <div className='lineMid lineStyle'></div>
        <div
          style={{display: !this.state.isVisible ? 'block' : 'none'}}
          className='lineDown lineStyle'>
        </div>
      </a>
    );
  }

  componentDidMount() {
    this.state.button.addEventListener('click', (e) => this.handleClick(e));
  }

  handleClick(e) {
    if(!this.state.isVisible) {
      this.state.menu.style.display = 'block';
      this.state.navLinks.forEach((e) => { e.style.display = 'none'; });
      e.preventDefault();
      disableScroll();
    }else{
      this.state.menu.style.display = 'none';
      this.state.navLinks.forEach((e) => { e.style.display = 'block'; });
      e.preventDefault();
      enableScroll();
    }
    this.setState((prevState, props) => ({
      isVisible: !prevState.isVisible
    }));
    preventDefault(e);
    preventDefaultForScrollKeys(e);
  }
}
