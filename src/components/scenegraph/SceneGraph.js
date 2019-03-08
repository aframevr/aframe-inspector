/* eslint-disable no-unused-vars, react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import debounce from 'lodash.debounce';

import Entity from './Entity';
import Toolbar from './Toolbar';
const Events = require('../../lib/Events.js');

export default class SceneGraph extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func,
    scene: PropTypes.object,
    selectedEntity: PropTypes.object,
    visible: PropTypes.bool
  };

  static defaultProps = {
    selectedEntity: '',
    index: -1,
    id: 'left-sidebar'
  };

  constructor(props) {
    super(props);
    this.state = {
      entities: [],
      expandedElements: new WeakMap([[props.scene, true]]),
      filter: '',
      filteredEntities: [],
      selectedIndex: -1
    };

    this.rebuildEntityOptions = debounce(
      this.rebuildEntityOptions.bind(this),
      1000
    );
    this.updateFilteredEntities = debounce(
      this.updateFilteredEntities.bind(this),
      500
    );
  }

  componentDidMount() {
    this.rebuildEntityOptions();
    Events.on('entityidchange', this.rebuildEntityOptions);
    Events.on('entitycreated', this.rebuildEntityOptions);
  }

  /**
   * Selected entity updated from somewhere else in the app.
   */
  componentDidUpdate(prevProps) {
    if (prevProps.selectedEntity !== this.props.selectedEntity) {
      this.selectEntity(this.props.selectedEntity);
    }
  }

  selectEntity = entity => {
    let found = false;
    for (let i = 0; i < this.state.filteredEntities.length; i++) {
      const entityOption = this.state.filteredEntities[i];
      if (entityOption.entity === entity) {
        this.setState({ selectedEntity: entity, selectedIndex: i });
        // Make sure selected value is visible in scenegraph
        this.expandToRoot(entity);
        if (this.props.onChange) {
          this.props.onChange(entity);
        }
        Events.emit('entityselect', entity, true);
        found = true;
      }
    }

    if (!found) {
      this.setState({ selectedEntity: null, selectedIndex: -1 });
    }
  };

  rebuildEntityOptions = () => {
    const entities = [{ depth: 0, entity: this.props.scene }];

    function treeIterate(element, depth) {
      if (!element) {
        return;
      }
      depth += 1;

      for (let i = 0; i < element.children.length; i++) {
        let entity = element.children[i];

        if (
          entity.dataset.isInspector ||
          !entity.isEntity ||
          entity.isInspector ||
          'aframeInspector' in entity.dataset
        ) {
          continue;
        }

        entities.push({ entity: entity, depth: depth });

        treeIterate(entity, depth);
      }
    }
    treeIterate(this.props.scene, 0);

    this.setState({
      entities: entities,
      filteredEntities: this.getFilteredEntities(this.state.filter, entities)
    });
  };

  selectIndex = index => {
    if (index >= 0 && index < this.state.entities.length) {
      this.selectEntity(this.state.entities[index].entity);
    }
  };

  onFilterKeyUp = event => {
    if (event.keyCode === 27) {
      this.clearFilter();
    }
  };

  onKeyDown = event => {
    switch (event.keyCode) {
      case 37: // left
      case 38: // up
      case 39: // right
      case 40: // down
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  };

  onKeyUp = event => {
    if (this.props.selectedEntity === null) {
      return;
    }

    switch (event.keyCode) {
      case 37: // left
        if (this.isExpanded(this.props.selectedEntity)) {
          this.toggleExpandedCollapsed(this.props.selectedEntity);
        }
        break;
      case 38: // up
        this.selectIndex(
          this.previousExpandedIndexTo(this.state.selectedIndex)
        );
        break;
      case 39: // right
        if (!this.isExpanded(this.props.selectedEntity)) {
          this.toggleExpandedCollapsed(this.props.selectedEntity);
        }
        break;
      case 40: // down
        this.selectIndex(this.nextExpandedIndexTo(this.state.selectedIndex));
        break;
    }
  };

  getFilteredEntities(filter, entities) {
    entities = entities || this.state.entities;
    if (!filter) {
      return entities;
    }
    return entities.filter(entityOption => {
      return filterEntity(entityOption.entity, filter || this.state.filter);
    });
  }

  isVisibleInSceneGraph = x => {
    let curr = x.parentNode;
    if (!curr) {
      return false;
    }
    while (curr !== undefined && curr.isEntity) {
      if (!this.isExpanded(curr)) {
        return false;
      }
      curr = curr.parentNode;
    }
    return true;
  };

  isExpanded = x => this.state.expandedElements.get(x) === true;

  toggleExpandedCollapsed = x => {
    this.setState({
      expandedElements: this.state.expandedElements.set(x, !this.isExpanded(x))
    });
  };

  expandToRoot = x => {
    // Expand element all the way to the scene element
    let curr = x.parentNode;
    while (curr !== undefined && curr.isEntity) {
      this.state.expandedElements.set(curr, true);
      curr = curr.parentNode;
    }
    this.setState({ expandedElements: this.state.expandedElements });
  };

  previousExpandedIndexTo = i => {
    for (let prevIter = i - 1; prevIter >= 0; prevIter--) {
      const prevEl = this.state.entities[prevIter].entity;
      if (this.isVisibleInSceneGraph(prevEl)) {
        return prevIter;
      }
    }
    return -1;
  };

  nextExpandedIndexTo = i => {
    for (
      let nextIter = i + 1;
      nextIter < this.state.entities.length;
      nextIter++
    ) {
      const nextEl = this.state.entities[nextIter].entity;
      if (this.isVisibleInSceneGraph(nextEl)) {
        return nextIter;
      }
    }
    return -1;
  };

  onChangeFilter = evt => {
    const filter = evt.target.value;
    this.setState({ filter: filter });
    this.updateFilteredEntities(filter);
  };

  updateFilteredEntities(filter) {
    this.setState({
      filteredEntities: this.getFilteredEntities(filter)
    });
  }

  clearFilter = () => {
    this.setState({ filter: '' });
    this.updateFilteredEntities('');
  };

  renderEntities = () => {
    return this.state.filteredEntities.map((entityOption, idx) => {
      if (
        !this.isVisibleInSceneGraph(entityOption.entity) &&
        !this.state.filter
      ) {
        return null;
      }
      return (
        <Entity
          {...entityOption}
          key={idx}
          isFiltering={!!this.state.filter}
          isExpanded={this.isExpanded(entityOption.entity)}
          isSelected={this.props.selectedEntity === entityOption.entity}
          selectEntity={this.selectEntity}
          toggleExpandedCollapsed={this.toggleExpandedCollapsed}
        />
      );
    });
  };

  render() {
    // To hide the SceneGraph we have to hide its parent too (#left-sidebar).
    if (!this.props.visible) {
      return null;
    }

    const clearFilter = this.state.filter ? (
      <a onClick={this.clearFilter} className="button fa fa-times" />
    ) : null;

    return (
      <div id="scenegraph" className="scenegraph">
        <div className="scenegraph-toolbar">
          <Toolbar />
          <div className="search">
            <input
              id="filter"
              placeholder="Search..."
              onChange={this.onChangeFilter}
              onKeyUp={this.onFilterKeyUp}
              value={this.state.filter}
            />
            {clearFilter}
            {!this.state.filter && <span className="fa fa-search" />}
          </div>
        </div>
        <div
          className="outliner"
          tabIndex="0"
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
        >
          {this.renderEntities()}
        </div>
      </div>
    );
  }
}

function filterEntity(entity, filter) {
  if (!filter) {
    return true;
  }

  // Check if the ID, tagName, class, selector includes the filter.
  if (
    entity.id.toUpperCase().indexOf(filter.toUpperCase()) !== -1 ||
    entity.tagName.toUpperCase().indexOf(filter.toUpperCase()) !== -1 ||
    entity.classList.contains(filter) ||
    entity.matches(filter)
  ) {
    return true;
  }

  return false;
}
