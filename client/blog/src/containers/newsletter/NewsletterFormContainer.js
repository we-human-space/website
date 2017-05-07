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
        .then(res => {
          console.log(res.status);
          if(res.status === 200){
            window.location = '/subscribed';
          }else{
            window.location = '/error';
          }
        }).catch((err) => {
          window.location = '/error';
        });
    }
  };
}

export default NewsletterFormContainer;
