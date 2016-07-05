var React = require('react');
var Events = require('../lib/Events.js');

var CreateMenu = React.createClass({
  getInitialState: function() {
    return {primitivesDefinitions: {
      'Entity': {group: 'entities', element: 'a-entity', components: {}},

      'Box': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:box', material: 'color:#f00'}},
      'Sphere': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:sphere', material: 'color:#ff0'}},
      'Cylinder': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:cylinder', material: 'color:#00f'}},
      'Plane': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:plane', material: 'color:#fff'}},
      'Torus': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:torus', material: 'color:#0f0'}},
      'TorusKnot': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:torusKnot', material: 'color:#f0f'}},
      'Circle': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:circle', material: 'color:#f0f'}},
      'Ring': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:ring', material: 'color:#0ff'}},

      'Ambient': {group: 'lights', element: 'a-entity', components: {light: 'type:ambient'}},
      'Directional': {group: 'lights', element: 'a-entity', components: {light: 'type:directional'}},
      'Hemisphere': {group: 'lights', element: 'a-entity', components: {light: 'type:hemisphere'}},
      'Point': {group: 'lights', element: 'a-entity', components: {light: 'type:point'}},
      'Spot': {group: 'lights', element: 'a-entity', components: {light: 'type:spot'}},

      'Camera': {group: 'cameras', element: 'a-entity', components: {camera: ''}}
      }
    };
  },
  render: function() {
    var prevGroup = null;
    var definitions = this.state.primitivesDefinitions;

    return (
      <div className="menu">
        <div className="title"><i className="button fa fa-plus-square"></i></div>
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
            output.push(<div className="option" key={definition} value={definition} onClick={this.createEntity}>{definition}</div>);
            return output;
          }.bind(this))
        }
        </div>
      </div>
    );
  },
  createEntity: function(e) {
    Events.emit('createNewEntity', this.state.primitivesDefinitions[e.target.getAttribute('value')]);
  },
});

module.exports = CreateMenu;
