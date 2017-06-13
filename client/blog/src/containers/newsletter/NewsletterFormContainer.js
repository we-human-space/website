import superagent from 'superagent';
import { connect } from 'react-redux';
import NewsletterForm from '../../components/newsletter/NewsletterForm';
import config from '../../config';

const NewsletterFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewsletterForm);

function mapStateToProps(state, ownProps) { return {...ownProps}; }

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: function(data){
      return superagent
        .post(config.routing['subscribe'])
        .send(data)
        .then(() => { window.location = config.routing['subscribed']; })
        .catch((err) => {
          console.log(err);
          if(err.status === 400){
            window.location = config.routing['already-subscribed'];
          }else{
            window.location = config.routing['error'];
          }
        });
    }
  };
}

export default NewsletterFormContainer;
