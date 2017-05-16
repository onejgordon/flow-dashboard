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

  _point(progress, ms) {
    return {
      progress: progress,
      date: new Date(ms)
    }
  }

  render_content() {
    let {project} = this.props;
    let points = [this._point(0, project.ts_created)];
    let today = new Date();
    let projected_completion;
    project.progress_ts.forEach((p, decile) => {
      if (p != 0) {
        points.push(this._point(parseInt((decile+1) * 10), p));
      }
    });
    points = points.sort((a, b) => {
      return a.date - b.date;
    });
    let datasets = [];
    let complete = project.complete;
    if (points.length > 1 && !complete) {
      let first_point = points[0];
      let latest_point = points[points.length - 1];
      let slope_pct_per_ms = latest_point.progress / (latest_point.date.getTime() - first_point.date.getTime());
      projected_completion = project.ts_created + 100/slope_pct_per_ms;
      points.push(this._point(null, projected_completion));
      let projectionDataset = {
        label: "Projected",
        data: points.map((p) => { return slope_pct_per_ms * (p.date.getTime() - project.ts_created); }),
        backgroundColor: `rgba(255, 255, 255, 0.3)`,
        pointRadius: 0,
        lineTension: 0
      }
      datasets.push(projectionDataset);
    }
    datasets.splice(0, 0, {
      label: "Progress towards completion (%)",
      data: points.map((p) => { return p.progress; }),
      backgroundColor: `rgba(0, 100, 255, 1.0)`,
      lineTension: 0,
    });
    let progressData = {
      labels: points.map((p) => { return p.date; }),
      datasets: datasets
    };
    let opts = {
      scales: {
        yAxes: [{
            ticks: {
                max: 100,
                min: 0
            }
        }],
        xAxes: [{
            type: 'time',
            time: {
                displayFormats: {},
                max: projected_completion || today
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
    let projected_completion_text = projected_completion ? util.printDateObj(new Date(projected_completion)) : "--";
    return (
      <div className="row">
        <div className="col-sm-9">
          <Line data={progressData} options={opts} width={1000} height={450}/>
        </div>
        <div className="col-sm-3">
          <BigProp label="Overall rate (%/day)" value={rate.toFixed(1)} />
          <BigProp label="Duration (days)" value={days.toFixed(2)} />
          <div hidden={complete}>
            <BigProp label="Projected Completion" value={projected_completion_text} />
          </div>
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
          title={project ? `Progress: ${project.title}` : ""}
          onRequestClose={this.dismiss.bind(this)}
          height="80%"
          actions={actions}>

          { content }

      </Dialog>
    )
  }
}
