import React from 'react';
var Events = require('../../lib/Events.js');

var primitivesDefinitions = {
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
};

function createEntity (definition) {
  Events.emit('createNewEntity', primitivesDefinitions[definition]);
}

export const CreateMenu = props => {
  var prevGroup = null;
  var definitions = primitivesDefinitions;
  return (
    <div className='menu'>
      <div className='title'>Create</div>
      <div className='options'>
      {
        Object.keys(definitions).map(definition => {
          var output = [];
          if (prevGroup === null) {
            prevGroup = definitions[definition].group;
          } else if (prevGroup !== definitions[definition].group) {
            prevGroup = definitions[definition].group;
            output.push(<hr/>);
          }
          output.push(<div className='option' key={definition} value={definition}
            onClick={() => createEntity(definition)}>{definition}</div>);
          return output;
        })
      }
      </div>
    </div>
  );
};
