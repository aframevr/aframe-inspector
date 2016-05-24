var React = require('react');
var handleEntityChange = require('./Widget');
var Events = require('../lib/Events.js');

var Scenegraph = React.createClass({
  getInitialState: function() {
    return {value: this.props.value || ''};
  },/*
  propTypes: {
    value: React.PropTypes.string
  },*/
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
    Events.on('entitySelected', function(entity){
      this.setState({value: entity});
    }.bind(this));
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
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

/*
/*


var div = document.createElement( 'div' );
div.className = 'option ' + ( option.static === true ? '' : 'draggable' );
div.innerHTML = option.html;
div.value = option.value;
scope.dom.appendChild( div );

scope.options.push( div );

div.addEventListener( 'click', function ( event ) {

  scope.setValue( this.value );
  scope.dom.dispatchEvent( changeEvent );

}, false );




      for ( var i = 0; i < this.options.length; i ++ ) {

        var element = this.options[ i ];

        if ( element.value === value ) {

          element.classList.add( 'active' );

          // scroll into view

          var y = element.offsetTop - this.dom.offsetTop;
          var bottomY = y + element.offsetHeight;
          var minScroll = bottomY - this.dom.offsetHeight;

          if ( this.dom.scrollTop > y ) {

            this.dom.scrollTop = y;

          } else if ( this.dom.scrollTop < minScroll ) {

            this.dom.scrollTop = minScroll;

          }

          this.selectedIndex = i;

        } else {

          element.classList.remove( 'active' );

        }

            <div draggable="false" className="option">
              <span className="type PerspectiveCamera"></span> Camera
            </div>
            <div draggable="false" className="option">
              <span className="type Scene"></span> Scene
            </div>
            <div draggable="true" className="option" style={{marginLeft: '10px'}}>
              <span className="type Mesh"></span> Sphere 1 <span className="type SphereBufferGeometry"></span>  <span className="type MeshStandardMaterial"></span>
            </div>
            <div draggable="true" className="option" style={{marginLeft: '10px'}}>
              <span className="type Sprite"></span> Sprite 2
            </div>
            <div draggable="true" className="option" style={{marginLeft: '10px'}}>
              <span className="type Mesh"></span> Cylinder 3 <span className="type CylinderBufferGeometry"></span>  <span className="type MeshStandardMaterial"></span>
            </div>
            <div draggable="true" className="option" style={{marginLeft: '10px'}}>
              <span className="type PointLight"></span> PointLight 1
            </div>
          </div>
*/
module.exports = Scenegraph;
