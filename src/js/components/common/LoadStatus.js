var React = require('react');
import { FontIcon } from 'material-ui';

export default class LoadStatus extends React.Component {
  getMessage() {
    if (this.props.loading) return this.props.loadingMessage;
    else if (this.props.empty) return this.props.emptyMessage;
    else return "--";
  }

  render() {
    var message = this.getMessage();
    var showNil = !this.props.loading && this.props.empty;
    var showLoadStatus = (this.props.loading || this.props.empty) && !this.props.hidden;
    var showLoader = this.props.loading;
    var loader = (
        <span className='holder'>
          <img className="loader large" src='/images/puff.svg' height="50" />
        </span>
      );
    var nil = (
      <div className="text-center"><FontIcon className="material-icons" style={{fontSize: "48px"}} color="#CCCCCC">highlight_off</FontIcon></div>
      );
    return showLoadStatus ? (
      <div className="loadStatus">
        { showLoader ? loader : "" }
        { showNil ? nil : "" }
        <span className='message'>{ message }</span>
      </div>
    ) : <div></div>;
  }
}

LoadStatus.defaultProps = {
  loading: false,
  empty: true,
  emptyMessage: "Nothing to show",
  loadingMessage: "Please wait...",
  hidden: false
};
