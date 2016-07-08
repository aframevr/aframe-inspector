import React from 'react';
var Events = require('../lib/Events.js');

export default class Statusbar extends React.Component {
  changeTransformMode = mode => {
    Events.emit('transformModeChanged', mode);
  }
  onLocalChange = e => {
    console.log("Onchangedd");
    var local = e.target.checked;
    Events.emit('spaceChanged', local ? "local" : "world");
  }

  render() {
    return <div id='statusbar'>
      <a href='#' title='translate' onClick={this.changeTransformMode.bind(this, 'translate')} className='button fa fa-arrows'></a>
      <a href='#' title='rotate' onClick={this.changeTransformMode.bind(this, 'rotate')} className='button fa fa-repeat'></a>
      <a href='#' title='scale' onClick={this.changeTransformMode.bind(this, 'scale')} className='button fa fa-expand'></a>
      <span className='local-transform'>
        <input id='local' type='checkbox' onChange={this.onLocalChange}/> <label htmlFor='local'>local</label>
      </span>
    </div>
  }
};
