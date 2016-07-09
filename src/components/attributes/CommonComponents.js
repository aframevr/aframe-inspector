import React from 'react';

const Events = require('../../lib/Events.js');
import {InputWidget} from '../widgets';
import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';
import MixinsComponent from './MixinsComponent';
import {updateEntity} from '../../actions/entity';

var Clipboard = require('clipboard');

// @todo Take this out and use updateEntity?
function changeId (entity, componentName, propertyName, value) {
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityIdChanged', entity);
  }
}

class CommonComponents extends React.Component {

  componentDidMount() {
    var self = this;
    var clipboard = new Clipboard('[data-action="copy-entity-to-clipboard"]', {
      text: function (trigger) {
        return self.props.entity.outerHTML;
      }
    });
    clipboard.on('error', function(e) {
        console.error('Error while copying to clipboard:', e.action, e.trigger);
    });
  }

  render() {
    const entity = this.props.entity;
    const components = entity ? this.props.entity.components : {};
    if (!entity) { return <div></div>; }
    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span>Common</span>
          <div>
            <a href="#" title="Copy entity to clipboard" data-action="copy-entity-to-clipboard"
              className="button fa fa-clipboard" onClick={event => event.stopPropagation()}></a>
          </div>
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
            }).map((key) => {
              const componentData = components[key];
              const schema = AFRAME.components[key].schema;
              return (
                <AttributeRow onChange={updateEntity} key={key} name={key}
                              schema={schema} data={componentData.data} componentname={key}
                              entity={this.props.entity}/>
              );
            })
          }
          <MixinsComponent entity={entity}/>
        </div>
      </Collapsible>
    );
  }
};
CommonComponents.propTypes = {
  entity: React.PropTypes.object
};
export default CommonComponents;
