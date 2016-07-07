import React from 'react';

const Events = require('../../lib/Events.js');
import {InputWidget, handleEntityChange} from '../widgets';
import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';

function trim (s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, ' ');
  s = s.replace(/\n /, '\n');
  return s;
}

// @todo Take this out and use handleEntityChange?
function changeId (entity, componentName, propertyName, value) {
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityIdChanged', entity);
  }
}

export class MixinsComponent extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object.isRequired
  };

  removeMixin = mixin => {
    const entity = this.props.entity;
    const newMixins = trim(entity.getAttribute('mixin').replace(mixin, ''));
    if (newMixins.length === 0) {
      entity.removeAttribute('mixin');
    } else {
      entity.setAttribute('mixin', newMixins);
    }

    // @todo Is there some aframe event we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectChanged', entity);
  }

  addMixin = () => {
    const entity = this.props.entity;
    entity.setAttribute('mixin', trim(entity.getAttribute('mixin') + ' ' + this.refs.select.value));
    // @todo Is there some aframe event that we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectChanged', entity);
  }

  renderMixinOptions = () => {
    const mixinIds = this.props.entity.mixinEls.map(function (mixin) { return mixin.id; });
    const allMixins = Array.prototype.slice.call(document.querySelectorAll('a-mixin'));

    return allMixins
      .filter(function (mixin) {
        return mixinIds.indexOf(mixin.id) === -1;
      })
      .sort()
      .map(function (value) {
        return <option key={value.id} value={value.id}>{value.id}</option>;
      });
  }

  renderMixins = () => {
    const mixins = this.props.entity.mixinEls;
    if (mixins.length === 0) { return <span></span>; }
    return (
      <span className='mixinlist'>
        <ul>
          {mixins.map(this.renderMixin)}
        </ul>
      </span>
    );
  }

  renderMixin = mixin => {
    const titles = Object.keys(mixin.attributes)
      .filter(function (i) {
        return mixin.attributes[i].name !== 'id';
      })
      .map(function (i) {
        const title = '- ' + mixin.attributes[i].name + ':\n';
        const titles = mixin.attributes[i].value.split(';').map(function (value) {
          return '  - ' + trim(value);
        });
        return title + titles.join('\n');
      });
    const mixinClick = this.removeMixin.bind(this, mixin.id);

    return (
      <li key={mixin.id}>
        <span className='mixin' title={titles.join('\n')}>{mixin.id}</span>
        <a href='#' className='button fa fa-trash-o' onClick={mixinClick}></a>
      </li>
    );
  }

  render () {
    return (
      <div className='row'>
        <span className='text'>mixins</span>
        <span className='value'>
          <select ref='select'>
            {this.renderMixinOptions()}
          </select>
          <a href='#' className='button fa fa-plus-circle' onClick={this.addMixin}></a>
        </span>
        {this.renderMixins()}
      </div>
    );
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
              <AttributeRow onChange={handleEntityChange} key={key} name={key}
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
