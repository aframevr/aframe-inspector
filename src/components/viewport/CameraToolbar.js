var React = require('react');
var Events = require('../../lib/Events.js');
var classNames = require('classnames');

var cameraButtons = [
  { value: 'perspective', event: 'cameraperspectivetoggle', payload: null, icon: 'camera' },
  { value: 'ortholeft', event: 'cameraorthographictoggle', payload: 'left', icon: 'arrow-left'},
  { value: 'orthoright', event: 'cameraorthographictoggle', payload: 'right', icon: 'arrow-right'},
  { value: 'orthotop', event: 'cameraorthographictoggle', payload: 'top', icon: 'arrow-up' },
  { value: 'orthobottom', event: 'cameraorthographictoggle', payload: 'bottom', icon: 'arrow-down' },
  { value: 'orthoback', event: 'cameraorthographictoggle', payload: 'back', icon: 'arrow-circle-up'},
  { value: 'orthofront', event: 'cameraorthographictoggle', payload: 'front', icon: 'arrow-circle-down'},
];

export default class CameraToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCamera: 'perspective'
    };
  }

  componentDidMount() {
  }

  changeCamera(option) {
    this.setState({selectedCamera: option.value});
    Events.emit(option.event, option.payload);
  }

  renderCameraButtons = () => {
    return cameraButtons.map((option, i) => {
      const selected = option.value === this.state.selectedCamera;
      const classes = classNames({
        button: true,
        fa: true,
        ['fa-' + option.icon]: true,
        active: selected
      });

      return (
        <a
          title={option.value}
          key={i}
          onClick={this.changeCamera.bind(this, option)}
          className={classes}
        />
      );
    });
  };

  render() {
    return (
      <div id="cameraToolbar" className="toolbarButtons">
        {this.renderCameraButtons()}
      </div>
    );
  }
}
