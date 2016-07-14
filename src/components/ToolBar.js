var React = require('react');
var Events = require('../lib/Events.js');
var classNames = require('classnames');

var TransformButtons = [
  {value: 'translate', icon: 'fa-arrows'},
  {value: 'rotate', icon: 'fa-repeat'},
  {value: 'scale', icon: 'fa-expand'}
];

export default class Toolbar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      selectedTransform: 'translate',
      localSpace: false
    };
  }

  changeTransformMode = mode => {
    this.setState({selectedTransform: mode});
    Events.emit('transformModeChanged', mode);
    ga('send', 'event', 'Toolbar', 'selectHelper', mode);
  }

  onLocalChange = e => {
    const local = e.target.checked;
    this.setState({localSpace: local});
    Events.emit('spaceChanged', local ? 'local' : 'world');
    ga('send', 'event', 'Toolbar', 'toggleLocal', local);
  }

  renderTransformButtons = () => {
    return TransformButtons.map(function (option, i) {
      var selected = option.value === this.state.selectedTransform;
      var classes = classNames({
        button: true,
        fa: true,
        [option.icon]: true,
        active: selected
      });

      return <a title={option.value} key={i}
        onClick={this.changeTransformMode.bind(this, option.value)}
        className={classes}></a>;
    }.bind(this));
  }

  render () {
    return (
      <div className='toolbar'>
        {this.renderTransformButtons()}
        <span className='local-transform'>
          <input id='local' type='checkbox'
            checked={this.state.localSpace || this.state.selectedTransform === 'scale'}
            disabled={this.state.selectedTransform === 'scale'}
            onChange={this.onLocalChange}/>
          <label htmlFor='local'>local</label>
        </span>
      </div>
    );
  }
}
