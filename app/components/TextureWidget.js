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
      mapName: 'nomap'
    };
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  componentDidMount: function() {
    this.setValue(this.props.value || '');
  },
  setValue: function(value) {
    var canvas = this.refs.canvas;
    var context = canvas.getContext( '2d' );

    function paintPreview(texture) {
      var image = texture.image;
      var filename = image.src.replace(/^.*[\\\/]/, '')
      if ( image !== undefined && image.width > 0 ) {

        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

      } else {

        //name.value = filename + ' (error)';
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
    console.log(value, url,texture);
  //  console.log(mapValue,texture,aframeEditor.editor.sceneEl.systems.material.textureCache);

    if (texture) {
//      icon.className = mapValue[0] == '#' ? 'fa fa-link' : 'fa fa-external-link';
      texture.then(paintPreview);
    } else {
      context.clearRect( 0, 0, canvas.width, canvas.height );
//      icon.className = '';
    }

    //this.texture = mapValue;
  },
  update: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  render: function() {
    return <span className="texture">
            <span className="fa fa-link"></span>
            <canvas ref="canvas" width="32" height="16" title={this.props.mapName}></canvas>
            <input type="button" value="remove"/>
          </span>
  }
});

/*
 style={paddingRight: '2px'}
style="cursor: pointer; margin-right: 5px; border: 1px solid rgb(136, 136, 136);"
*/
module.exports = TextureWidget;
