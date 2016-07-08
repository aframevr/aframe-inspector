var React = require('react');
var Events = require('../lib/Events.js');

var TransformButtons = [
  {value: 'translate', icon: 'fa-arrows'},
  {value: 'rotate', icon: 'fa-repeat'},
  {value: 'scale', icon: 'fa-expand'}
];

export default class ToolBar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {selectedTransform: 'translate', localSpace: false};
  }

  changeTransformMode = mode => {
    this.setState({selectedTransform: mode});
    Events.emit('transformModeChanged', mode);
  }

  onLocalChange = e => {
    var local = e.target.checked;
    this.setState({localSpace: local});
    Events.emit('spaceChanged', local ? 'local' : 'world');
  }

  render () {
    return <div className='toolbar'>
      {
        TransformButtons.map(function (option) {
          var selected = option.value === this.state.selectedTransform;
          return <a href='#' title={option.value}
            onClick={this.changeTransformMode.bind(this, option.value)}
            className={'button fa ' + option.icon + (selected ? ' active' : '')}></a>;
        }.bind(this))
      }
      <span className='local-transform'>
        <input id='local' type='checkbox'
          checked={this.state.localSpace || this.state.selectedTransform === 'scale'}
          disabled={this.state.selectedTransform === 'scale'}
          onChange={this.onLocalChange}/>
        <label htmlFor='local'>local</label>
      </span>
    </div>;
  }
}
