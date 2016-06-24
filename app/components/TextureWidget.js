var React = require('react');
var handleEntityChange = require('./Widget');
var Events = require('../lib/Events.js');

function GetFilename(url) {
  if (url) {
    var m = url.toString().match(/.*\/(.+?)\./);
    if (m && m.length > 1) {
       return m[1];
    }
  }
  return '';
}


function insertNewAsset(type, id, src) {
  var element = null;
  switch (type) {
    case 'img': {
        element = document.createElement("img");
        element.id = id;

        element.src = src;
    } break;
  }
  if (element)
    document.getElementsByTagName("a-assets")[0].appendChild(element);
}

function insertOrGetImageAsset(src) {
  var id = GetFilename(src);
  // Search for already loaded asset by src
  var element = document.querySelector("a-assets > img[src='" + src + "']");

  if (element) {
    id = element.id;
  } else {
    // Check if first char of the ID is a number (Non a valid ID)
    // In that case a 'i' preffix will be added
    if (!isNaN(parseInt(id[0], 10))) {
      id='i' + id;
    }
    if (document.getElementById(id)) {
      var i = 1;
      while (document.getElementById(id + '_' + i)) {
        i++;
      }
      id += '_' + i;
    }
    insertNewAsset('img', id, src);
  }

  return id;
}



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
      //console.info("setting state", this.props, newProps);
      //this.setState({value: newProps.value});
      this.setValue(newProps.value);
    }
  },
  componentDidMount: function() {
    this.setValue(this.props.value || '');
  },
  setValue: function(value) {
    var canvas = this.refs.canvas;
    var context = canvas.getContext('2d');

    var self = this;
    function paintPreviewWithImage(image) {
      var filename = image.src.replace(/^.*[\\\/]/, '')
      if ( image !== undefined && image.width > 0 ) {
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage( image, 0, 0, image.width * scale, image.height * scale );
        // self.setState({dataURL: canvas.toDataURL()});
      } else {
        context.clearRect( 0, 0, canvas.width, canvas.height );
      }
    }

    function paintPreview(texture) {
      var image = texture.image;
      paintPreviewWithImage(image);
    }

    function getTextureFromSrc(src) {
      for (var hash in editor.sceneEl.systems.material.textureCache) {
        if (JSON.parse(hash).src == src)
          return editor.sceneEl.systems.material.textureCache[hash];
      }
      return null;
    }

    var url;
    if (value[0] == '#') {
      url = document.querySelector(value).getAttribute('src');
    } else {
      url = AFRAME.utils.srcLoader.parseUrl(value);
    }

    var texture = getTextureFromSrc(value);
    var className = 'hidden';
    if (texture) {
      texture.then(paintPreview);
      className = value[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
    } else if (url) {
      // The image still didn't load
      className = value[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
      var image = new Image();
      image.addEventListener('load', function(){paintPreviewWithImage(image);}, false);
      image.src = url;
    } else {
      context.clearRect( 0, 0, canvas.width, canvas.height );
    }

    this.setState({value: value, valueType: className});
  },
  notifyChanged: function(value) {
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    this.setState({value: value, valueType: className});
  },
/*
  getImageUrl: function() {
    var canvas = this.refs.canvas;
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 16;

    var context = canvas.getContext( '2d' );

    function paintPreview(texture) {
      var image = texture.image;
      var filename = image.src.replace(/^.*[\\\/]/, '')
      if (image !== undefined && image.width > 0) {
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
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

    var className = 'hidden';
    if (texture) {
      className = this.state.value[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
      texture.then(paintPreview);
    } else {
      context.clearRect( 0, 0, canvas.width, canvas.height );
    }
    //return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC';
    return canvas.toDataURL("image/jpeg");
  },
  */
  removeMap: function(e) {
    this.setValue('');
    this.notifyChanged('');
  },
  openDialog: function() {
    Events.emit('openTexturesModal', function(image) {
      if (!image) {
        return;
      }

      var value = image.value;
      if (image.type !== 'asset') {
        var assetId = insertOrGetImageAsset(image.src);
        value = '#' + assetId;
      }
      if (this.props.onChange) {
        this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
      }
      this.setValue(value);

    }.bind(this));
  },
  render: function() {
    return (
      <span className="texture">
        <span className={this.state.valueType}></span>
        <canvas ref="canvas" width="32" height="16" title={this.props.mapName} onClick={this.openDialog}></canvas>
        <input className="map_value" type="text" value={this.state.value}/>
        <input type="button" value="remove" onClick={this.removeMap}/>
      </span>
    );
  }
});

// <img ref="img" src={this.state.dataURL}/>
// <input type="text" value={this.state.value}/>
module.exports = TextureWidget;
