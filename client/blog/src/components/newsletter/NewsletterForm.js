import React from 'react';
import PropTypes from 'prop-types';

class NewsletterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {firstname: '', lastname: '', email: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ ...(this.state), [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
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
