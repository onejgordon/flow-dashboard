// import {isFunction} from 'lodash';
// import StatusActions from 'actions/status-actions';
import UserActions from '../actions/UserActions';
var $ = require('jquery');


export default {
  networkAction: async function(context, method, ...params) {
    console.log('networkAction...' + method)
    try {
      // StatusActions.started();
      const response = await method.apply(context, params);
      // const data = isFunction(response) ? response().data : response.data;
      context.dispatch(response().data);
      // StatusActions.done();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        UserActions.logout();
      }
      else {
        // StatusActions.failed({config: err.config, action: context.actionDetails});
      }
    }
  },

  post: function(context, path, data) {
    try {
      // StatusActions.started();
      $.post(path, data, function(res) {
        context.dispatch(res);  
      }, 'json');
      // StatusActions.done();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        UserActions.logout();
      }
      else {
        // StatusActions.failed({config: err.config, action: context.actionDetails});
      }
    }
  },

  get: function(context, path, data) {
    try {
      // StatusActions.started();
      $.getJSON(path, data, function(res) {
        context.dispatch(res);  
      });
      // StatusActions.done();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        UserActions.logout();
      }
      else {
        // StatusActions.failed({config: err.config, action: context.actionDetails});
      }
    }
  }  

};