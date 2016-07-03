var React = require('react');

var Modal = React.createClass({
  getInitialState: function() {
    return {isOpen: this.props.isOpen};
  },
  handleGlobalKeydown: function (event) {
    if (this.state.isOpen && event.keyCode === 27) {
      this.close();
    }
  },
  shouldClickDismiss: function(event) {
    var target = event.target;
    // This piece of code isolates targets which are fake clicked by things
    // like file-drop handlers
    if (target.tagName === 'INPUT' && target.type === 'file') {
      return false;
    }
    if (target === this.refs.self || this.refs.self.contains(target)) return false;
    return true;
  },
  handleGlobalMousedown: function (event) {
    if (this.state.isOpen && this.shouldClickDismiss(event)) {
      if (typeof this.props.onClose == 'function') {
        this.props.onClose();
      }
    }
  },
  componentDidMount: function() {
    document.addEventListener('keyup', this.handleGlobalKeydown);
    document.addEventListener('mousedown', this.handleGlobalMousedown);
  },
  componentWillUnmount: function() {
    document.removeEventListener('keyup', this.handleGlobalKeydown);
    document.removeEventListener('mousedown', this.handleGlobalMousedown);
  },
  componentWillReceiveProps: function(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.state.isOpen = newProps.isOpen;
    }
  },
  close: function() {
    this.setState({isOpen: false});
    if (this.props.onClose) {
      this.props.onClose();
    }
  },
  render: function() {
    if (!this.state.isOpen) {
      return <span></span>;
    }
    return (
      <div className="modal">
        <div className="modal-content"  ref="self">
          <div className="modal-header">
            <span className="close" onClick={this.close}>×</span>
            <h3>{ this.props.title }</h3>
          </div>
          <div className="modal-body">
            { this.props.children }
          </div>
        </div>
      </div>
    )
  }
});

module.exports = Modal;
