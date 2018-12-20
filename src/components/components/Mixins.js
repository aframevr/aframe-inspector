import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const Events = require('../../lib/Events.js');

function trim(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, ' ');
  s = s.replace(/\n /, '\n');
  return s;
}

export default class Mixin extends React.Component {
  static propTypes = {
    entity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { mixins: this.getMixinValue() };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.entity === prevProps.entity) {
      return;
    }
    this.setState({ mixins: this.getMixinValue() });
  }

  getMixinValue() {
    return (this.props.entity.getAttribute('mixin') || '')
      .split(/\s+/g)
      .filter(v => !!v)
      .map(v => ({ label: v, value: v }));
  }

  getMixinOptions = () => {
    const mixinIds = this.props.entity.mixinEls.map(function(mixin) {
      return mixin.id;
    });

    return Array.prototype.slice
      .call(document.querySelectorAll('a-mixin'))
      .filter(function(mixin) {
        return mixinIds.indexOf(mixin.id) === -1;
      })
      .sort()
      .map(function(mixin) {
        return { value: mixin.id, label: mixin.id };
      });
  };

  updateMixins = value => {
    const entity = this.props.entity;

    this.setState({ mixins: value });
    const mixinStr = value.map(v => v.value).join(' ');
    console.log(mixinStr);
    entity.setAttribute('mixin', mixinStr);

    Events.emit('entityupdate', {
      component: 'mixin',
      entity: entity,
      property: '',
      value: mixinStr
    });
    ga('send', 'event', 'Components', 'addMixin');
  };

  render() {
    return (
      <div className="mixinOptions">
        <div className="propertyRow">
          <span className="text">mixins</span>
          <span className="mixinValue">
            <Select
              id="mixinSelect"
              classNamePrefix="select"
              ref="select"
              options={this.getMixinOptions()}
              isMulti={true}
              placeholder="Add mixin..."
              noResultsText="No mixins found"
              onChange={this.updateMixins.bind(this)}
              simpleValue
              value={this.state.mixins}
            />
          </span>
        </div>
      </div>
    );
  }
}
