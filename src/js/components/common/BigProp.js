var React = require('react');

export default class BigProp extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.node,
    color: React.PropTypes.string,
    size: React.PropTypes.string,
    icon: React.PropTypes.element,
    onClick: React.PropTypes.func,
    labelPosition: React.PropTypes.string,
  }
  static defaultProps = {
    label: '--',
    value: '--',
    color: 'white',
    icon: null,
    onClick: null,
    size: '1.7em',
    labelPosition: "bottom"
  }

  constructor(props) {
      super(props);
      this.state = {
      };
  }

  render() {
    let {label, value, color, size, icon, onClick, labelPosition} = this.props;
    let clickable = onClick != null;
    let boundClick = clickable ? onClick.bind(this) : null;
    let cls = "text-center bigProp";
    if (clickable) cls += " clickable";
    let order = [
      <div key="val" style={{fontSize: size, fontWeight: "bold", color: color}}>{icon}{value}</div>,
      <small key="label" style={{color: 'gray'}}>{label}</small>
    ];
    if (labelPosition == 'top') order = order.reverse();
    return (
      <div className={cls} onClick={boundClick}>
        { order }
      </div>
      )
  }
}
