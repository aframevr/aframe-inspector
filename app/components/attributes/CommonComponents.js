var React = require('react');
var InputWidget = require('../widgets').InputWidget;
var handleEntityChange = require('../widgets').handleEntityChange;
var AttributeRow = require('./AttributeRow');
var Events = require('../../lib/Events.js');


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

var MixinsComponent = React.createClass({
  render: function() {
    var entity = this.props.entity;
    var mixins = Array.prototype.slice.call(document.querySelectorAll('a-mixin'));
    return (
      <div className="row">
        <span className="text">Add</span>
        <span className="value">
          <select ref="select">
          {
            mixins
              /*.filter(function(key){return usedComponents.indexOf(key)==-1;})
                .sort()*/
                .map(function(value) {
              return <option key={value.id} value={value.id}>{value.id}</option>;
            }.bind(this))
          }
          </select>
          <a href="#" className="button fa fa-plus-circle" onClick={this.addMixin}></a>
        </span>
        <span className="text"></span>
        <span className="value">
          <ul>
          {
            entity.mixinEls.map(function(mixin){

              function removeMixin() {
                entity.setAttribute('mixin', trim(entity.getAttribute('mixin').replace(mixin.id, '')));
                Events.emit('objectChanged', entity);
              }
              return <li key={mixin.id}><span className="mixin">{mixin.id}</span> <a href="#" className="button fa fa-trash-o" onClick={removeMixin}></a></li>;
            }.bind(this))
          }
          </ul>
        </span>
      </div>
    );
  }
});

var CommonComponents = React.createClass({
  addMixin: function() {
    //editor.selected.el.setAttribute('mixin', trim(editor.selected.el.getAttribute('mixin') + ' ' + mixinsList.getValue()));
    /*
    // Update mixins list
    mixinsContainer.dom.innerHTML = '';
    entity.mixinEls.forEach(function (mixin) {
      var name = new UI.Text(mixin.id).setWidth('160px').setFontSize('12px');
      mixinsContainer.add(name);

      var edit = new UI.Button('Edit').setDisabled(true);
      edit.setMarginLeft('4px');
      edit.onClick(function () {
        //  signals.editScript.dispatch( object, script );
      });
      mixinsContainer.add(edit);

      var remove = new UI.Button('Remove');
      remove.setMarginLeft('4px');
      remove.onClick(function () {
        entity.setAttribute('mixin', trim(entity.getAttribute('mixin').replace(mixin.id, '')));
      });
      mixinsContainer.add(remove);

      mixinsContainer.add(new UI.Break());
    });
     */
  },
  render: function() {
    var entity = this.props.entity;
    var components = entity ? this.props.entity.components : {};
    if (!entity) {
      return <div></div>;
    }

    return <div className="collapsible">
            <div className="static"><div className="button"></div><span>COMMON</span><div className="menu"></div></div>
            <div className="content">
              <div className="row">
                <span className="text">Type</span>
                <span className="value">{entity.tagName}</span>
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
                  return <AttributeRow onChange={handleEntityChange} key={key} name={key} schema={schema} data={componentData.data} componentname={key} entity={this.props.entity} />
                }.bind(this))
              }
              <MixinsComponent entity={entity}/>
            </div>
          </div>;
  }
});

module.exports = CommonComponents;
