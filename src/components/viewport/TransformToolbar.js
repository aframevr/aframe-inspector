import React from 'react';
import {
  faArrowsAlt,
  faRotateRight,
  faUpRightAndDownLeftFromCenter
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Events from '../../lib/Events';

var TransformButtons = [
  { value: 'translate', icon: <FontAwesomeIcon icon={faArrowsAlt} /> },
  { value: 'rotate', icon: <FontAwesomeIcon icon={faRotateRight} /> },
  {
    value: 'scale',
    icon: <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
  }
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
    Events.on('transformmodechange', (mode) => {
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

  changeTransformMode = (mode) => {
    this.setState({ selectedTransform: mode });
    Events.emit('transformmodechange', mode);
  };

  onLocalChange = (e) => {
    const local = e.target.checked;
    this.setState({ localSpace: local });
    Events.emit('transformspacechanged', local ? 'local' : 'world');
  };

  renderTransformButtons = () => {
    return TransformButtons.map(
      function (option, i) {
        var selected = option.value === this.state.selectedTransform;
        var classes = classNames({
          button: true,
          active: selected
        });

        return (
          <a
            title={option.value}
            key={i}
            onClick={this.changeTransformMode.bind(this, option.value)}
            className={classes}
          >
            {option.icon}
          </a>
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
