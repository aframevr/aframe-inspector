import React from 'react';
import PropTypes from 'prop-types';

var Events = require('../../lib/Events.js');

function getUrlFromId(assetId) {
  return (
    assetId.length > 1 &&
    document.querySelector(assetId) &&
    document.querySelector(assetId).getAttribute('src')
  );
}

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
    case 'img':
      {
        element = document.createElement('img');
        element.id = id;
        element.src = src;
      }
      break;
  }
  if (element) {
    document.getElementsByTagName('a-assets')[0].appendChild(element);
  }
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
      id = 'i' + id;
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

export default class TextureWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    mapName: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  };

  static defaultProps = {
    value: '',
    mapName: 'nomap',
    dataURL: ''
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || '' };
  }

  componentDidMount() {
    this.setValue(this.props.value || '');
  }

  componentWillReceiveProps(newProps) {
    var component = this.props.entity.components[this.props.componentname];
    if (!component) {
      return;
    }
    var newValue = component.attrValue[this.props.name];

    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newValue && newValue !== this.state.value) {
      this.setValue(newValue);
    }
  }

  setValue(value) {
    var canvas = this.refs.canvas;
    var context = canvas.getContext('2d');

    function paintPreviewWithImage(image) {
      var filename = image.src.replace(/^.*[\\\/]/, '');
      if (image !== undefined && image.width > 0) {
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage(
          image,
          0,
          0,
          image.width * scale,
          image.height * scale
        );
        // self.setState({dataURL: canvas.toDataURL()});
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    function paintPreview(texture) {
      var image = texture.image;
      paintPreviewWithImage(image);
    }

    function getTextureFromSrc(src) {
      for (var hash in AFRAME.INSPECTOR.sceneEl.systems.material.textureCache) {
        if (JSON.parse(hash).src === src) {
          return AFRAME.INSPECTOR.sceneEl.systems.material.textureCache[hash];
        }
      }
      return null;
    }

    var url;
    var isAssetHash = value[0] === '#';
    var isAssetImg = value instanceof HTMLImageElement;

    if (isAssetImg) {
      url = value.src;
    } else if (isAssetHash) {
      url = getUrlFromId(value);
    } else {
      url = AFRAME.utils.srcLoader.parseUrl(value);
    }

    var texture = getTextureFromSrc(value);
    var valueType = null;
    valueType = isAssetImg || isAssetHash ? 'asset' : 'url';
    if (texture) {
      texture.then(paintPreview);
    } else if (url) {
      // The image still didn't load
      var image = new Image();
      image.addEventListener(
        'load',
        () => {
          paintPreviewWithImage(image);
        },
        false
      );
      image.src = url;
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.setState({
      value: isAssetImg ? '#' + value.id : value,
      valueType: valueType,
      url: url
    });
  }

  notifyChanged = value => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
    this.setState({ value: value });
  };

  onChange = e => {
    var value = e.target.value;
    this.setState({ value: value });
    this.notifyChanged(value);
  };

  removeMap = e => {
    this.setValue('');
    this.notifyChanged('');
  };

  openDialog = () => {
    Events.emit('opentexturesmodal', this.state.value, image => {
      if (!image) {
        return;
      }
      var value = image.value;
      if (image.type !== 'asset') {
        var assetId = insertOrGetImageAsset(image.src);
        value = '#' + assetId;
      }

      if (this.props.onChange) {
        this.props.onChange(this.props.name, value);
      }

      this.setValue(value);
    });
  };

  render() {
    let hint = '';
    if (this.state.value) {
      if (this.state.valueType === 'asset') {
        hint = 'Asset ID: ' + this.state.value + '\nURL: ' + this.state.url;
      } else {
        hint = 'URL: ' + this.state.value;
      }
    }

    return (
      <span className="texture">
        <input
          className="map_value string"
          type="text"
          title={hint}
          value={this.state.value}
          onChange={this.onChange}
        />
        <canvas
          ref="canvas"
          width="32"
          height="16"
          title={hint}
          onClick={this.openDialog}
        />
      </span>
    );
  }
}
