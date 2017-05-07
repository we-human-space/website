import React from 'react';
import PropTypes from 'prop-types';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const INVALID_CLASS = 'invalid';

class NewsletterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {firstname: '', email: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    if(e.target.className.indexOf(INVALID_CLASS)) e.target.className.replace(INVALID_CLASS, '');
    this.setState({ ...(this.state), [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    let valid = this.validate();
    if(valid.email && valid.firstname){
      this.props.onSubmit(this.state);
    }else{
      if(!valid.firstname){
        let input = document.querySelector('.emailForm .firstNameInput');
        input.className += ` ${INVALID_CLASS}`;
      }
      if(!valid.email){
        let input = document.querySelector('.emailForm .emailInputBottom');
        input.className += ` ${INVALID_CLASS}`;
      }
    }
  }

  validate() {
    let email = !!this.state.email.match(EMAIL_REGEX);
    let firstname = !!this.state.firstname && typeof this.state.firstname === 'string';
    return { email, firstname };
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} noValidate='true' >
        <input
          className='nameInputBottom firstNameInput'
          type='text'
          name='firstname'
          value={this.state.firstname}
          onChange={this.handleChange}
          placeholder='Enter your first name'
          required='true'
        />
        <div className='emailInputBottomPlacement'>
          <input
            className='emailInputBottom'
            type='email'
            name='email'
            value={this.state.email}
            onChange={this.handleChange}
            placeholder='Enter your email address'
            required='true'
          />
        </div>
        <input className='joinBtnBottom' type='submit' value='Join Us!' />
      </form>
    );
  }
}

NewsletterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default NewsletterForm;
