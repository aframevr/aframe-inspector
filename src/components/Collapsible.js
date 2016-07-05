var React = require('react');
var Pane = require('./Pane');

var Collapsible = React.createClass({
	displayName: 'Collapsible',
	propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  },
  getDefaultProps: function () {
  	return {
    	collapsed: false
    };
  },
  getInitialState: function () {
    return {
    	collapsed: this.props.collapsed
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
  	return this.props !== nextProps || this.state !== nextState;
  },
  toggleVisibility: function () {
    this.setState({
    	collapsed: !this.state.collapsed
    });
  },
	render: function () {
    var collapsed = this.state.collapsed;
  	return (
      <div className={'component collapsible' + (collapsed ? ' collapsed' : '')}>
        <div className="static" onClick={this.toggleVisibility}>
          <div className="button"></div>
          {this.props.children[0]}
        </div>
        <div className={'content' + (collapsed ? ' hide' : '')}>
          {this.props.children[1]}
        </div>
      </div>
    );
  }
});

module.exports = Collapsible;
