var React = require('react');

export default class Collapsible extends React.Component {
	static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  };

  static defaultProps = {
    collapsed: false
  };

  constructor(props) {
    super(props);
    this.state = {
    	collapsed: this.props.collapsed
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
  	return this.props !== nextProps || this.state !== nextState;
  }

  toggleVisibility = () => {
    this.setState({
    	collapsed: !this.state.collapsed
    });
  }

	render() {
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
}
