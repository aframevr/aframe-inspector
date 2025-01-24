import React from 'react';
import Select from 'react-select';
import Events from '../../lib/Events';

const options = [
  {
    value: 'perspective',
    event: 'cameraperspectivetoggle',
    payload: null,
    label: 'Perspective'
  },
  {
    value: 'ortholeft',
    event: 'cameraorthographictoggle',
    payload: 'left',
    label: 'Left View'
  },
  {
    value: 'orthoright',
    event: 'cameraorthographictoggle',
    payload: 'right',
    label: 'Right View'
  },
  {
    value: 'orthotop',
    event: 'cameraorthographictoggle',
    payload: 'top',
    label: 'Top View'
  },
  {
    value: 'orthobottom',
    event: 'cameraorthographictoggle',
    payload: 'bottom',
    label: 'Bottom View'
  },
  {
    value: 'orthoback',
    event: 'cameraorthographictoggle',
    payload: 'back',
    label: 'Back View'
  },
  {
    value: 'orthofront',
    event: 'cameraorthographictoggle',
    payload: 'front',
    label: 'Front View'
  }
];

function getOption(value) {
  return options.filter((opt) => opt.value === value)[0];
}

export default class CameraToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCamera: 'perspective'
    };
    this.justChangedCamera = false;
  }

  onCameraToggle = (data) => {
    if (this.justChangedCamera) {
      // Prevent recursion.
      this.justChangedCamera = false;
      return;
    }
    this.setState({ selectedCamera: data.value });
  };

  componentDidMount() {
    Events.on('cameratoggle', this.onCameraToggle);
  }

  componentWillUnmount() {
    Events.off('cameratoggle', this.onCameraToggle);
  }

  onChange(option) {
    this.justChangedCamera = true;
    this.setState({ selectedCamera: option.value });
    Events.emit(option.event, option.payload);
  }

  render() {
    return (
      <div id="cameraToolbar">
        <Select
          id="cameraSelect"
          classNamePrefix="select"
          options={options}
          isClearable={false}
          isSearchable={false}
          value={getOption(this.state.selectedCamera)}
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}
