import partials from './partials.json';
import api from './production/api/partials.json';
import base from './production/default/partials.json';
import phaseone from './production/phase-one/partials.json';
import weeklypurpose from './production/weeklypurpose/partials.json';
import localhost from './development/partials.json';

function routing(host){
  if(__DEV__ || __TEST__){
    return localhost;
  }else if(__PROD__){
    switch(host){
    case 'maat.space':
      return base;
    case 'api.maat.space':
      return api;
    case 'phase-one.maat.space':
      return phaseone;
    case 'weeklypurpose.maat.space':
      return weeklypurpose;
    default:
      return base;
    }
  }
}

const render_config = {
  partials,
  routing
};

export default render_config;
