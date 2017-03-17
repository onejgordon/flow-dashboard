var React = require('react');
import { Dialog } from 'material-ui';
var util = require('utils/util');
import {Line} from "react-chartjs-2";
import {changeHandler} from 'utils/component-utils';
var BigProp = require('components/common/BigProp');

@changeHandler
export default class ProjectAnalysis extends React.Component {
  static propTypes = {
    onDismiss: React.PropTypes.func
  }
  static defaultProps = {
    project: null,
  }
  constructor(props) {
      super(props);
      this.state = {
          habitdays: {}
      };
  }

  componentDidMount() {

  }

  dismiss() {
    this.props.onDismiss();
  }

  render_content() {
    let {project} = this.props;
    let steps = [];
    let labels = [];
    project.progress_ts.forEach((p, decile) => {
      if (p != 0) {
        steps.push(decile / 10);
        labels.push(p)
      }
    });
    let progressData = {
      labels: labels,
      datasets: [
        {
          label: "Progress towards completion",
          data: steps,
          backgroundColor: `rgba(0, 100, 255, 1.0)`,
        }
      ]
    };
    let opts = {
      scales: {
        yAxes: [{
            ticks: {
                max: 1,
                min: 0
            }
        }],
        xAxes: [{
            type: 'time',
            time: {
                displayFormats: {},
            }
        }]
      }
    };
    let rate = "N/A";
    let end = project.ts_completed || new Date().getTime();
    let ms_duration = end - project.ts_created;
    let days = ms_duration / 1000 / 60 / 60 / 24.0;
    if (project.progress > -1) {
      let denom = days < 1 ? 1 : days;
      rate = project.progress * 10 / denom;
    }
    return (
      <div className="row">
        <div className="col-sm-9">
          <Line data={progressData} options={opts} width={1000} height={450}/>
        </div>
        <div className="col-sm-3">
          <BigProp label="Overall rate (%/day)" value={rate.toFixed(2)} />
          <BigProp label="Duration (days)" value={days.toFixed(2)} />
        </div>
      </div>
      )
  }

  render() {
    let {project} = this.props;
    let actions = [];
    let content;
    if (project) content = this.render_content()
    return (
      <Dialog
          open={!!project}
          title={project ? `Analysis: ${project.title}` : ""}
          onRequestClose={this.dismiss.bind(this)}
          height="80%"
          actions={actions}>

          { content }

      </Dialog>
    )
  }
}
