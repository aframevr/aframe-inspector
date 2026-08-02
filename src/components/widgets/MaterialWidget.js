import React from 'react';
import PropTypes from 'prop-types';
import Events from '../../lib/Events';

/**
 * Widget for the `material` property type: a reference to an <a-material> asset
 * (e.g., `#myMaterial`) or an inline `material(...)` definition.
 *
 * The value is edited as a raw string and committed on blur, like selector types.
 * The swatch opens the materials modal to pick another material asset or edit the
 * existing ones.
 */
export default class MaterialWidget extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    value: PropTypes.string
  };

  static defaultProps = {
    value: ''
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || '' };
    this.input = React.createRef();
    this.canvas = React.createRef();
  }

  componentDidMount() {
    this.paintSwatch();
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value || '' });
    }
    this.paintSwatch();
  }

  resolveMaterialEl = (value) => {
    if (!value) return null;
    if (value[0] === '#') {
      const el = document.getElementById(value.substring(1));
      return el && el.isMaterialAsset ? el : null;
    }
    if (value.indexOf('material(') === 0) {
      return (
        Array.from(document.querySelectorAll('a-material')).find(
          (el) => el.inlineString === value
        ) || null
      );
    }
    return null;
  };

  paintSwatch = () => {
    const canvas = this.canvas.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const materialEl = this.resolveMaterialEl(this.state.value);
    if (!materialEl) return;
    const material = materialEl.getMaterial();
    if (!material) return;

    if (material.color) {
      context.fillStyle = '#' + material.color.getHexString();
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const image = material.map && material.map.image;
    if (image && image.width > 0) {
      try {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      } catch (e) {
        // Some sources (e.g., detached video) cannot be drawn; keep the color.
      }
    }
  };

  commit = (value) => {
    if (this.props.onBlur) {
      this.props.onBlur(this.props.name, value);
    }
  };

  onChange = (event) => {
    this.setState({ value: event.target.value });
  };

  onBlur = (event) => {
    this.commit(event.target.value);
    this.paintSwatch();
  };

  onKeyDown = (event) => {
    event.stopPropagation();
    // enter
    if (event.keyCode === 13) {
      this.input.current.blur();
    }
  };

  openDialog = () => {
    Events.emit('openmaterialsmodal', this.state.value, (value) => {
      if (value !== undefined && value !== null && value !== this.state.value) {
        this.setState({ value: value });
        this.commit(value);
      }
      // The material may have been edited in the modal without changing the
      // reference; repaint once the modal closes.
      setTimeout(this.paintSwatch, 0);
    });
  };

  render() {
    const materialEl = this.resolveMaterialEl(this.state.value);
    const hint = materialEl
      ? 'Material asset: ' +
        (materialEl.id ? '#' + materialEl.id : materialEl.inlineString) +
        '\nClick the swatch to pick or edit materials'
      : 'Click the swatch to pick or edit materials';

    return (
      <span className="texture">
        <input
          id={this.props.id}
          ref={this.input}
          className="map_value string"
          type="text"
          title={hint}
          value={this.state.value}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          spellCheck="false"
        />
        <canvas
          ref={this.canvas}
          width="32"
          height="16"
          title={hint}
          onClick={this.openDialog}
        />
      </span>
    );
  }
}
