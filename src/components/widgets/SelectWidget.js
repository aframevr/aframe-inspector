import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

export default class SelectWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string.isRequired,
    entity: PropTypes.object,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    options: PropTypes.array.isRequired,
    value: PropTypes.string
  };

  constructor(props) {
    super(props);
    const value = this.props.value || '';
    this.state = { value: { value: value, label: value } };
  }

  onChange = (value) => {
    this.setState({ value: value }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.props.name, value.value);
      }
    });
  };

  componentDidUpdate(prevProps) {
    const props = this.props;
    if (props.value !== prevProps.value) {
      this.setState({
        value: { value: props.value, label: props.value }
      });
    }
  }

  render() {
    const options = this.props.options.map((value) => {
      return { value: value, label: value };
    });

    return (
      <Select
        className="select-widget"
        classNamePrefix="select"
        options={options}
        simpleValue
        clearable={true}
        placeholder=""
        value={this.state.value}
        noResultsText="No value found"
        onChange={this.onChange}
        searchable={true}
      />
    );
  }
}
