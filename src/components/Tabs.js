var React = require('react');

/*
<Tabs>
  <Pane label="Tab 1">
    <div>This is my tab 1 contents!</div>
  </Pane>
  <Pane label="Tab 2">
    <div>This is my tab 2 contents!</div>
  </Pane>
  <Pane label="Tab 3">
    <div>This is my tab 3 contents!</div>
  </Pane>
</Tabs>
 */
export default class Tabs extends React.Component {
	static propTypes = {
    selected: React.PropTypes.number,
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  };

  static defaultProps = {
    selected: 0
  };

  constructor(props) {
    super(props);
    this.state = {
    	selected: this.props.selected
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
  	return this.props !== nextProps || this.state !== nextState;
  }

  handleClick = (index, event) => {
  	event.preventDefault();
    this.setState({
    	selected: index
    });
  }

  _renderTitles() {
  	function labels(child, index) {
    	var activeClass = (this.state.selected === index ? 'active' : '');
    	return (
      	<li key={index}>
        	<a href="#"
          	className={activeClass}
          	onClick={this.handleClick.bind(this, index)}>
          	{child.props.label}
          </a>
        </li>
      );
    }
  	return (
    	<ul className="tabs__labels">
      	{this.props.children.map(labels.bind(this))}
      </ul>
    );
  }

  _renderContent() {
  	return (
    	<div className="tabs__content">
	    	{this.props.children[this.state.selected]}
      </div>
    );
  }

	render() {
  	return (
    	<div className="tabs">
        {this._renderTitles()}
      	{this._renderContent()}
      </div>
    );
  }
}
