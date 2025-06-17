/* eslint-disable no-unused-vars, react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from '../AwesomeIcon';
import debounce from 'lodash.debounce';

import Entity from './Entity';
import Toolbar from './Toolbar';
import Events from '../../lib/Events';

export default class SceneGraph extends React.Component {
  static propTypes = {
    scene: PropTypes.object,
    selectedEntity: PropTypes.object,
    visible: PropTypes.bool
  };

  static defaultProps = {
    selectedEntity: ''
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

    this.updateFilteredEntities = debounce(
      this.updateFilteredEntities.bind(this),
      100
    );
  }

  onEntityUpdate = (detail) => {
    if (detail.component === 'mixin' || detail.component === 'visible') {
      this.rebuildEntityOptions();
    }
  };

  componentDidMount() {
    this.rebuildEntityOptions();
    Events.on('entityidchange', this.rebuildEntityOptions);
    Events.on('entitycreated', this.rebuildEntityOptions);
    Events.on('entityclone', this.rebuildEntityOptions);
    Events.on('entityupdate', this.onEntityUpdate);
  }

  componentWillUnmount() {
    Events.off('entityidchange', this.rebuildEntityOptions);
    Events.off('entitycreated', this.rebuildEntityOptions);
    Events.off('entityclone', this.rebuildEntityOptions);
    Events.off('entityupdate', this.onEntityUpdate);
  }

  /**
   * Selected entity updated from somewhere else in the app.
   */
  componentDidUpdate(prevProps) {
    if (prevProps.selectedEntity !== this.props.selectedEntity) {
      this.selectEntity(this.props.selectedEntity);
    }
  }

  selectEntity = (entity) => {
    let found = false;
    for (let i = 0; i < this.state.filteredEntities.length; i++) {
      const entityOption = this.state.filteredEntities[i];
      if (entityOption.entity === entity) {
        this.setState({ selectedIndex: i });
        setTimeout(() => {
          // wait 100ms to allow React to update the UI and create the node we're interested in
          const node = document.getElementById('sgnode' + i);
          const scrollableContainer = document.querySelector(
            '#scenegraph .outliner'
          );
          if (!node || !scrollableContainer) return;
          const containerRect = scrollableContainer.getBoundingClientRect();
          const nodeRect = node.getBoundingClientRect();
          const isVisible =
            nodeRect.top >= containerRect.top &&
            nodeRect.bottom <= containerRect.bottom;
          if (!isVisible) {
            node.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        // Make sure selected value is visible in scenegraph
        this.expandToRoot(entity);
        Events.emit('entityselect', entity);
        found = true;
        break;
      }
    }

    if (!found) {
      this.setState({ selectedIndex: -1 });
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

        entities.push({
          entity: entity,
          depth: depth,
          id: 'sgnode' + entities.length
        });

        treeIterate(entity, depth);
      }
    }
    treeIterate(this.props.scene, 0);

    this.setState({
      entities: entities,
      filteredEntities: this.getFilteredEntities(this.state.filter, entities)
    });
  };

  selectIndex = (index) => {
    if (index >= 0 && index < this.state.entities.length) {
      this.selectEntity(this.state.entities[index].entity);
    }
  };

  onFilterKeyUp = (event) => {
    if (event.keyCode === 27) {
      this.clearFilter();
    }
  };

  onKeyDown = (event) => {
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

  onKeyUp = (event) => {
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
    return entities.filter((entityOption) => {
      return filterEntity(entityOption.entity, filter || this.state.filter);
    });
  }

  isVisibleInSceneGraph = (x) => {
    let curr = x.parentNode;
    if (!curr) {
      return false;
    }
    while (curr?.isEntity) {
      if (!this.isExpanded(curr)) {
        return false;
      }
      curr = curr.parentNode;
    }
    return true;
  };

  isExpanded = (x) => this.state.expandedElements.get(x) === true;

  toggleExpandedCollapsed = (x) => {
    this.setState({
      expandedElements: this.state.expandedElements.set(x, !this.isExpanded(x))
    });
  };

  expandToRoot = (x) => {
    // Expand element all the way to the scene element
    let curr = x.parentNode;
    while (curr !== undefined && curr.isEntity) {
      this.state.expandedElements.set(curr, true);
      curr = curr.parentNode;
    }
    this.setState({ expandedElements: this.state.expandedElements });
  };

  previousExpandedIndexTo = (i) => {
    for (let prevIter = i - 1; prevIter >= 0; prevIter--) {
      const prevEl = this.state.entities[prevIter].entity;
      if (this.isVisibleInSceneGraph(prevEl)) {
        return prevIter;
      }
    }
    return -1;
  };

  nextExpandedIndexTo = (i) => {
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

  onChangeFilter = (evt) => {
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
      <a onClick={this.clearFilter} className="button">
        <AwesomeIcon icon={faTimes} />
      </a>
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
            {!this.state.filter && <AwesomeIcon icon={faSearch} />}
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
    entity.tagName.indexOf(filter.toUpperCase()) !== -1 ||
    entity.classList.contains(filter) ||
    entity.matches(filter)
  ) {
    return true;
  }

  return false;
}
