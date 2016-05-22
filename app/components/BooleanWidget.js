var React = require('react');
var handleEntityChange = require('./Widget');

var BooleanWidget = React.createClass({

  getInitialState: function() {
    return {value: this.props.value, disabled: false};
  },
  /*propTypes: {
    value: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      value: false
    };
  },
  setValue: function(value) {

     this.setState({value: value, displayValue: value.toFixed(this.props.precision)});
     handleEntityChange(this.props.entity, this.props.componentname, this.props.name, value);
  },*/
  update: function(e) {
    //this.setState({value: e.target.value});
    //handleEntityChange(this.props.entity, this.props.componentname, this.props.name, e.target.value);
  },
  /*
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
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
*/
  render: function() {
    return (
          <input ref="input" type="checkbox" checked={this.state.value} onChange={this.update}/>
        );
  }
});

module.exports = BooleanWidget;
