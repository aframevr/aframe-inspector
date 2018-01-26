/* eslint-disable no-unused-vars, react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import {removeEntity, cloneEntity} from '../../actions/entity';
import Toolbar from './Toolbar';
const Events = require('../../lib/Events.js');

const ICONS = {
  camera: 'fa-camera',
  geometry: 'fa-cube',
  light: 'fa-lightbulb-o',
  material: 'fa-picture-o'
};

const gaTrackSearchEntity = debounce(() => {
  ga('send', 'event', 'SceneGraph', 'searchEntity');
}, 3000);

export default class SceneGraph extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func,
    scene: PropTypes.object,
    value: PropTypes.string,
    visible: PropTypes.bool
  };

  static defaultProps = {
    value: '',
    index: -1,
    id: 'left-sidebar'
  }

  constructor (props) {
    super(props);
    this.state = {
      value: this.props.value || '',
      options: [],
      selectedIndex: -1,
      filterText: '',
      expandedElements: new WeakMap([[props.scene, true]])
    };
  }

  componentDidMount () {
    this.rebuildOptions();

    document.addEventListener('componentremoved', () => {
      this.forceUpdate();
    });

    Events.on('entityselected', (entity, self) => {
      if (self) { return; }
      this.setValue(entity);
    });
    Events.on('entityidchanged', this.rebuildOptions);
    document.addEventListener('componentremoved', this.rebuildOptions);
    Events.on('dommodified', this.rebuildOptions);
  }

  setValue = value => {
    let found = false;
    for (let i = 0; i < this.state.options.length; i++) {
      const element = this.state.options[i];
      if (element.value === value) {
        this.setState({value: value, selectedIndex: i});
        if (this.state.filterText.length > 0){
          // If we were filtering when we selected it then make sure its not under collapsed node in scenegraph
          this.expandToRoot(element.value);
        }
        if (this.props.onChange) {
          this.props.onChange(value);
        }
        Events.emit('entityselected', value, true);
        found = true;
      }
    }

    if (!found) {
      this.setState({value: null, selectedIndex: -1});
    }
    ga('send', 'event', 'SceneGraph', 'selectEntity');
  }

  update = e => {
    this.setValue(e.target.value);
  }

  rebuildOptions = () => {
    const options = [{static: true, value: this.props.scene, tagName: 'a-scene', hasChildren: true, depth: 0}];

    function treeIterate (element, depth) {
      if (!element) { return; }
      depth += 1;
      
      let children = element.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];

        // filter out all entities added by inspector and the canvas added by aframe-core
        if (!child.dataset.isInspector && child.isEntity && !child.isInspector) {
          let extra = '';

          for (let componentName in ICONS) {
            if (child.components && child.components[componentName]) {
              let properties = child.getAttribute(componentName);
              if (!properties) { continue; }
              const titles = Object.keys(properties)
                .sort()
                .map(property => {
                  return ' - ' + property + ': ' + properties[property];
                });
              let componentTitle = componentName + (titles.length ? '\n' + titles.join('\n') : '');
              extra += ' <i class="component fa ' + ICONS[componentName] + '" title="' + componentTitle + '"></i>';
            }
          }

          const pad = '&nbsp;&nbsp;&nbsp;'.repeat(depth);
          const label = child.id ? child.id : '&lt;' + child.tagName.toLowerCase() + '&gt;';

          options.push({
            static: true,
            depth: depth,
            value: child,
            hasChildren: child.children.length > 0,
            tagName: child.tagName.toLowerCase(),
            id: child.id,
            extra: extra
          });

          treeIterate(child, depth);
        }
      }
    }
    treeIterate(this.props.scene, 0);

    this.setState({options: options});
  }

  selectIndex = index => {
    if (index >= 0 && index < this.state.options.length) {
      this.setValue(this.state.options[index].value);
    }
  }

  onFilterKeyUp = event => {
    if (event.keyCode === 27) {
      this.clearFilter();
    }
  }

  onKeyDown = event => {
    switch (event.keyCode) {
      case 38: // up
      case 40: // down
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  onKeyUp = event => {
    if (this.state.value === null) {
      return;
    }
    switch (event.keyCode) {
      case 38: // up
        this.selectIndex(this.state.selectedIndex - 1);
        ga('send', 'event', 'SceneGraph', 'navigateWithKeyboard');
        break;
      case 40: // down
        this.selectIndex(this.state.selectedIndex + 1);
        ga('send', 'event', 'SceneGraph', 'navigateWithKeyboard');
        break;
    }
  }

  cloneEntity = option => {
    cloneEntity(option);
    ga('send', 'event', 'SceneGraph', 'cloneEntity');
  }

  toggleVisibility = (entity, event) => {
    var visible = entity.tagName.toLowerCase() === 'a-scene' ? entity.object3D.visible : entity.getAttribute('visible');
    entity.setAttribute('visible', !visible);
  }

  renderOptions () {
    var filterText = this.state.filterText.toUpperCase();
    var currentMaxDepth = 0;
    var isFiltering = filterText.length > 0;

    return this.state.options
      .filter((option, idx) => {
        const value = option.value;
        // Check if the ID or the tagName includes the filterText
        if (value.id.toUpperCase().indexOf(filterText) > -1 ||
            value.tagName.toUpperCase().indexOf(filterText) > -1 ||
            (value.getAttribute('class') || '').indexOf(filterText) > -1) {
          return true;
        }

        // Check each component's name
        for (var i in value.components) {
          var component = value.components[i];
          if (component.attrName.toUpperCase().indexOf(filterText) > -1) { return true; }

          // @todo Use .data instead of attrValue ?
          for (var j in component.attrValue) {
            var attrValue = component.attrValue[j].toString();
            if (attrValue.toUpperCase().indexOf(filterText) > -1) { return true; }
          }
        }

        return false;
      })
      .map((option, idx) => {
        const isExpanded = this.isExpanded(option.value) || isFiltering; // If searching expand everything

        if (!isFiltering) {
          // Check that our current depth doesn't exceed a limit set by a collapsed element
          if (option.depth > currentMaxDepth) { 
            return null; 
          }
          if (isExpanded) {
            currentMaxDepth = option.depth + 1;
          }
          else { 
            currentMaxDepth = option.depth;
          }
        }

        let cloneButton = <a onClick={() => this.cloneEntity(option.value)}
          title="Clone entity" className="button fa fa-clone"></a>;
        let removeButton = <a onClick={event => { event.stopPropagation(); removeEntity(option.value); } }
          title="Remove entity" className="button fa fa-trash-o"></a>;

        if (option.value.tagName === 'A-SCENE') {
          cloneButton = '';
          removeButton = '';
        }

        const pad = '    '.repeat(option.depth);
        let collapse;
        if (option.hasChildren && !isFiltering) {
          const expandedElements = this.state.expandedElements;
          collapse = <span 
            onClick={() => this.toggleExpandedCollapsed(option.value)}
            className={`collasespace fa ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`}></span> ;
        } else {
          collapse = <span className="collasespace"></span>;
        }
        let entity = option.value;
        const visible = entity.tagName.toLowerCase() === 'a-scene' ? entity.object3D.visible : entity.getAttribute('visible');
        let visibility = <i title="Toggle entity visibility" className={'fa ' + (visible ? 'fa-eye' : 'fa-eye-slash')}
          onClick={ event => { this.toggleVisibility(option.value, event); } }></i>;

        const className = classnames({
          option: true,
          active: option.value === this.state.value,
          novisible: !visible
        });

        let entityName = option.id;
        if (!entity.isScene && !entityName && entity.getAttribute('class')) {
          entityName = entity.getAttribute('class').split(' ')[0];
        }

        return (
          <div key={idx} className={className} value={option.value}
            onClick={() => this.setValue(option.value)}>
            <span>{visibility} {pad} {collapse}&lt;{option.tagName}<span className="name">{entityName ? ` ${entityName}` : ''}</span>
            <span dangerouslySetInnerHTML={{__html: option.extra}}></span>&gt;</span>
              <span className="icons">
                {cloneButton}
                {removeButton}
              </span>
          </div>
        );
      });
  }

  isExpanded = x => this.state.expandedElements.get(x) === true

  toggleExpandedCollapsed = x => {
    this.setState({expandedElements: this.state.expandedElements.set(x, !this.isExpanded(x))})
  }

  expandToRoot = x => {
    // Expand element all the way to the scene element
    let curr = x;
    while (curr !== undefined && curr.isEntity) {
      this.state.expandedElements.set(curr, true);
      curr = curr.parentEl;
    }
    this.setState({expandedElements: this.state.expandedElements});
  }

  onChangeFilter = e => {
    this.setState({filterText: e.target.value});
    gaTrackSearchEntity();
  }

  clearFilter = () => {
    this.setState({filterText: ''});
  }

  render () {
    // to hide the SceneGraph we have to hide its parent too (#left-sidebar)
    if (!this.props.visible) {
      return null;
    }

    let clearFilter = this.state.filterText ? <a onClick={this.clearFilter} className='button fa fa-times'></a> : null;

    return (
      <div id={this.props.id} className='scenegraph'>
        <div className='scenegraph-toolbar'>
          <Toolbar/>
          <div className='search'>
            <input id="filter" placeholder='Search...' value={this.state.filterText}
              onChange={this.onChangeFilter} onKeyUp={this.onFilterKeyUp}/>
            {clearFilter}
            <span className='fa fa-search'></span>
          </div>
        </div>
        <div className='outliner' tabIndex='0' onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}>
          {this.renderOptions()}
        </div>
      </div>
    );
  }
}
