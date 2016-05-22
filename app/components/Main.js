var React = require('react');
var ReactDOM = require('react-dom');
var Attributes = require('./Attributes');
var Events = require('../lib/Events.js');
var Editor = require('../lib/editor');

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
    return {entity: null};
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
  componentWillUnmount: function() {
    //window.removeEventListener('resize', this.refresh);
  },
  render: function() {
    return (<Attributes name={this.state.id} entity={this.state.entity}/>)
  }
});

var Main = React.createClass({
  render: function() {
    return (
      <div>
        <AttributesSidebar/>
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
