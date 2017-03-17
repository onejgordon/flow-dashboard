var React = require('react');

export default class BigProp extends React.Component {
  static defaultProps = {
    label: '--',
    value: '--',
    color: 'white',
    size: '1.7em'
  }

  constructor(props) {
      super(props);
      this.state = {
      };
  }

  render() {
    let {label, value, color, size} = this.props;
    return (
      <div className="text-center" style={{marginTop: "8px", marginBottom: "8px"}}>
        <div style={{fontSize: size, fontWeight: "bold", color: color}}>{value}</div>
        <small style={{color: 'gray'}}>{label}</small>
      </div>
      )
  }
}
