/* eslint-env mocha */
import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import EventListener from './index';

describe('EventListener', () => {
  describe('props: children', () => {
    it('should work without', () => {
      const wrapper = shallow(
        <EventListener />
      );

      assert.strictEqual(wrapper.children().length, 0,
        'Should work without children');
    });

    it('should render it', () => {
      const wrapper = shallow(
        <EventListener>
          <div>{'Foo'}</div>
        </EventListener>
      );

      assert.strictEqual(wrapper.children().length, 1,
        'Should render his children.');
    });
  });
});
