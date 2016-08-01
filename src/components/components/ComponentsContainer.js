import React from 'react';
import AddComponent from './AddComponent';
import Component from './Component';
import CommonComponents from './CommonComponents';

const DEFAULT_COMPONENTS = ['visible', 'position', 'scale', 'rotation'];

export default class ComponentsContainer extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

/*
  componentDidMount () {
    document.addEventListener('componentremoved', event => {
      if (this.state.entity === event.detail.target) {
        this.refresh();
      }
    });
  }
*/
  refresh = () => {
    this.forceUpdate();
  }

  render () {
    const entity = this.props.entity;
    const components = entity ? entity.components : {};
    const defaultComponents = Object.keys(components).filter(function (key) {
      return DEFAULT_COMPONENTS.indexOf(key) === -1;
    }).sort().map(function (key) {
      return <Component entity={entity} key={key} name={key} component={components[key]}/>;
    });

    return (
      <div className='components'>
        <CommonComponents entity={entity}/>
        <AddComponent entity={entity}/>
        {defaultComponents}
      </div>
    );
  }
}
