import React from 'react';
import PropTypes from 'prop-types';

export default class NumberWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string,
    onChange: PropTypes.func,
    precision: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number
  };

  static defaultProps = {
    min: -Infinity,
    max: Infinity,
    value: 0,
    precision: 3,
    step: 1
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      displayValue:
        typeof this.props.value === 'number'
          ? this.props.value.toFixed(this.props.precision)
          : ''
    };
  }

  componentDidMount() {
    this.distance = 0;
    this.onMouseDownValue = 0;
    this.prevPointer = [0, 0];

    this.setValue(this.props.value);
    this.onBlur();
  }

  onMouseMove = event => {
    const currentValue = parseFloat(this.state.value);
    const pointer = [event.clientX, event.clientY];
    const delta =
      pointer[0] - this.prevPointer[0] - (pointer[1] - this.prevPointer[1]);
    this.distance += delta;

    // Add minimum tolerance to reduce unintentional drags when clicking on input.
    // if (Math.abs(delta) <= 2) { return; }

    let value =
      this.onMouseDownValue +
      ((this.distance / (event.shiftKey ? 5 : 50)) * this.props.step) / 2;
    value = Math.min(this.props.max, Math.max(this.props.min, value));
    if (currentValue !== value) {
      this.setValue(value);
    }
    this.prevPointer = [event.clientX, event.clientY];
  };

  onMouseDown = event => {
    event.preventDefault();
    this.distance = 0;
    this.onMouseDownValue = this.state.value;
    this.prevPointer = [event.clientX, event.clientY];
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
  };

  onMouseUp = event => {
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    if (Math.abs(this.distance) < 2) {
      this.refs.input.focus();
      this.refs.input.select();
    }
  };

  setValue(value) {
    if (value === this.state.value) return;

    if (value !== undefined) {
      if (this.props.precision === 0) {
        value = parseInt(value);
      } else {
        value = parseFloat(value);
      }

      if (value < this.props.min) {
        value = this.props.min;
      }
      if (value > this.props.max) {
        value = this.props.max;
      }

      this.setState({
        value: value,
        displayValue: value.toFixed(this.props.precision)
      });

      if (this.props.onChange) {
        this.props.onChange(this.props.name, parseFloat(value.toFixed(5)));
      }
    }
  }

  componentWillReceiveProps(newProps) {
    // This will be triggered typically when the element is changed directly with
    // element.setAttribute.
    if (newProps.value !== this.state.value) {
      this.setState({
        value: newProps.value,
        displayValue: newProps.value.toFixed(this.props.precision)
      });
    }
  }

  onBlur = () => {
    this.setValue(parseFloat(this.refs.input.value));
    this.setState({ class: '' });
  };

  onChange = e => {
    this.setState({ value: e.target.value, displayValue: e.target.value });
  };

  onKeyDown = event => {
    event.stopPropagation();

    // enter.
    if (event.keyCode === 13) {
      this.setValue(parseFloat(this.refs.input.value));
      this.refs.input.blur();
      return;
    }

    // up.
    if (event.keyCode === 38) {
      this.setValue(parseFloat(this.state.value) + 0.01);
      return;
    }

    // down.
    if (event.keyCode === 40) {
      this.setValue(parseFloat(this.state.value) - 0.01);
      return;
    }
  };

  render() {
    return (
      <input
        ref="input"
        className="number"
        type="text"
        value={this.state.displayValue}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        onMouseDown={this.onMouseDown}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}
