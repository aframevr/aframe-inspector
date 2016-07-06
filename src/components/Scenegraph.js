var React = require('react');
var Events = require('../lib/Events.js');

var Scenegraph = React.createClass({
  getInitialState: function() {
    return {value: this.props.value || '', options: [], selectedIndex: -1};
  },
  getDefaultProps: function() {
    return {
      value: '',
      index: -1
    };
  },
  setValue: function(value) {
    var found = false;
    for (var i = 0; i < this.state.options.length; i++) {
      var element = this.state.options[i];
      if ( element.value === value ) {
        this.setState({value: value, selectedIndex: i});

        if (this.props.onChange)
          this.props.onChange(value);
        Events.emit('entitySelected', value, true);
        found = true;
      }
    }

    if (!found) {
      this.setState({value: null, selectedIndex: -1});
    }
  },
  update: function(e) {
    this.setValue(e.target.value);
  },
  rebuildOptions: function() {
    var options = [];

    options.push({ static: true, value: this.props.scene, html: '<span class="type"></span> a-scene' });

    function treeIterate (element, depth) {
      if (!element) {
        return;
      }

      if (depth === undefined) {
        depth = 1;
      } else {
        depth += 1;
      }
      var children = element.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];

        // filter out all entities added by editor and the canvas added by aframe-core
        if (!child.dataset.isEditor && child.isEntity && !child.isEditor) {
          var extra = '';

          var icons = {'camera': 'fa-video-camera', 'light': 'fa-lightbulb-o', 'geometry': 'fa-cube', 'material': 'fa-picture-o'};
          for (var icon in icons) {
            if (child.components && child.components[icon]) {
              extra += ' <i class="fa ' + icons[icon] + '"></i>';
            }
          }

          var typeClass = 'Entity';
          switch (child.tagName.toLowerCase()) {
            case 'a-animation':
              typeClass = 'Animation';
              break;
            case 'a-entity':
              typeClass = 'Entity';
              break;
            default:
              typeClass = 'Template';
          }

          var type = '<span class="type ' + typeClass + '"></span>';
          var pad = '&nbsp;&nbsp;&nbsp;'.repeat(depth);
          var label = child.id ? child.id : child.tagName.toLowerCase();

          options.push({
            static: true,
            value: child,
            html: pad + type + label + extra
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
  },
  componentDidMount: function() {
    this.rebuildOptions();

    Events.on('entitySelected', function(entity, self) {
      if (self) return;
      this.setValue(entity);
    }.bind(this));
    Events.on('entityIdChanged', this.rebuildOptions);
    document.addEventListener('componentremoved', this.rebuildOptions);
    document.addEventListener('componentchanged', function(event){
      console.log(event, Object.keys(event.detail.oldData).length);
      // Check if a new component is added
      if (event.detail.oldData && Object.keys(event.detail.oldData).length === 0) {
        this.rebuildOptions();
      }
    }.bind(this));
    Events.on('sceneModified', this.rebuildOptions);
  },
  selectIndex: function(index) {
    if (index >= 0 && index < this.state.options.length) {
  		this.setValue(this.state.options[index].value);
  	}
  },
  onKeyDown: function(event) {
    switch ( event.keyCode ) {
			case 38: // up
			case 40: // down
				event.preventDefault();
				event.stopPropagation();
				break;
    }
  },
  onKeyUp: function(event) {
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
  },
  render: function() {
    return <div className="Outliner" tabIndex="0" id="outliner" onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}>
      {
        this.state.options.map(function(option, idx) {
          var className = 'option' + (option.value === this.state.value ? ' active' : '');
  		    return <div key={idx} className={className} value={option.value} dangerouslySetInnerHTML={{__html:option.html}} onClick={this.setValue.bind(this, option.value)}></div>
  	    }.bind(this))
      }
    </div>
  }
});

module.exports = Scenegraph;
