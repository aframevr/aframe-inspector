import Events from '../../lib/Events';
import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
var insertNewAsset = require('../../lib/assetsUtils').insertNewAsset;

function getFilename(url, converted = false) {
  var filename = url.split('/').pop();
  if (converted) {
    filename = getValidId(filename);
  }
  return filename;
}

function isValidId(id) {
  // The correct re should include : and . but A-frame seems to fail while accessing them
  var re = /^[A-Za-z]+[\w\-]*$/;
  return re.test(id);
}

function getValidId(name) {
  // info.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '')
  return name
    .split('.')
    .shift()
    .replace(/\s/, '-')
    .replace(/^\d+\s*/, '')
    .replace(/[\W]/, '')
    .toLowerCase();
}

export default class ModalTextures extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    selectedTexture: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      isOpen: this.props.isOpen,
      loadedTextures: [],
      assetsImages: [],
      registryImages: [],
      addNewDialogOpened: false,
      newUrl: '',
      preview: {
        width: 0,
        height: 0,
        src: '',
        id: '',
        name: '',
        filename: '',
        type: '',
        value: '',
        loaded: false
      }
    };
  }

  componentDidMount() {
    Events.on('assetsimagesload', images => {
      this.generateFromRegistry();
    });

    this.generateFromAssets();
  }

  componentDidUpdate() {
    if (this.state.isOpen && !AFRAME.INSPECTOR.assetsLoader.hasLoaded) {
      AFRAME.INSPECTOR.assetsLoader.load();
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.setState({ isOpen: newProps.isOpen });
      if (newProps.isOpen) {
        this.generateFromAssets();
      }
    }
  }

  onClose = value => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  selectTexture = value => {
    if (this.props.onClose) {
      this.props.onClose(value);
    }
  };

  generateFromRegistry = () => {
    var self = this;
    AFRAME.INSPECTOR.assetsLoader.images.forEach(imageData => {
      var image = new Image();
      image.addEventListener('load', () => {
        self.state.registryImages.push({
          id: imageData.id,
          src: imageData.fullPath,
          width: imageData.width,
          height: imageData.height,
          name: imageData.id,
          type: 'registry',
          tags: imageData.tags,
          value: 'url(' + imageData.fullPath + ')'
        });
        self.setState({ registryImages: self.state.registryImages.slice() });
      });
      image.src = imageData.fullThumbPath;
    });
  };

  generateFromAssets = () => {
    this.setState({ assetsImages: [] });

    var self = this;
    Array.prototype.slice
      .call(document.querySelectorAll('a-assets img'))
      .map(asset => {
        var image = new Image();
        image.addEventListener('load', () => {
          self.state.assetsImages.push({
            id: asset.id,
            src: image.src,
            width: image.width,
            height: image.height,
            name: asset.id,
            type: 'asset',
            value: '#' + asset.id
          });
          self.setState({ assetsImages: self.state.assetsImages });
        });
        image.src = asset.src;
      });
  };

  onNewUrl = event => {
    if (event.keyCode !== 13) {
      return;
    }

    var self = this;
    function onImageLoaded(img) {
      var src = self.refs.preview.src;
      self.setState({
        preview: {
          width: self.refs.preview.naturalWidth,
          height: self.refs.preview.naturalHeight,
          src: src,
          id: '',
          name: getFilename(src, true),
          filename: getFilename(src),
          type: 'new',
          loaded: true,
          value: 'url(' + src + ')'
        }
      });
      self.refs.preview.removeEventListener('load', onImageLoaded);
    }
    this.refs.preview.addEventListener('load', onImageLoaded);
    this.refs.preview.src = event.target.value;

    this.refs.imageName.focus();
  };

  onNameKeyUp = event => {
    if (event.keyCode === 13 && this.isValidAsset()) {
      this.addNewAsset();
    }
  };

  onNameChanged = event => {
    var state = this.state.preview;
    state.name = event.target.value;
    this.setState({ preview: state });
  };

  toggleNewDialog = () => {
    this.setState({ addNewDialogOpened: !this.state.addNewDialogOpened });
  };

  clear() {
    this.setState({
      preview: {
        width: 0,
        height: 0,
        src: '',
        id: '',
        filename: '',
        name: '',
        type: '',
        loaded: false,
        value: ''
      },
      newUrl: ''
    });
  }

  onUrlChange = e => {
    this.setState({ newUrl: e.target.value });
  };

  isValidAsset() {
    let validUrl = isValidId(this.state.preview.name);
    let validAsset = this.state.preview.loaded && validUrl;
    return validAsset;
  }

  addNewAsset = () => {
    var self = this;
    insertNewAsset(
      'img',
      this.state.preview.name,
      this.state.preview.src,
      true,
      function() {
        self.generateFromAssets();
        self.setState({ addNewDialogOpened: false });
        self.clear();
      }
    );
  };

  onChangeFilter = e => {
    this.setState({ filterText: e.target.value });
  };

  renderRegistryImages() {
    var self = this;
    let selectSample = function(image) {
      self.setState({
        preview: {
          width: image.width,
          height: image.height,
          src: image.src,
          id: '',
          name: getFilename(image.name, true),
          filename: getFilename(image.src),
          type: 'registry',
          loaded: true,
          value: 'url(' + image.src + ')'
        }
      });
      self.refs.imageName.focus();
    };

    var filterText = this.state.filterText.toUpperCase();

    return this.state.registryImages
      .filter(image => {
        return (
          image.id.toUpperCase().indexOf(filterText) > -1 ||
          image.name.toUpperCase().indexOf(filterText) > -1 ||
          image.tags.indexOf(filterText) > -1
        );
      })
      .map(function(image) {
        let imageClick = selectSample.bind(this, image);
        return (
          <li key={image.src} onClick={imageClick}>
            <img width="155px" height="155px" src={image.src} />
            <div className="detail">
              <span className="title">{image.name}</span>
              <span>{getFilename(image.src)}</span>
              <span>
                {image.width} x {image.height}
              </span>
            </div>
          </li>
        );
      });
  }

  render() {
    let isOpen = this.state.isOpen;
    let loadedTextures = this.state.loadedTextures;
    let preview = this.state.preview;

    let validUrl = isValidId(this.state.preview.name);
    let validAsset = this.isValidAsset();

    let addNewAssetButton = this.state.addNewDialogOpened
      ? 'BACK'
      : 'LOAD TEXTURE';

    return (
      <Modal
        id="textureModal"
        title="Textures"
        isOpen={isOpen}
        onClose={this.onClose}
        closeOnClickOutside={false}
      >
        <button onClick={this.toggleNewDialog}>{addNewAssetButton}</button>
        <div className={this.state.addNewDialogOpened ? '' : 'hide'}>
          <div className="newimage">
            <div className="new_asset_options">
              <span>Load a new texture from one of these sources:</span>
              <ul>
                <li>
                  <span>From URL (and press Enter):</span>{' '}
                  <input
                    type="text"
                    className="imageUrl"
                    value={this.state.newUrl}
                    onChange={this.onUrlChange}
                    onKeyUp={this.onNewUrl}
                  />
                </li>
                <li>
                  <span>From assets registry: </span>
                  <div className="assets search">
                    <input
                      placeholder="Filter..."
                      value={this.state.filterText}
                      onChange={this.onChangeFilter}
                    />
                    <span className="fa fa-search" />
                  </div>
                  <ul ref="registryGallery" className="gallery">
                    {this.renderRegistryImages()}
                  </ul>
                </li>
              </ul>
            </div>
            <div className="preview">
              Name:{' '}
              <input
                ref="imageName"
                className={
                  this.state.preview.name.length > 0 && !validUrl ? 'error' : ''
                }
                type="text"
                value={this.state.preview.name}
                onChange={this.onNameChanged}
                onKeyUp={this.onNameKeyUp}
              />
              <img
                ref="preview"
                width="155px"
                height="155px"
                src={preview.src}
              />
              {this.state.preview.loaded ? (
                <div className="detail">
                  <span className="title" title={preview.filename}>
                    {preview.filename}
                  </span>
                  <br />
                  <span>
                    {preview.width} x {preview.height}
                  </span>
                </div>
              ) : (
                <span />
              )}
              <br />
              <button disabled={!validAsset} onClick={this.addNewAsset}>
                LOAD THIS TEXTURE
              </button>
            </div>
          </div>
        </div>
        <div className={this.state.addNewDialogOpened ? 'hide' : ''}>
          <ul className="gallery">
            {this.state.assetsImages
              .sort(function(a, b) {
                return a.id > b.id;
              })
              .map(
                function(image) {
                  let textureClick = this.selectTexture.bind(this, image);
                  var selectedClass =
                    this.props.selectedTexture === '#' + image.id
                      ? 'selected'
                      : '';
                  return (
                    <li
                      key={image.id}
                      onClick={textureClick}
                      className={selectedClass}
                    >
                      <img width="155px" height="155px" src={image.src} />
                      <div className="detail">
                        <span className="title">{image.name}</span>
                        <span>{getFilename(image.src)}</span>
                        <span>
                          {image.width} x {image.height}
                        </span>
                      </div>
                    </li>
                  );
                }.bind(this)
              )}
            {loadedTextures.map(function(texture) {
              var image = texture.image;
              let textureClick = this.selectTexture.bind(this, texture);
              return (
                <li key={texture.uuid} onClick={textureClick}>
                  <img width="155px" height="155px" src={image.src} />
                  <div className="detail">
                    <span className="title">Name:</span>{' '}
                    <span>{image.name}</span>
                    <span className="title">Filename:</span>{' '}
                    <span>{getFilename(image.src)}</span>
                    <span>
                      {image.width} x {image.height}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>
    );
  }
}
