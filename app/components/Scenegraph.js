var React = require('react');
var Events = require('../lib/Events.js');

var Scenegraph = React.createClass({
  getInitialState: function() {
    return {value: this.props.value || ''};
  },
  getDefaultProps: function() {
    return {
      value: ''
    };
  },
  setValue: function(value) {
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(value);
    Events.emit('entitySelected', value);
  },
  update: function(e) {
    this.setValue(e.target.value);
  },
  componentDidMount: function() {
    document.addEventListener('componentremoved', function(e){
      this.forceUpdate();
    }.bind(this));
    Events.on('entitySelected', function(entity){
      this.setState({value: entity});
    }.bind(this));
    Events.on('entityIdChanged', function(e) {
      this.forceUpdate();
    }.bind(this));
    Events.on('componentChanged', function(e){
      console.log(e);
    });
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  render: function() {
    var options = [];

    options.push({ static: true, value: this.scene, html: '<span class="type"></span> a-scene' });

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

    return <div className="Outliner" tabindex="0" id="outliner">
      {
        options.map(function(option, idx) {
          var className = 'option' + (option.value === this.state.value ? ' active' : '');
  		    return <div key={idx} className={className} value={option.value} dangerouslySetInnerHTML={{__html:option.html}} onClick={this.setValue.bind(this, option.value)}></div>
  	    }.bind(this))
      }
    </div>
  }
});

module.exports = Scenegraph;
