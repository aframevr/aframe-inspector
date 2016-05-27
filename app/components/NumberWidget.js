var React = require('react');
var handleEntityChange = require('./Widget');

var NumberWidget = React.createClass({
  getInitialState: function() {
    return {value: this.props.value, displayValue: this.props.value.toFixed(this.props.precision)};
  },
  propTypes: {
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    value: React.PropTypes.number,
    precision: React.PropTypes.number,
    step: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      min: -Infinity,
      max: Infinity,
      value: 0,
      precision: 2,
      step: 1
    };
  },
  componentDidMount: function() {
    this.distance = 0;
    this.onMouseDownValue = 0;
    this.prevPointer = [ 0, 0 ];

    this.setValue(this.props.value);

    this.onBlur();
    var input = this.refs.input;
    input.addEventListener('mousedown', this._onMouseDown, false);
    input.addEventListener('change', this.onChange, false);
    input.addEventListener('focus', this.onFocus, false);
    input.addEventListener('blur', this.onBlur, false);
  },
  _onMouseMove: function(event) {
    var currentValue = parseFloat(this.value);
    var pointer = [ event.clientX, event.clientY ];

    this.distance += ( pointer[ 0 ] - this.prevPointer[ 0 ] ) - ( pointer[ 1 ] - this.prevPointer[ 1 ] );
    var value = this.onMouseDownValue + ( this.distance / ( event.shiftKey ? 5 : 50 ) ) * this.props.step;
    value = Math.min( this.props.max, Math.max( this.props.min, value ) );
    if ( currentValue !== value ) {
      this.setValue( value );
    }
    this.prevPointer = [ event.clientX, event.clientY ];
  },
  _onMouseDown: function(event) {
    event.preventDefault();
    this.distance = 0;
    this.onMouseDownValue = this.state.value;
    this.prevPointer = [ event.clientX, event.clientY ];
    document.addEventListener( 'mousemove', this._onMouseMove, false );
    document.addEventListener( 'mouseup', this._onMouseUp, false );
  },
  _onMouseUp: function( event ) {
    document.removeEventListener( 'mousemove', this._onMouseMove, false );
    document.removeEventListener( 'mouseup', this._onMouseUp, false );

    if ( Math.abs( this.distance ) < 2 ) {
      this.refs.input.focus();
      this.refs.input.select();
    }
  },
  setValue: function(value) {
    if (value === this.state.value) return;

    if (value !== undefined) {

      value = parseFloat(value);
      if (value < this.props.min)
        value = this.props.min;
      if (value > this.props.max)
        value = this.props.max;

      if (this.props.precision === 0) {
        value = parseInt(value);
      }
      this.setState({value: value, displayValue: value.toFixed(this.props.precision)});

      if (this.props.onChange)
        this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    console.log(newProps);
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value, displayValue: newProps.value.toFixed(this.props.precision)});
    }
  },
  onChange: function( event ) {
    var value = 0;
    try {
      value = eval( this.refs.input.value );
    } catch ( error ) {
      console.error( error.message );
    }
    this.setValue( parseFloat( value ) );
  },
  _onFocus: function() {
    this.setState({class: 'focused'});
  },
  onBlur: function() {
    this.setValue(parseFloat(this.refs.input.value));
    this.setState({class: ''});
  },
  focus: function() {
    if (this.refs) {
      this.refs.focus();
      this.refs.select();
    }
  },
  nada: function(e) {
    this.setState({displayValue: this.refs.input.value});
  },
  onKeyDown: function(event) {
    event.stopPropagation();
    if ( event.keyCode === 13 ) this.refs.input.blur();
  },
  render: function() {
    return (
        <input ref="input" className="number" type="text" value={this.state.displayValue} onKeyDown={this.onKeyDown} onChange={this.nada}/>
        );
  }
});

module.exports = NumberWidget;
