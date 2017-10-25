import React from 'react';
import PropTypes from 'prop-types';

const Events = require('../../lib/Events.js');

function trim (s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, ' ');
  s = s.replace(/\n /, '\n');
  return s;
}

export default class Mixin extends React.Component {
  static propTypes = {
    entity: PropTypes.object.isRequired
  };

  removeMixin = mixin => {
    const entity = this.props.entity;
    const newMixins = trim(entity.getAttribute('mixin').replace(mixin, ''));
    if (newMixins.length === 0) {
      entity.removeAttribute('mixin');
    } else {
      entity.setAttribute('mixin', newMixins);
    }
    ga('send', 'event', 'Components', 'removeMixin');

    // @todo Is there some aframe event we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectchanged', entity.object3D);
  }

  addMixin = () => {
    const entity = this.props.entity;
    entity.setAttribute('mixin',
                        trim(entity.getAttribute('mixin') + ' ' + this.refs.select.value));

    // @todo Is there some aframe event that we could catch instead of explicitly emit the objectChanged event?
    Events.emit('objectchanged', entity.object3D);
    ga('send', 'event', 'Components', 'addMixin');
  }

  renderMixinOptions = () => {
    const mixinIds = this.props.entity.mixinEls.map(function (mixin) { return mixin.id; });
    const allMixins = Array.prototype.slice.call(document.querySelectorAll('a-mixin'));

    return allMixins
      .filter(function (mixin) {
        return mixinIds.indexOf(mixin.id) === -1;
      })
      .sort()
      .map(function (value) {
        return <option key={value.id} value={value.id}>{value.id}</option>;
      });
  }

  renderMixins = () => {
    const mixins = this.props.entity.mixinEls;
    if (mixins.length === 0) { return <span></span>; }
    return (
      <span className='mixinlist'>
        <ul>
          {mixins.map(this.renderMixin)}
        </ul>
      </span>
    );
  }

  renderMixin = mixin => {
    const titles = Object.keys(mixin.attributes)
      .filter(function (i) {
        return mixin.attributes[i].name !== 'id';
      })
      .map(function (i) {
        const title = '- ' + mixin.attributes[i].name + ':\n';
        const titles = mixin.attributes[i].value.split(';').map(function (value) {
          return '  - ' + trim(value);
        });
        return title + titles.join('\n');
      });
    const mixinClick = this.removeMixin.bind(this, mixin.id);

    return (
      <li key={mixin.id}>
        <span className='mixin' title={titles.join('\n')}>{mixin.id}</span>
        <a className='button fa fa-trash-o' onClick={mixinClick}></a>
      </li>
    );
  }

  render () {
    return (
      <div className='row'>
        <span className='text'>mixins</span>
        <span className='value'>
          <select ref='select'>
            {this.renderMixinOptions()}
          </select>
          <a className='button fa fa-plus-circle' onClick={this.addMixin}></a>
        </span>
        {this.renderMixins()}
      </div>
    );
  }
}
