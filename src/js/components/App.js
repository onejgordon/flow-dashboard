'use strict';

var React = require('react');
import {Link} from 'react-router';
import {Route, Redirect, Switch} from 'react-router-dom';
import { FontIcon, MenuItem, RaisedButton,
  IconButton, AppBar, Drawer} from 'material-ui';
var AppConstants = require('constants/AppConstants');
var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
var ReactTooltip = require('react-tooltip');
import connectToStores from 'alt-utils/lib/connectToStores';
import {G_OAUTH_CLIENT_ID, GOOGLE_API_KEY} from 'constants/client_secrets';
var api = require('utils/api');
var toastr = require('toastr');

var Dashboard = require('components/Dashboard');
var Timeline = require('components/Timeline');
var Splash = require('components/Splash');
var About = require('components/About');
var Privacy = require('components/Privacy');
var Settings = require('components/Settings');
var Analysis = require('components/Analysis');
var Reading = require('components/Reading');
var JournalHistory = require('components/JournalHistory');
var TaskHistory = require('components/TaskHistory');
var Integrations = require('components/Integrations');
var Reports = require('components/Reports');
var Feedback = require('components/Feedback');
var AdminAgent = require('components/admin/AdminAgent');


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
        <MenuItem key="sett" onClick={this.goto_page.bind(this, "/app/settings")} leftIcon={<FontIcon className="material-icons">settings</FontIcon>}>Settings</MenuItem>,
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
    let childProps = { user: user, signing_in: this.state.signing_in }
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
            <Switch>
              <div>
                <Route exact path="/app" render={() => (
                  <Redirect to="/app/about" />)} />
                <Route path="splash" render={() => (
                  <Splash {...childProps} />
                  )} />
                <Route path="login" render={() => (
                  <Splash {...childProps} />
                  )} />
                <Route path="about" render={() => (
                  <About {...childProps} />
                  )} />
                <Route path="privacy" render={() => (
                  <Privacy {...childProps} />
                  )} />
                <Route path="dashboard" render={() => (
                  <Dashboard {...childProps} />
                  )} />
                <Route path="timeline" render={() => (
                  <Timeline {...childProps} />
                  )} />
                <Route path="settings" render={() => (
                  <Settings {...childProps} />
                  )} />
                <Route path="integrations" render={() => (
                  <Integrations {...childProps} />
                  )} />
                <Route path="integrations/:action" render={() => (
                  <Integrations {...childProps} />
                  )} />
                <Route path="exports" render={() => (
                  <Reports {...childProps} />
                  )} />
                <Route path="reading" render={() => (
                  <Reading {...childProps} />
                  )} />
                <Route path="journal/history" render={() => (
                  <JournalHistory {...childProps} />
                  )} />
                <Route path="task/history" render={() => (
                  <TaskHistory {...childProps} />
                  )} />
                <Route path="feedback" render={() => (
                  <Feedback {...childProps} />
                  )} />
                <Route path="admin/agent" render={() => (
                  <AdminAgent {...childProps} />
                  )} />
                <Route path="analysis" render={() => (
                  <Analysis {...childProps} />
                  )} />
              </div>
            </Switch>
          </div>
        </div>

        <ReactTooltip place="top" effect="solid" />

      </div>
    )
  }
}
