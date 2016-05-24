var React = require('react');
var ReactDOM = require('react-dom');
var Attributes = require('./Attributes');
var Menu = require('./MenuWidget');
var Scenegraph = require('./Scenegraph');
var Events = require('../lib/Events.js');
var Editor = require('../lib/editor');

import "../css/main.css";
import "../css/dark.css";

// Megahack to include font-awesome
// -------------
var link = document.createElement('link');
link.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css';
link.type = 'text/css';
link.rel = 'stylesheet';
link.media = 'screen,print';
document.getElementsByTagName('head')[0].appendChild(link);
// ------------

var link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css?family=Roboto:400,300,500';
link.type = 'text/css';
link.rel = 'stylesheet';
link.media = 'screen,print';
document.getElementsByTagName('head')[0].appendChild(link);


export default class AttributesSidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }
  handleToggle(){
    this.setState({open: !this.state.open});
  }
  render() {
    return (
      <div>
        <AttributesPanel/>
      </div>
    );
  }
}

var AttributesPanel = React.createClass({
  getInitialState: function() {
    return {entity: this.props.entity};
  },
  refresh: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    this.refresh();
    Events.on('entitySelected', function(entity){
      this.setState({entity: entity});
      if (entity !== null) {
        entity.addEventListener('componentchanged', this.refresh);
      }
    }.bind(this));
  },
  componentWillReceiveProps: function(newProps) {
  // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.entity != this.state.entity) {
      this.setState({entity: newProps.entity});
    }
  },
  render: function() {
    return (<Attributes entity={this.state.entity}/>)
  }
});

var Main = React.createClass({
  render: function() {
    var scene = document.querySelector('a-scene');
    return (
      <div>
        <Menu/>
        <div id="sidebar-left">
          <div className="tab">SCENEGRAPH</div>
          <Scenegraph scene={scene}/>
        </div>
        <div id="sidebar">
          <div className="tab">ATTRIBUTES</div>
          <AttributesSidebar/>
        </div>
      </div>
    )
  }
});

function init(){
  window.addEventListener('editor-loaded', function(){
    ReactDOM.render(<Main />,document.getElementById('app'));
  });
  var editor = new Editor();
  window.editor = editor;
}

init();
