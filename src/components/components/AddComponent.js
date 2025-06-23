import React from 'react';
import PropTypes from 'prop-types';
import Events from '../../lib/Events';
import Select from 'react-select';

export default class AddComponent extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = { value: null };
  }

  /**
   * Add blank component.
   * If component is instanced, generate an ID.
   */
  addComponent = (value) => {
    this.setState({ value: null });

    let componentName = value.value;

    const entity = this.props.entity;

    if (AFRAME.components[componentName].multiple) {
      let id = prompt(
        `Provide an ID for this component (e.g., 'foo' for ${componentName}__foo).`
      );
      if (id) {
        id = id
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        // With the transform, id could be empty string, so we need to check again.
      }
      if (id) {
        componentName = `${componentName}__${id}`;
      } else {
        // If components already exist, be sure to suffix with an id,
        // if it's first one, use the component name without id.
        const numberOfComponents = Object.keys(
          this.props.entity.components
        ).filter(function (name) {
          return (
            name === componentName || name.startsWith(`${componentName}__`)
          );
        }).length;
        if (numberOfComponents > 0) {
          id = numberOfComponents + 1;
          componentName = `${componentName}__${id}`;
        }
      }
    }

    entity.setAttribute(componentName, '');
    Events.emit('componentadd', { entity: entity, component: componentName });
  };

  /**
   * Component dropdown options.
   */
  getComponentsOptions() {
    const usedComponents = Object.keys(this.props.entity.components);
    return Object.keys(AFRAME.components)
      .filter((componentName) => {
        if (
          AFRAME.components[componentName].sceneOnly &&
          !this.props.entity.isScene
        ) {
          return false;
        }

        return (
          AFRAME.components[componentName].multiple ||
          usedComponents.indexOf(componentName) === -1
        );
      })
      .map(function (value) {
        return { value: value, label: value };
      })
      .toSorted(function (a, b) {
        return a.label === b.label ? 0 : a.label < b.label ? -1 : 1;
      });
  }

  render() {
    const entity = this.props.entity;
    if (!entity) {
      return <div />;
    }

    const options = this.getComponentsOptions();

    return (
      <div id="addComponentContainer">
        <p id="addComponentHeader">COMPONENTS</p>
        <Select
          id="addComponent"
          className="addComponent"
          classNamePrefix="select"
          options={options}
          isClearable={false}
          isSearchable
          placeholder="Add component..."
          noOptionsMessage={() => 'No components found'}
          onChange={this.addComponent}
          value={this.state.value}
        />
      </div>
    );
  }
}
