var React = require('react');
import {FlatButton, FontIcon, TextField} from 'material-ui';
import PropTypes from 'prop-types';
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';
var sha256 = require('js-sha256').sha256;
var AES = require("crypto-js/aes")
var api = require('utils/api');
var UserStore = require('stores/UserStore');

@connectToStores
@changeHandler
export default class BrowserEncryptionWidget extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      form: {
        password: ''
      },
      verified: this.is_verified(),
      form_showing: false
    }

    this.handleClick = this.handleClick.bind(this)
  }

  static getStores() {
    return [UserStore];
  }

  static getPropsFromStores() {
    var st = UserStore.getState();
    return st;
  }

  stored() {
    return this.encryption_key() != null
  }

  encryption_key() {
    let {user} = this.props
    let encryption_key = sessionStorage[`encr_password_uid:${user.id}`]
    return encryption_key
  }

  is_verified() {
    let {user} = this.props
    return sessionStorage[`encr_verified_uid:${user.id}`]
  }

  store_key(key) {
    let {user} = this.props
    sessionStorage[`encr_password_uid:${user.id}`] = key
  }

  store_verified(verified) {
    let {user} = this.props
    sessionStorage[`encr_verified_uid:${user.id}`] = verified
    this.setState({verified: verified})
  }

  encrypt(text) {
    let key = this.encryption_key()
    return AES.encrypt(text, key)
  }

  decrypt(encrypted) {
    let key = this.encryption_key()
    return AES.decrypt(encrypted, key)
  }

  clear() {
    this.store_verified(false)
    this.store_key(null)
    this.forceUpdate()
  }

  verify() {
    let {form} = this.state
    if (form.password.length > 0) {
      let key = sha256(form.password)
      let sha = sha256(key)
      api.post("/api/user/encryption/validate_password", {encr_pw_sha: sha}, (res) => {
        this.setState({form_showing: false, form: {password: ''}}, () => {
          this.store_key(key)
          this.store_verified(true)
        })
      }, (res) => {
        this.clear()
      })
    }
  }

  handleClick() {
    let {form_showing, verified} = this.state
    if (form_showing) {
      this.verify()
    } else {
      if (verified) {
        this.clear()
      } else {
        this.setState({form_showing: true})
      }
    }
  }

  render() {
    let {form_showing, form, verified} = this.state
    let {user} = this.props
    let text, icon
    if (form_showing) {
      text = "Enable"
      icon = 'check'
    } else {
      text = verified ? "Encryption enabled" : "Encryption disabled"
      icon = verified ? 'lock' : 'lock_open'
    }
    let icon_st = {
      color: verified ? 'green' : 'white'
    }
    let input
    if (form_showing) input = (
      <TextField
        name="password"
        placeholder="Encryption password"
        hidden={!form_showing}
        type="password"
        autoFocus
        onChange={this.changeHandler.bind(this, 'form', 'password')}
        value={form.password || ''} />
      )
    if (user.encryption_password_set) {
      return (
        <span>
            { input }
            <FlatButton
                label={text}
                onClick={this.handleClick}
                icon={<FontIcon className="material-icons" style={icon_st}>{icon}</FontIcon>} />
        </span>
      )
    } else {
      return null
    }
  }
}
