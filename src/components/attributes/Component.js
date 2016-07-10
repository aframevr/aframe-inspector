import React from 'react';

import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';
var Clipboard = require('clipboard');

function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

export default class Component extends React.Component {
  static propTypes = {
    component: React.PropTypes.any,
    entity: React.PropTypes.object,
    name: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {
      entity: this.props.entity,
      name: this.props.name
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.state.entity !== newProps.entity) {
      this.setState({entity: newProps.entity});
    }
    if (this.state.name !== newProps.name) {
      this.setState({name: newProps.name});
    }
  }

  deleteComponent = event => {
    event.stopPropagation();
    if (confirm('Do you really want to delete component `' + this.props.name + '`?')) {
      this.props.entity.removeAttribute(this.props.name);
    }
  }

  resetComponent = event => {
    event.stopPropagation();
    if (confirm('Do you really want to restore the default values for the component `' + this.props.name + '`?')) {
      this.props.entity.setAttribute(this.props.name, {});
    }
  }
  componentDidMount() {
    var self = this;
    var clipboard = new Clipboard('[data-action="copy-component-to-clipboard"]', {
      text: function (trigger) {
        function copyToClipboard(entity, componentName) {
          function getModifiedAttributes(entity, componentName)  {
            var data = entity.components[componentName].data;
            var defaultData = entity.components[componentName].schema;
            var diff = {};
            for (var key in data) {
              // @todo Some parameters could be null and '' like mergeTo
              if (data[key] !== defaultData[key].default) {
                diff[key] = data[key];
              }
            }
            return diff;
          }

          function getAttributesFromJSON(data) {
            return Object.keys(data).map(function(k) {
                return k + ': ' + data[k]
            }).join('; ')
          }

          var diff = getModifiedAttributes(entity, componentName);
          return getAttributesFromJSON(diff);
        }

        var componentName = trigger.getAttribute('data-component').toLowerCase();
        return copyToClipboard(self.state.entity, componentName);
      }
    });
    clipboard.on('error', function(e) {
        console.error('Error while copying to clipboard:', e.action, e.trigger);
    });
  }

  render () {
    const componentData = this.props.component;
    let componentName = this.props.name.toUpperCase();
    let subComponentName = '';

    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    let attributeRows;
    if (isSingleProperty(componentData.schema)) {
      var key = componentName.toLowerCase();
      var schema = AFRAME.components[key.toLowerCase()].schema;
      attributeRows = (
        <AttributeRow key={key} name={key} schema={schema}
          data={componentData.data} componentname={key}
          entity={this.props.entity}/>
      );
    } else {
      attributeRows = Object.keys(componentData.schema).map(key => {
        return (
          <AttributeRow key={key} name={key} schema={componentData.schema[key]}
            data={componentData.data[key]} componentname={this.props.name}
            entity={this.props.entity}/>
        );
      });
    }

    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span>{componentName} <span className='subcomponent'>{subComponentName}</span></span>
          <div>
            <a href="#" title="Copy to clipboard" data-action="copy-component-to-clipboard"
              data-component={subComponentName || componentName}
              className="button fa fa-clipboard" onClick={event => event.stopPropagation()}></a>
            <a href="#" title="Reset to default" className="button fa fa-undo"
              onClick={this.resetComponent}></a>
            <a href="#" title="Delete component" className="button fa fa-trash-o"
              onClick={this.deleteComponent}></a>
          </div>
        </div>
        <div className='collapsible-content'>{attributeRows}</div>
      </Collapsible>
    );
  }
}
