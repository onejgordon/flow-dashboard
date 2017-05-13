'use strict';

var React = require('react');
import {Link} from 'react-router';
import {browserHistory} from 'react-router';
import { FontIcon, MenuItem, RaisedButton,
  IconButton, AppBar, Drawer} from 'material-ui';
var AppConstants = require('constants/AppConstants');
var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
import connectToStores from 'alt-utils/lib/connectToStores';
import {G_OAUTH_CLIENT_ID, GOOGLE_API_KEY} from 'constants/client_secrets';
var api = require('utils/api');
var toastr = require('toastr');

@connectToStores
export default class Private extends React.Component {

  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      ln_open: false,
      signing_in: false
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
    gapi.load('client:auth2', this.init_google.bind(this));
  }

  componentWillUnmount() {
  }

  init_google() {
    gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      client_id: G_OAUTH_CLIENT_ID,
      scope: 'profile'
    }).then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.signinChanged.bind(this));
      gapi.auth2.getAuthInstance().currentUser.listen(this.userChanged.bind(this));
    }, (err) => {
      console.log(err);
      toastr.error("Failed to initialize Google Client -- Check that 'block third-party cookies and site data' is not enabled.")
    })
  }

  signinChanged(val) {
    console.log('Signin state changed to ', val);
  }

  userChanged(gUser) {
    if (gUser && gUser.isSignedIn()) {
      var profile = gUser.getBasicProfile();
      var id_token = gUser.getAuthResponse().id_token;
      let {user} = this.props;
      let new_user = !user || profile.getEmail() != user.email;
      if (new_user) {
        let data = {token: id_token};
        this.setState({signing_in: true}, () => {
          api.post('/api/auth/google_login', data, (res) => {
            UserActions.storeUser(res.user);
            browserHistory.push('/app/dashboard');
            this.setState({signing_in: false});
          }, (res_fail) => {
            this.setState({signing_in: false});
          })
        });
      }
    }
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

  go_home() {
    if (this.props.user) this.goto_page('/app/dashboard');
    else this.goto_page('/app');
  }

  render_nav_menu() {
    let {user} = this.props;
    let menu = [];
    menu.push(<MenuItem key="about" onClick={this.goto_page.bind(this, "/app/about")} leftIcon={<FontIcon className="material-icons">help</FontIcon>}>About</MenuItem>)
    if (user) {
      menu = menu.concat([
        <MenuItem key="dash" onClick={this.goto_page.bind(this, "/app/dashboard")} leftIcon={<FontIcon className="material-icons">dashboard</FontIcon>}>Dashboard</MenuItem>,
        <MenuItem key="mng" onClick={this.goto_page.bind(this, "/app/manage")} leftIcon={<FontIcon className="material-icons">settings</FontIcon>}>Settings</MenuItem>,
        <MenuItem key="time" onClick={this.goto_page.bind(this, "/app/timeline")} leftIcon={<FontIcon className="material-icons">timeline</FontIcon>}>Timeline</MenuItem>,
        <MenuItem key="ana" onClick={this.goto_page.bind(this, "/app/analysis")} leftIcon={<FontIcon className="material-icons">bubble_chart</FontIcon>}>Analysis</MenuItem>,
        <MenuItem key="int" onClick={this.goto_page.bind(this, "/app/integrations")} leftIcon={<FontIcon className="material-icons">share</FontIcon>}>Integrations</MenuItem>,
        <MenuItem key="read" onClick={this.goto_page.bind(this, "/app/reading")} leftIcon={<FontIcon className="material-icons">book</FontIcon>}>Reading</MenuItem>,
        <MenuItem key="rep" onClick={this.goto_page.bind(this, "/app/exports")} leftIcon={<FontIcon className="material-icons">file_download</FontIcon>}>Exports</MenuItem>,
        <MenuItem key="feed" onClick={this.goto_page.bind(this, "/app/feedback")} leftIcon={<FontIcon className="material-icons">feedback</FontIcon>}>Send Feedback</MenuItem>,
        <MenuItem key="exit" onClick={this.signout.bind(this)} leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>}>Sign Out</MenuItem>
      ]);
    }
    return menu;
  }

  handle_toggle_leftnav = () => this.setState({ln_open: !this.state.ln_open});
  handle_leftnav_change = (open) => this.setState({ln_open: open});

  render() {
    let {user} = this.props;
    let {SITENAME} = AppConstants;
    let LOGO = <img src="/images/logo_white.png" className="flowlogo glow" width="50" />
    let right_icon;
    let on_signin = this.props.location.pathname == '/app/login';
    let on_about = this.props.location.pathname == '/app/about';
    if (!user && !on_signin) right_icon = <Link to="/app/login"><RaisedButton primary={true} label="Sign In" style={{marginTop: "5px", marginRight: "5px"}}/></Link>
    if (user && on_about) right_icon = <Link to="/app/dashboard"><RaisedButton primary={true} label="Dashboard" style={{marginTop: "5px", marginRight: "5px"}}/></Link>
    return (
      <div>
        <AppBar
          title={LOGO}
          zDepth={0}
          onTitleTouchTap={this.go_home.bind(this)}
          iconElementRight={right_icon}
          onLeftIconButtonTouchTap={this.handle_toggle_leftnav.bind(this)} />

        <Drawer docked={false} width={300} open={this.state.ln_open} onRequestChange={this.handle_leftnav_change.bind(this)}>
          <AppBar
            title={SITENAME}
            zDepth={0}
            iconElementLeft={<IconButton iconClassName="material-icons">arrow_back</IconButton>}
            onTitleTouchTap={this.go_home.bind(this)}
            onLeftIconButtonTouchTap={this.handle_toggle_leftnav.bind(this)} />
          { this.render_nav_menu() }
        </Drawer>

        <div id="container" className="container">

          <div className="app-content row">
            { React.cloneElement(this.props.children, { user: user, signing_in: this.state.signing_in }) }
          </div>
        </div>

      </div>
    )
  }
}
