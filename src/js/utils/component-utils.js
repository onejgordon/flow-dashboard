var util = require('utils/util');

export default {
  changeHandler: function(target) {
    target.prototype.changeHandlerVal = function(key, attr, value) {
      var state = {};
      if (key != null) {
        state[key] = this.state[key] || {};
        state[key][attr] = value;
      } else {
        state[attr] = value;
      }
      state.lastChange = util.nowTimestamp(); // ms
      this.setState(state);
    };
    target.prototype.changeHandler = function(key, attr, event) {
      this.changeHandlerVal(key, attr, event.currentTarget.value);
    };
    target.prototype.changeHandlerDropDown = function(key, attr, event, index, value) {
      this.changeHandlerVal(key, attr, value);
    };
    target.prototype.changeHandlerSlider = function(key, attr, event, value) {
      this.changeHandlerVal(key, attr, value);
    };
    target.prototype.changeHandlerEventValue = function(key, attr, event, value) {
      this.changeHandlerVal(key, attr, value);
    };
    target.prototype.changeHandlerToggle = function(key, attr, value) {
      var state = {};
      state[key] = this.state[key] || {};
      state[key][attr] = !state[key][attr];
      state.lastChange = util.nowTimestamp(); // ms
      this.setState(state);
    };
    target.prototype.changeHandlerMultiVal = function(key, attr, value) {
      this.changeHandlerVal(key, attr, value.map((vo) => {return vo.value;}));
    };
    target.prototype.changeHandlerValWithAdditions = function(key, attr, additional_state_updates, value) {
      var state = {};
      state[key] = this.state[key] || {};
      state[key][attr] = value;
      state.lastChange = util.nowTimestamp(); // ms
      if (additional_state_updates != null) merge(state, additional_state_updates);
      this.setState(state);
    };
    target.prototype.changeHandlerNilVal = function(key, attr, nill, value) {
      this.changeHandlerVal(key, attr, value);
    };
    return target;
  },
  authDecorator: function(target) {
    target.willTransitionTo = function(transition) {
      if (!localStorage.user) {
        transition.redirect('login');
      }
    };
    return target;
  }
};