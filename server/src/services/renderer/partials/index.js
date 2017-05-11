import api from './production/api/partials.json';
import base from './production/default/partials.json';
import phaseone from './production/phase-one/partials.json';
import weeklypurpose from './production/weeklypurpose/partials.json';
import localhost from './development/partials.json';

let partials;

if(__DEV__ || __TEST__){
  partials = {
    '': base,
    'api': api,
    'phase-one': phaseone,
    'weeklypurpose': weeklypurpose
  };
}else if(__PROD__){
  partials = localhost;
}


export default partials;
