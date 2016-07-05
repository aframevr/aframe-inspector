var React = require('react');
var Clipboard = require('clipboard');
var Exporter = require('../../lib/exporter.js');
var Events = require('../../lib/Events.js');

var EditMenu = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    var prevGroup = null;
    var definitions = this.state.primitivesDefinitions;

    return (
      <div className="menu">
        <div className="title">Create</div>
        <div className="options">
        {
          Object.keys(definitions).map(function(definition) {
            var output = [];
            if (prevGroup === null) {
              prevGroup = definitions[definition].group;
            } else if (prevGroup !== definitions[definition].group) {
              prevGroup = definitions[definition].group;
              output.push(<hr/>);
            }
            output.push(<div className="option" key={definition} value={definition}>{definition}</div>);
            return output;
          }.bind(this))
        }
        </div>
      </div>
    );
  },
  createEntity: function(e) {
    Events.emit('createNewEntity', this.state.primitivesDefinitions[e.target.value]);
  },
});

var MenuWidget = React.createClass({
  update: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  componentDidMount: function() {
    var clipboard = new Clipboard('[data-action="copy-to-clipboard"]', {
      text: function (trigger) {
        return Exporter.generateHtml();
      }
    });
    clipboard.on('error', function(e) {
        console.error('Error while copying to clipboard:', e.action, e.trigger);
    });
  },
  saveToHTML: function () {
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    function save (blob, filename) {
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'data.json';
      link.click();
      // URL.revokeObjectURL(url); breaks Firefox...
    }
    function saveString (text, filename) {
      save(new Blob([ text ], { type: 'text/plain' }), filename);
    }

    saveString(Exporter.generateHtml(), 'ascene.html');
  },
  render: function() {
    return (
      <div className="Panel" id="menubar">
        <div className="menu aframe-logo">
          <div className="title">
            <span style={{color: '#ed3160'}}>A-</span>
            <span style={{color: '#fff'}}>Frame</span>
          </div>
        </div>
        <div className="menu">
          <div className="title">Scene</div>
          <div className="options">
            <div className="option" onClick={this.saveToHTML}>Save HTML</div>
            <div className="option" data-action="copy-to-clipboard">Copy to clipboard</div>
          </div>
        </div>
        <div className="menu">
          <div className="title">Edit</div>
        </div>
      </div>
    );
  }
});

module.exports = MenuWidget;
