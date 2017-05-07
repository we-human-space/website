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
          console.log(res);
          if(res.status === 200){
            window.location = '/subscribed';
          }else if(res.status === 400){
            window.location = '/error';
          }else{
            window.location = '/error';
          }
        }).catch((err) => {
          console.log(err);
          // window.location = '/error';
        });
    }
  };
}

export default NewsletterFormContainer;
