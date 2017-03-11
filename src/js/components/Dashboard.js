var React = require('react');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var GoalViewer = require('components/GoalViewer');
var ProjectViewer = require('components/ProjectViewer');
var HabitWidget = require('components/HabitWidget');
var ReadWidget = require('components/ReadWidget');
var MiniJournalWidget = require('components/MiniJournalWidget');
var TaskWidget = require('components/TaskWidget');
var FlashCard = require('components/FlashCard');
import {findItemById} from 'utils/store-utils';
import {clone, merge, get} from 'lodash';
import {RaisedButton, Dialog, IconButton,
    TextField, FlatButton, FontIcon,
    IconMenu, MenuItem, Paper} from 'material-ui';

export default class Dashboard extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
            more: null
        };
    }

    componentDidMount() {
        document.onkeydown = this.handle_key_down.bind(this);
    }

    handle_key_down(e) {
        let keyCode = e.keyCode || e.which;
        var tag = e.target.tagName.toLowerCase();
        let in_input = tag == 'input' || tag == 'textarea';
        if (in_input) return true;
        if (keyCode == 84) { // t
          this.refs.taskwidget.show_new_box();
          document.getElementById('TaskWidget').scrollIntoView();
          return false;
        } else if (keyCode == 72) { // h
          document.getElementById('HabitWidget').scrollIntoView();
          return false;
        }
    }

    dismiss_more() {
        this.setState({more: null})
    }

    show_more(type) {
        this.setState({more: type});
    }

    flashcards() {
        let {user} = this.props;
        return get(user, 'settings.flashcards', []);
    }

    render_more() {
        let {more} = this.state;
        if (more == 'reading') return <ReadWidget />
        else {
            let fc = findItemById(this.flashcards(), more, 'id');
            if (fc) return <FlashCard {...fc} />
        }
        return null;
    }

    render() {
        let {more} = this.state;
        let {user} = this.props;
        let journal_qs = [];
        let journal_location = false;
        if (user) {
            journal_qs = get(user, 'settings.journals.questions', []);
            journal_location = get(user, 'settings.journals.preferences.location_capture', false);
        }
        let _more_options = this.flashcards().map((fc) => {
            return <MenuItem key={fc.id} leftIcon={<FontIcon className="material-icons">{fc.icon}</FontIcon>} onClick={this.show_more.bind(this, fc.id)}>{fc.card_title}</MenuItem>
        });
        return (
            <div>

                <TaskWidget ref="taskwidget" />

                <GoalViewer />

                <ProjectViewer />

                <HabitWidget />

                <MiniJournalWidget questions={journal_qs} include_location={journal_location} />


                <div className="text-center" style={{marginTop: "20px"}}>
                    <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">games</IconButton>}>
                        <MenuItem leftIcon={<FontIcon className="material-icons">library_books</FontIcon>} onClick={this.show_more.bind(this, 'reading')}>Reading</MenuItem>
                        { _more_options }
                    </IconMenu>
                </div>

                <Dialog open={more != null} onRequestClose={this.dismiss_more.bind(this)} height="800"
                    contentStyle={{
                      minHeight: '600px'
                    }}
                    autoScrollBodyContent={true}>
                    { this.render_more() }
                </Dialog>

            </div>
        );
    }
}
