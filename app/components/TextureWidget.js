var React = require('react');
var handleEntityChange = require('./Widget');

var TextureWidget = React.createClass({
  getInitialState: function() {
    return {value: this.props.value || ''};
  },/*
  propTypes: {
    value: React.PropTypes.string
  },*/
  getDefaultProps: function() {
    return {
      value: '',
      mapName: 'nomap',
      dataURL: ''
    };
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value)
    {
      console.info("setting state", this.props, newProps);
      this.setState({state: newProps.value});
      //this.setValue(newProps.value);
    }
  },
  componentDidMount: function() {
    this.setValue(this.props.value || '');
  },
  setValue: function(value) {
    var canvas = this.refs.canvas;
    var context = canvas.getContext( '2d' );

    var self = this;
    function paintPreview(texture) {
      var image = texture.image;
      var filename = image.src.replace(/^.*[\\\/]/, '')
      if ( image !== undefined && image.width > 0 ) {
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage( image, 0, 0, image.width * scale, image.height * scale );
        self.setState({dataURL: canvas.toDataURL()});
      } else {
        context.clearRect( 0, 0, canvas.width, canvas.height );
      }
    }

    function getTextureFromSrc(src) {
      for (var hash in editor.sceneEl.systems.material.textureCache) {
        if (JSON.parse(hash).src == src)
          return editor.sceneEl.systems.material.textureCache[hash];
      }
      return null;
    }

    var url = AFRAME.utils.srcLoader.parseUrl(value);
    var texture = getTextureFromSrc(value);

    var className = 'hidden';
    if (texture) {
      className = value[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
      texture.then(paintPreview);
    } else {
      context.clearRect( 0, 0, canvas.width, canvas.height );
    }

    console.info("-->",this.props.entity, this.props.componentname, this.props.name, value);

    this.setState({value: value, valueType: className});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  getImageUrl: function() {
    var canvas = this.refs.canvas;
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 16;
    console.log(canvas);

    var context = canvas.getContext( '2d' );

    function paintPreview(texture) {
      var image = texture.image;
      var filename = image.src.replace(/^.*[\\\/]/, '')
      if ( image !== undefined && image.width > 0 ) {
        console.info("aaaaaaa");
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage( image, 0, 0, image.width * scale, image.height * scale );
      } else {
        context.clearRect( 0, 0, canvas.width, canvas.height );
      }
    }

    function getTextureFromSrc(src) {
      for (var hash in editor.sceneEl.systems.material.textureCache) {
        if (JSON.parse(hash).src == src)
          return editor.sceneEl.systems.material.textureCache[hash];
      }
      return null;
    }

    var url = AFRAME.utils.srcLoader.parseUrl(this.state.value);
    var texture = getTextureFromSrc(this.state.value);
    console.log("!!!",  this.state.value, url, texture);

    var className = 'hidden';
    if (texture) {
      className = this.state.value[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
      texture.then(paintPreview);
    } else {
      context.clearRect( 0, 0, canvas.width, canvas.height );
    }
    console.log(canvas.toDataURL("image/jpeg"));
    //return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC';
    return canvas.toDataURL("image/jpeg");
  },
  removeMap: function(e) {
    this.setValue('');
  },
  render: function() {
    return <span className="texture">
            <span className={this.state.valueType}></span>
            <canvas ref="canvas" width="32" height="16" title={this.props.mapName}></canvas>
            <img ref="img" src={this.state.dataURL}/>
            <input type="button" value="remove" onClick={this.removeMap}/>
          </span>
  }
});

/*
<input type="text" value={this.state.value}/>
<ul>
  <li>{this.props.entity.id}</li>
  <li>{this.props.componentname}</li>
  <li>{this.props.name}</li>
</ul>
*/

module.exports = TextureWidget;
