var React = require('react');

var ColorWidget = React.createClass({
  getInitialState: function() {
    return {value: this.correctValue(this.props.value) || ''};
  },
  getDefaultProps: function() {
    return {
      value: '#ffffff'
    };
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value != this.state.value) {
      this.setState({value: this.correctValue(newProps.value)});
    }
  },
  onChange: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  correctValue: function(value) {
    if ( value.length === 4 ) {
      value = '#' + value[ 1 ] + value[ 1 ] + value[ 2 ] + value[ 2 ] + value[ 3 ] + value[ 3 ];
    }
    return value;
  },
  render: function() {
    return <input type='color' className="color" value={this.state.value} onChange={this.onChange}/>;
  }
});

module.exports = ColorWidget;
