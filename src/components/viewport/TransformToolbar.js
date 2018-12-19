var React = require('react');
var Events = require('../../lib/Events.js');
var classNames = require('classnames');

var TransformButtons = [
  { value: 'translate', icon: 'fa-arrows-alt' },
  { value: 'rotate', icon: 'fa-repeat' },
  { value: 'scale', icon: 'fa-expand' }
];

export default class TransformToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTransform: 'translate',
      localSpace: false
    };
  }

  componentDidMount() {
    Events.on('transformmodechange', mode => {
      this.setState({ selectedTransform: mode });
    });

    Events.on('transformspacechange', () => {
      Events.emit(
        'transformspacechanged',
        this.state.localSpace ? 'world' : 'local'
      );
      this.setState({ localSpace: !this.state.localSpace });
    });
  }

  changeTransformMode = mode => {
    this.setState({ selectedTransform: mode });
    Events.emit('transformmodechange', mode);
    ga('send', 'event', 'Toolbar', 'selectHelper', mode);
  };

  onLocalChange = e => {
    const local = e.target.checked;
    this.setState({ localSpace: local });
    Events.emit('transformspacechanged', local ? 'local' : 'world');
  };

  renderTransformButtons = () => {
    return TransformButtons.map(
      function(option, i) {
        var selected = option.value === this.state.selectedTransform;
        var classes = classNames({
          button: true,
          fa: true,
          [option.icon]: true,
          active: selected
        });

        return (
          <a
            title={option.value}
            key={i}
            onClick={this.changeTransformMode.bind(this, option.value)}
            className={classes}
          />
        );
      }.bind(this)
    );
  };

  render() {
    return (
      <div id="transformToolbar" className="toolbarButtons">
        {this.renderTransformButtons()}
        <span className="local-transform">
          <input
            id="local"
            type="checkbox"
            title="Toggle between local and world space transforms"
            checked={
              this.state.localSpace || this.state.selectedTransform === 'scale'
            }
            disabled={this.state.selectedTransform === 'scale'}
            onChange={this.onLocalChange}
          />
          <label
            htmlFor="local"
            title="Toggle between local and world space transforms"
          >
            local
          </label>
        </span>
      </div>
    );
  }
}
