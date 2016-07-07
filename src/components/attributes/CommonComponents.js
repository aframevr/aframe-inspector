import React from 'react';

const Events = require('../../lib/Events.js');
import {InputWidget} from '../widgets';
import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';
import MixinsComponent from './MixinsComponent';
import {updateEntity} from '../../actions/entity';

// @todo Take this out and use updateEntity?
function changeId (entity, componentName, propertyName, value) {
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityIdChanged', entity);
  }
}

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
              <AttributeRow onChange={updateEntity} key={key} name={key}
                            schema={schema} data={componentData.data} componentname={key}
                            entity={props.entity}/>
            );
          })
        }
        <MixinsComponent entity={entity}/>
      </div>
    </Collapsible>
  );
};
CommonComponents.propTypes = {
  entity: React.PropTypes.object
};
export default CommonComponents;
