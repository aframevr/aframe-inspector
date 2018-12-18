/* global AFRAME */
import React from 'react';
import PropTypes from 'prop-types';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Clipboard from 'clipboard';
import { getComponentClipboardRepresentation } from '../../lib/entity';
import Events from '../../lib/Events';

const isSingleProperty = AFRAME.schema.isSingleProperty;

/**
 * Single component.
 */
export default class Component extends React.Component {
  static propTypes = {
    component: PropTypes.any,
    entity: PropTypes.object,
    isCollapsed: PropTypes.bool,
    name: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      entity: this.props.entity,
      name: this.props.name
    };
  }

  componentDidMount() {
    var clipboard = new Clipboard(
      '[data-action="copy-component-to-clipboard"]',
      {
        text: trigger => {
          var componentName = trigger
            .getAttribute('data-component')
            .toLowerCase();
          ga(
            'send',
            'event',
            'Components',
            'copyComponentToClipboard',
            componentName
          );
          return getComponentClipboardRepresentation(
            this.state.entity,
            componentName
          );
        }
      }
    );
    clipboard.on('error', e => {
      // @todo Show the error in the UI
      console.error(e);
    });

    Events.on('entityupdate', detail => {
      if (detail.entity !== this.props.entity) {
        return;
      }
      if (detail.component === this.props.name) {
        this.forceUpdate();
      }
    });
  }

  componentWillReceiveProps(newProps) {
    if (this.state.entity !== newProps.entity) {
      this.setState({ entity: newProps.entity });
    }
    if (this.state.name !== newProps.name) {
      this.setState({ name: newProps.name });
    }
  }

  removeComponent = event => {
    var componentName = this.props.name;
    event.stopPropagation();
    if (
      confirm('Do you really want to remove component `' + componentName + '`?')
    ) {
      this.props.entity.removeAttribute(componentName);
      Events.emit('componentremove', {
        entity: this.props.entity,
        component: componentName
      });
      ga('send', 'event', 'Components', 'removeComponent', componentName);
    }
  };

  /**
   * Render propert(ies) of the component.
   */
  renderPropertyRows = () => {
    const componentData = this.props.component;

    if (isSingleProperty(componentData.schema)) {
      const componentName = this.props.name;
      const schema = AFRAME.components[componentName.split('__')[0]].schema;
      return (
        <PropertyRow
          key={componentName}
          name={componentName}
          schema={schema}
          data={componentData.data}
          componentname={componentName}
          isSingle={true}
          entity={this.props.entity}
        />
      );
    }

    return Object.keys(componentData.schema)
      .sort()
      .map(propertyName => (
        <PropertyRow
          key={propertyName}
          name={propertyName}
          schema={componentData.schema[propertyName]}
          data={componentData.data[propertyName]}
          componentname={this.props.name}
          isSingle={false}
          entity={this.props.entity}
        />
      ));
  };

  render() {
    let componentName = this.props.name;
    let subComponentName = '';
    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    return (
      <Collapsible collapsed={this.props.isCollapsed}>
        <div className="componentHeader collapsible-header">
          <span
            className="componentTitle"
            title={subComponentName || componentName}>
            <span>{subComponentName || componentName}</span>
          </span>
          <div className="componentHeaderActions">
            <a
              title="Copy to clipboard"
              data-action="copy-component-to-clipboard"
              data-component={subComponentName || componentName}
              className="button fa fa-clipboard"
              href="#"
            />
            <a
              title="Remove component"
              className="button fa fa-trash-o"
              onClick={this.removeComponent}
            />
          </div>
        </div>
        <div className="collapsible-content">{this.renderPropertyRows()}</div>
      </Collapsible>
    );
  }
}
