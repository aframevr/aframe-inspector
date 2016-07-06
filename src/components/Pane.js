var React = require('react');

export const Pane = props => (
  <div>
    {this.props.children}
  </div>
);

Pane.propTypes = {
  label: React.PropTypes.string.isRequired,
  children: React.PropTypes.element.isRequired
};
