var React = require('react');
var InputWidget = require('../widgets').InputWidget;
var handleEntityChange = require('../widgets').handleEntityChange;
var Events = require('../../lib/Events.js');

import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';

function trim (s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, ' ');
  s = s.replace(/\n /, '\n');
  return s;
}

// @todo Take this out and use handleEntityChange ?
function changeId(entity, componentName, propertyName, value) {
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityIdChanged', entity);
  }
}

function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

export class MixinsComponent extends React.Component {
  removeMixin = mixin => {
    var entity = this.props.entity;
    var newMixins = trim(entity.getAttribute('mixin').replace(mixin, ''));
    if (newMixins.length === 0) {
      entity.removeAttribute('mixin');
    } else {
      entity.setAttribute('mixin', newMixins);
    }

    // @todo Is there some aframe event that we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectChanged', entity);
  }

  addMixin = () => {
    var entity = this.props.entity;
    entity.setAttribute('mixin', trim(entity.getAttribute('mixin') + ' ' + this.refs.select.value));
    // @todo Is there some aframe event that we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectChanged', entity);
  }

  renderEntityMixins(entityMixins) {
    if (entityMixins.length === 0) {
      return <span></span>
    }

    return (
      <span className="mixinlist">
        <ul>
        {
          entityMixins.map(function(mixin){
            var titles = Object.keys(mixin.attributes)
              .filter(function (i){
                return mixin.attributes[i].name !== 'id';
              })
              .map(function(i){
                var title = '- ' + mixin.attributes[i].name + ':\n';
                var titles = mixin.attributes[i].value.split(';').map(function(value){
                    return '  - ' + trim(value);
                });
                return title + titles.join('\n');
              });

            let mixinClick = this.removeMixin.bind(this, mixin.id);
            return <li key={mixin.id}><span className="mixin" title={titles.join('\n')}>{mixin.id}</span> <a href="#" className="button fa fa-trash-o" onClick={mixinClick}></a></li>;
          }.bind(this))
        }
        </ul>
      </span>
    );
  }

  render() {
    var entity = this.props.entity;
    var entityMixins = entity.mixinEls.map(function(mixin){return mixin.id;});
    var sceneMixins = Array.prototype.slice.call(document.querySelectorAll('a-mixin'));

    return (
      <div className="row">
        <span className="text">mixins</span>
        <span className="value">
          <select ref="select">
          {
            sceneMixins
                .filter(function(mixin){
                  return entityMixins.indexOf(mixin.id)==-1;
                })
                .sort()
                .map(function(value) {
              return <option key={value.id} value={value.id}>{value.id}</option>;
            }.bind(this))
          }
          </select>
          <a href="#" className="button fa fa-plus-circle" onClick={this.addMixin}></a>
        </span>
        { this.renderEntityMixins(entity.mixinEls) }
      </div>
    );
  }
}

const CommonComponents = props => {
  var entity = props.entity;
  var components = entity ? props.entity.components : {};
  if (!entity) { return <div></div>; }
  return (
    <Collapsible>
      <div className="collapsible-header">
        <span>COMMON</span>
      </div>
      <div className="collapsible-content">
        <div className="row">
          <span className="value">&lt;{entity.tagName.toLowerCase()}&gt;</span>
        </div>
        <div className="row">
          <span className="text">ID</span>
          <InputWidget onChange={changeId} entity={entity} name="id" value={entity.id}/>
        </div>
        {
          Object.keys(components).filter(function(key){return ['visible','position','scale','rotation'].indexOf(key)!=-1;}).map(function(key) {
            var componentData = components[key];
            var schema = AFRAME.components[key].schema;
            var data = isSingleProperty(schema) ? componentData.data : componentData.data[key];
            return <AttributeRow onChange={handleEntityChange} key={key} name={key} schema={schema} data={componentData.data} componentname={key} entity={props.entity} />
          }.bind(this))
        }
        <MixinsComponent entity={entity}/>
      </div>
    </Collapsible>
  );
}
export default CommonComponents;
