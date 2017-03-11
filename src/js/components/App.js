'use strict';

var React = require('react');
import {Router, withRouter, Link, browserHistory} from 'react-router';
var util = require('utils/util');
var $ = require('jquery');
var bootstrap = require('bootstrap');
import { blue400,  white } from 'material-ui/styles/colors';
import {FlatButton, RaisedButton, Avatar, FontIcon, MenuItem,
  IconButton, AppBar, Drawer, IconMenu, Divider, Subheader} from 'material-ui';
var AppConstants = require('constants/AppConstants');
var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
import connectToStores from 'alt-utils/lib/connectToStores';
import {authDecorator} from 'utils/component-utils';
var api = require('utils/api');

@connectToStores
export default class Private extends React.Component {

  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      ln_open: false
    };
  }

  static getStores() {
    return [UserStore];
  }

  static getPropsFromStores() {
    var st = UserStore.getState();
    return st;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  signout() {
    this.setState({ln_open: false});
    UserActions.logout();
  }

  goto_page(page) {
    this.setState({ln_open: false}, () => {
      browserHistory.push(page);
    })
  }

  render_nav_menu() {
    let {user} = this.props;
    let menu = [];
    menu.push(<MenuItem key="about" onClick={this.goto_page.bind(this, "/app/about")} leftIcon={<FontIcon className="material-icons">help</FontIcon>}>About</MenuItem>)
    if (user) {
      menu = menu.concat([
        <MenuItem key="dash" onClick={this.goto_page.bind(this, "/app/dashboard")} leftIcon={<FontIcon className="material-icons">dashboard</FontIcon>}>Dashboard</MenuItem>,
        <MenuItem key="time" onClick={this.goto_page.bind(this, "/app/timeline")} leftIcon={<FontIcon className="material-icons">timeline</FontIcon>}>Timeline</MenuItem>,
        <MenuItem key="ana" onClick={this.goto_page.bind(this, "/app/analysis")} leftIcon={<FontIcon className="material-icons">bubble_chart</FontIcon>}>Analysis</MenuItem>,
        <MenuItem key="mng" onClick={this.goto_page.bind(this, "/app/manage")} leftIcon={<FontIcon className="material-icons">settings</FontIcon>}>Manage</MenuItem>,
        <MenuItem key="int" onClick={this.goto_page.bind(this, "/app/integrations")} leftIcon={<FontIcon className="material-icons">share</FontIcon>}>Integrations</MenuItem>,
        <MenuItem key="exit" onClick={this.signout.bind(this)} leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>}>Sign Out</MenuItem>
      ]);
    }
    return menu;
  }

  handle_toggle_leftnav = () => this.setState({ln_open: !this.state.ln_open});
  handle_leftnav_change = (open) => this.setState({ln_open: open});

  render() {
    let {user} = this.props;
    var is_admin = user ? user.level == AppConstants.USER_ADMIN : false;
    var can_write = user ? user.level > AppConstants.USER_READ : false;
    var wide = this.props.wide;
    let {YEAR, SITENAME} = AppConstants;
    let LOGO = <img src="/images/logo_white.png" className="center-block" width="50" style={{marginTop: "7px"}} />
    var _user_section;
    return (
      <div>
        <AppBar
          title={LOGO}
          zDepth={0}
          onTitleTouchTap={this.goto_page.bind(this, '/app')}
          onLeftIconButtonTouchTap={this.handle_toggle_leftnav.bind(this)} />

        <Drawer docked={false} width={300} open={this.state.ln_open} onRequestChange={this.handle_leftnav_change.bind(this)}>
          <AppBar
            title={SITENAME}
            zDepth={0}
            iconElementLeft={<IconButton iconClassName="material-icons">arrow_back</IconButton>}
            onTitleTouchTap={this.goto_page.bind(this, '/app')}
            onLeftIconButtonTouchTap={this.handle_toggle_leftnav.bind(this)} />
          { this.render_nav_menu() }
        </Drawer>

        <div id="container" className="container">

          <div className="app-content row">
            { React.cloneElement(this.props.children, { user: user }) }
          </div>
        </div>
      </div>
    )
  }
}
