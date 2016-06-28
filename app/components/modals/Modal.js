var React = require('react');

var Modal = React.createClass({
  getInitialState: function() {
    return {isOpen: this.props.isOpen};
  },
  componentWillReceiveProps: function(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.state.isOpen = newProps.isOpen;
    }
  },
  close: function(selectedValue) {
    this.setState({isOpen: false});
    if (this.props.onClose) {
      this.props.onClose();
    }
  },
  render: function() {
    if (!this.state.isOpen) {
      return <span></span>;
    }
    return <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={this.close}>×</span>
          <h3>{ this.props.title }</h3>
        </div>
        <div className="modal-body">
          { this.props.children }
        </div>
      </div>
    </div>
  }
});

module.exports = Modal;
