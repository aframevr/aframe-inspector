var React = require('react');
var handleEntityChange = require('./Widget');

var ColorWidget = React.createClass({
  getInitialState: function() {
    return {value: this.correctValue(this.props.value) || ''};
  },
  /*
  propTypes: {
    value: React.PropTypes.string
  },*/
  getDefaultProps: function() {
    return {
      value: '#ffffff'
    };
  },
  setValue: function(value) {
    this.setState({value: this.correctValue(value)});
  },
  update: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setValue(newProps.value);
    }
  },
  correctValue: function(value) {
    if ( value.length === 4 ) {
      value = '#' + value[ 1 ] + value[ 1 ] + value[ 2 ] + value[ 2 ] + value[ 3 ] + value[ 3 ];
    }
    return value;
  },
  render: function() {

    return <input type='color' className="color" value={this.state.value} onChange={this.update}/>;
  }
});

module.exports = ColorWidget;
