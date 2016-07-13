import React from 'react';

const Events = require('../lib/Events.js');

const ICONS = {
  camera: 'fa-video-camera',
  geometry: 'fa-cube',
  light: 'fa-lightbulb-o',
  material: 'fa-picture-o'
};

export default class SceneGraph extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func,
    scene: React.PropTypes.object,
    value: React.PropTypes.string
  };

  static defaultProps = {
    value: '',
    index: -1
  }

  constructor (props) {
    super(props);
    this.state = {
      value: this.props.value || '',
      options: [],
      selectedIndex: -1,
      filterText: ''
    };
  }

  componentDidMount () {
    this.rebuildOptions();

    document.addEventListener('componentremoved', () => {
      this.forceUpdate();
    });

    Events.on('entitySelected', (entity, self) => {
      if (self) { return; }
      this.setValue(entity);
    });
    Events.on('entityIdChanged', this.rebuildOptions);
    document.addEventListener('componentremoved', this.rebuildOptions);
    document.addEventListener('componentchanged', event => {
      // Check if a new component is added.
      if (event.detail.oldData && Object.keys(event.detail.oldData).length === 0) {
        this.rebuildOptions();
      }
    });
    Events.on('sceneModified', this.rebuildOptions);
  }

  setValue = value => {
    let found = false;
    for (let i = 0; i < this.state.options.length; i++) {
      const element = this.state.options[i];
      if (element.value === value) {
        this.setState({value: value, selectedIndex: i});

        if (this.props.onChange) {
          this.props.onChange(value);
        }
        Events.emit('entitySelected', value, true);
        found = true;
      }
    }

    if (!found) {
      this.setState({value: null, selectedIndex: -1});
    }
  }

  update = e => {
    this.setValue(e.target.value);
  }

  rebuildOptions = () => {
    const options = [{static: true, value: this.props.scene, html: '&lt;a-scene&gt;'}];

    function treeIterate (element, depth) {
      if (!element) { return; }

      if (depth === undefined) {
        depth = 1;
      } else {
        depth += 1;
      }
      let children = element.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];

        // filter out all entities added by editor and the canvas added by aframe-core
        if (!child.dataset.isEditor && child.isEntity && !child.isEditor) {
          let extra = '';

          for (let icon in ICONS) {
            if (child.components && child.components[icon]) {
              extra += ' <i class="fa ' + ICONS[icon] + '"></i>';
            }
          }

          const pad = '&nbsp;&nbsp;&nbsp;'.repeat(depth);
          const label = child.id ? child.id : '&lt;' + child.tagName.toLowerCase() + '&gt;';

          options.push({
            static: true,
            value: child,
            html: pad + label + extra
          });

          if (child.tagName.toLowerCase() !== 'a-entity') {
            continue;
          }
          treeIterate(child, depth);
        }
      }
    }
    treeIterate(this.props.scene);
    this.setState({options: options});
  }

  selectIndex = index => {
    if (index >= 0 && index < this.state.options.length) {
      this.setValue(this.state.options[index].value);
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
        break;
      case 40: // down
        this.selectIndex(this.state.selectedIndex + 1);
        break;
    }
  }

  renderOptions () {
    var filterText = this.state.filterText.toUpperCase();
    return this.state.options
      .filter((option, idx) => {
        const value = option.value;
        return value.id.toUpperCase().indexOf(filterText) > -1 ||
               value.tagName.toUpperCase().indexOf(filterText) > -1;
      })
      .map((option, idx) => {
        let className = 'option' + (option.value === this.state.value ? ' active' : '');
        return (
          <div key={idx} className={className} value={option.value}
            dangerouslySetInnerHTML={{__html: option.html}}
            onClick={this.setValue.bind(this, option.value)}/>
        );
      });
  }

  onChangeFilter = e => {
    this.setState({filterText: e.target.value});
  }

  render () {
    return (
      <div className='scenegraph'>
        <div className='search'>
          <input placeholder='Search...' value={this.state.filterText}
            onChange={this.onChangeFilter}/>
          <span className='fa fa-search'></span>
        </div>
        <div className='outliner' tabIndex='0' onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}>
          {this.renderOptions()}
        </div>
      </div>
    );
  }
}
