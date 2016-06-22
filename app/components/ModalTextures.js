import React from 'react';
import Modal from './Modal';

function getFilename(url) {
  return url.split('/').pop();
}

var Tabs = React.createClass({
	displayName: 'Tabs',
	propTypes: {
    selected: React.PropTypes.number,
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  },
  getDefaultProps: function () {
  	return {
    	selected: 0
    };
  },
  getInitialState: function () {
    return {
    	selected: this.props.selected
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
  	return this.props !== nextProps || this.state !== nextState;
  },
  handleClick: function (index, event) {
  	event.preventDefault();
    this.setState({
    	selected: index
    });
  },
  _renderTitles: function () {
  	function labels(child, index) {
    	var activeClass = (this.state.selected === index ? 'active' : '');
    	return (
      	<li key={index}>
        	<a href="#"
          	className={activeClass}
          	onClick={this.handleClick.bind(this, index)}>
          	{child.props.label}
          </a>
        </li>
      );
    }
  	return (
    	<ul className="tabs__labels">
      	{this.props.children.map(labels.bind(this))}
      </ul>
    );
  },
  _renderContent: function () {
  	return (
    	<div className="tabs__content">
	    	{this.props.children[this.state.selected]}
      </div>
    );
  },
	render: function () {
  	return (
    	<div className="tabs">
        {this._renderTitles()}
      	{this._renderContent()}
      </div>
    );
  }
});

var Pane = React.createClass({
	displayName: 'Pane',
  propTypes: {
    label: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  },
	render: function () {
  	return (
    	<div>
      	{this.props.children}
      </div>
    );
  }
});

export default class ModalTextures extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isOpen: props.isOpen,
      loadedTextures: [],
      assetsImages: [],
      samplesImages: []
    }
    this.samplesImages = [
      {name: 'create1111', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/758px-Canestra_di_frutta_Caravaggio.jpg'},
      {name: 'asdfqwer', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/2294472375_24a3b8ef46_o.jpg'},
      {name: 'werwere', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/brick_diffuse.jpg'},
      {name: 'werasdfasdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/checkerboard.jpg'},
      {name: 'asdfsdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/crate.gif'},
      {name: 'asdfsdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/UV_Grid_Sm.jpg'},
      {name: 'asdfsdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/sprite0.png'},
      {name: 'asdfsdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/envmap.png'},
      {name: 'asdfsdf', filename: 'image.jpg', dimensions: '512x512', size: '32kb', src:'assets/textures/brick_bump.jpg'}
    ];
  }
  componentWillReceiveProps(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.state.isOpen = newProps.isOpen;
      if (this.state.isOpen) {
        this.generateFromAssets();
      }
    }
  }
  onClose(value) {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  selectTexture(value) {
    if (this.props.onClose) {
      this.props.onClose(value);
      this.setState({isOpen: false});
    }
  }
  generateFromSamples() {
    var self = this;
    this.samplesImages.map((imageData) => {
      var image = new Image();
      image.addEventListener('load', function() {
        self.state.samplesImages.push({id: imageData.name, src: image.src, width: image.width, height: image.height, name: imageData.name, type: 'sample', value: 'url(' + image.src + ')'});
        self.setState({samplesImages: self.state.samplesImages});
      });
      image.src = imageData.src;
    });
  }
  generateFromAssets() {
    this.setState({assetsImages: []});

    var self = this;
    Array.prototype.slice.call(document.querySelectorAll('a-assets img')).map((asset) => {
      var image = new Image();
      image.addEventListener('load', function() {
        self.state.assetsImages.push({id: asset.id, src: image.src, width: image.width, height: image.height, name: asset.id, type: 'asset', value: '#' + asset.id});
        self.setState({assetsImages: self.state.assetsImages});
      });
      image.src = asset.src;
    });
  }
  generateFromTextureCache() {

  }
  componentDidMount() {
    this.generateFromSamples();
    this.generateFromAssets();
    this.generateFromTextureCache();

    /*
    Object.keys(editor.sceneEl.systems.material.textureCache).map((hash) => {
      var texturePromise = editor.sceneEl.systems.material.textureCache[hash];
      texturePromise.then(texture => {
        var elementPos = self.state.loadedTextures.map(function(x) {return x.image.src; }).indexOf(texture.image.src);
        if (elementPos === -1) {
          var newTextures = self.state.loadedTextures.slice();
          newTextures.push(texture);
          self.setState({
            loadedTextures: newTextures
          });
        }
      })
    });*/
  }
  render() {
    let samples = this.textures;
    //let alreadyLoaded = editor.sceneEl.systems.material.textureCache;
    let loadedTextures = this.state.loadedTextures;

    //title="Textures" isOpen={this.state.isOpen} onClose={this.onClose.bind(this)}>
    return <Modal
          title="Textures" isOpen={this.state.isOpen} onClose={this.onClose.bind(this)}>
          <Tabs selected={0}>
            <Pane label="ADD NEW">
              <div>ADD NEW TEXTURE</div>
            </Pane>
            <Pane label="SCENE ASSETS">
              <ul className="gallery">
                {
                  this.state.assetsImages.map(function(image) {
                    let textureClick = this.selectTexture.bind(this, image);
                     return (
                       <li key={image.id} onClick={textureClick}>
                         <img width="155px" height="155px" src={image.src}/>
                         <div className="detail">
                           <span className="title">Name:</span> <span>{image.name}</span><br/>
                           <span className="title">Filename:</span> <span>{getFilename(image.src)}</span><br/>
                           <span>{image.width} x {image.height}</span>
                         </div>
                       </li>
                     )
                  }.bind(this))
                }

                {
                  loadedTextures.map(function(texture) {
                    var image = texture.image;
                    let textureClick = this.selectTexture.bind(this, texture);
                     return (
                       <li key={texture.uuid} onClick={textureClick}>
                         <img width="155px" height="155px" src={image.src}/>
                         <div className="detail">
                           <span className="title">Name:</span> <span>{image.name}</span><br/>
                           <span className="title">Filename:</span> <span>{getFilename(image.src)}</span><br/>
                           <span>{image.width} x {image.height}</span>
                         </div>
                       </li>
                     )
                  }.bind(this))
                }
              </ul>
            </Pane>
            <Pane label="SAMPLES">
                <ul className="gallery">
                  {
              	     this.state.samplesImages.map(function(texture) {
                       let textureClick = this.selectTexture.bind(this, texture);
                        return (
                          <li key={texture.src} onClick={textureClick}>
                            <img width="155px" height="155px" src={texture.src}/>
                            <div className="detail">
                              <span className="title">Name:</span> <span>{texture.name}</span><br/>
                              <span className="title">Filename:</span> <span>{texture.filename}</span><br/>
                              <span>{texture.dimensions}</span>
                            </div>
                          </li>
                        )
          	         }.bind(this))
                  }
                </ul>
            </Pane>
          </Tabs>
    </Modal>
  }
}
