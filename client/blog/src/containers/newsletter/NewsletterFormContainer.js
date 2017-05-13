import superagent from 'superagent';
import { connect } from 'react-redux';
import NewsletterForm from '../../components/newsletter/NewsletterForm';

const NewsletterFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewsletterForm);

function mapStateToProps(state, ownProps) { return {}; }

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: function(data){
      return superagent
        .post(`/subscribe`)
        .send(data)
        .then(() => { window.location = '/subscribed'; })
        .catch((err) => {
          console.log(err);
          if(err.status === 400){
            window.location = '/already-subscribed';
          }else{
            window.location = '/error';
          }
        });
    }
  };
}

export default NewsletterFormContainer;
