var PropTypes = require('prop-types');
var React = require('react');
import Select from 'react-select'

export default class YearSelector extends React.Component {
  static propTypes = {
    year: PropTypes.number,
    // One of following required
    years_back: PropTypes.number,
    first_year: PropTypes.number
  }
  static defaultProps = {
    year: null,
    years_back: 3
  }

  constructor(props) {
      super(props);
      this.state = {
      }
  }

  handleChange(val) {
    this.props.onChange(val)
  }

  render() {
    let {year, years_back, first_year} = this.props
    let today = new Date()
    let today_year = today.getFullYear()
    if (year == null) year = today_year
    let year_cursor = first_year != null ? first_year : (today_year - years_back)
    let year_opts = []
    while (year_cursor <= today_year) {
        year_opts.push({value: year_cursor, label: year_cursor})
        year_cursor += 1
    }
    return <Select options={year_opts}
                   value={year}
                   onChange={this.handleChange.bind(this)}
                   simpleValue
                   clearable={false} />
  }
}
