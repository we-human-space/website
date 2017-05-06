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
    onSubscribe: function(data){
      return superagent
        .post(`/subscribe`)
        .send(data)
        .then(res => {
          if(res.status === 200){
            window.location = '/suscribed';
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
