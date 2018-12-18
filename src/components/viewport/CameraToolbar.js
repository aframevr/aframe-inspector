var React = require('react');
var Events = require('../../lib/Events.js');
var classNames = require('classnames');

var cameraButtons = [
  { value: 'perspective', event: 'cameraperspectivetoggle', payload: null, icon: 'camera', label: 'Perspective Camera' },
  { value: 'ortholeft', event: 'cameraorthographictoggle', payload: 'left', icon: 'arrow-left', label: 'Left Camera View' },
  { value: 'orthoright', event: 'cameraorthographictoggle', payload: 'right', icon: 'arrow-right', label: 'Right Camera View' },
  { value: 'orthotop', event: 'cameraorthographictoggle', payload: 'top', icon: 'arrow-up', label: 'Top Camera View' },
  { value: 'orthobottom', event: 'cameraorthographictoggle', payload: 'bottom', icon: 'arrow-down', label: 'Bottom Camera View' },
  { value: 'orthoback', event: 'cameraorthographictoggle', payload: 'back', icon: 'arrow-circle-up', label: 'Back Camera View' },
  { value: 'orthofront', event: 'cameraorthographictoggle', payload: 'front', icon: 'arrow-circle-down', label: 'Front Camera View' },
];

export default class CameraToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCamera: 'perspective'
    };
    this.justChangedCamera = false;
  }

  componentDidMount() {
    Events.on('cameratoggle', data => {
      if (this.justChangedCamera) {
        // Prevent recursion.
        this.justChangedCamera = false;
        return;
      }
      this.setState({selectedCamera: data.value});
    });
  }

  changeCamera(option) {
    this.justChangedCamera = true;
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
          title={option.label}
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
