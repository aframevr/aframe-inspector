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

    // adds a-scene to scene graph.
    options.push({ static: true, value: this.props.scene, html: 'a-scene' });

    // recursively iterates through all a-scene children and adds to scene graph.
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

          // adds icon for key entity types.
          var icons = {'camera': 'fa-video-camera', 'light': 'fa-lightbulb-o'};
          for (var icon in icons) {
            if (child.components && child.components[icon]) {
              extra += ' <i class="fa ' + icons[icon] + '"></i>';
            }
          }

          var pad = '&nbsp;&nbsp;&nbsp;'.repeat(depth);
          var label = child.id ? child.id : child.tagName.toLowerCase();

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
  },
  componentDidMount: function() {
    this.rebuildOptions();

    document.addEventListener('componentremoved', function(e){
      this.forceUpdate();
    }.bind(this));
    Events.on('entitySelected', function(entity, self) {
      if (self) return;
      this.setValue(entity);
    }.bind(this));
    Events.on('entityIdChanged', function(e) {
      this.forceUpdate();
    }.bind(this));
    Events.on('componentChanged', function(e){
      console.log(e);
    });
  },
  componentWillReceiveProps: function(newProps) {
    /*if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }*/
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
