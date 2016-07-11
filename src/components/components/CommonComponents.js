import React from 'react';
import {InputWidget} from '../widgets';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Mixins from './Mixins';
import {updateEntity} from '../../actions/entity';
const Events = require('../../lib/Events.js');

// @todo Take this out and use updateEntity?
function changeId (entity, componentName, propertyName, value) {
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityIdChanged', entity);
  }
}

/**
 * Core component properties such as id, position, rotation, scale.
 */
const CommonComponents = props => {
  const entity = props.entity;
  const components = entity ? props.entity.components : {};
  if (!entity) { return <div></div>; }
  return (
    <Collapsible>
      <div className='collapsible-header'>
        <span>Common</span>
      </div>
      <div className='collapsible-content'>
        <div className='row'>
          <span className='value tagName'><code>&lt;{entity.tagName.toLowerCase()}&gt;</code></span>
        </div>
        <div className='row'>
          <span className='text'>ID</span>
          <InputWidget onChange={changeId} entity={entity} name='id' value={entity.id}/>
        </div>
        {
          Object.keys(components).filter(function (key) {
            return ['visible', 'position', 'scale', 'rotation'].indexOf(key) !== -1;
          }).map(function (key) {
            const componentData = components[key];
            const schema = AFRAME.components[key].schema;
            return (
              <PropertyRow onChange={updateEntity} key={key} name={key}
                schema={schema} data={componentData.data} componentname={key}
                entity={props.entity}/>
            );
          })
        }
        <Mixins entity={entity}/>
      </div>
    </Collapsible>
  );
};
CommonComponents.propTypes = {
  entity: React.PropTypes.object
};
export default CommonComponents;
