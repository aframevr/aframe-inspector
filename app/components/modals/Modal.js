var React = require('react');

export default class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen
    }
  }
  componentWillReceiveProps(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.state.isOpen = newProps.isOpen;
    }
  }
  close(selectedValue) {
    this.setState({isOpen: false});
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  render() {
    if(!this.state.isOpen){
      return <span></span>;
    }
    return <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={this.close.bind(this)}>×</span>
          <h3>{ this.props.title }</h3>
        </div>
        <div className="modal-body">
        { this.props.children }
        </div>
      </div>
    </div>
  }
}
