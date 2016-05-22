# React event listener

> A React component for binding events on the global scope.

[![npm version](https://img.shields.io/npm/v/react-event-listener.svg?style=flat-square)](https://www.npmjs.com/package/react-event-listener)
[![npm downloads](https://img.shields.io/npm/dm/react-event-listener.svg?style=flat-square)](https://www.npmjs.com/package/react-event-listener)
[![Build Status](https://travis-ci.org/oliviertassinari/react-event-listener.svg?branch=master)](https://travis-ci.org/oliviertassinari/react-event-listener)

[![Dependencies](https://img.shields.io/david/oliviertassinari/react-event-listener.svg?style=flat-square)](https://david-dm.org/oliviertassinari/react-event-listener)
[![DevDependencies](https://img.shields.io/david/dev/oliviertassinari/react-event-listener.svg?style=flat-square)](https://david-dm.org/oliviertassinari/react-event-listener#info=devDependencies&view=list)

## Getting Started

```sh
npm install react-event-listener
```

## Usage

```js
import React from 'react';
import EventListener from 'react-event-listener';

class MyComponent extends React.Component {
  handleResize = () => {
    console.log('resize');
  };

  handleMouseMove = () => {
    console.log('mousemove');
  };

  render() {
    return (
      <div>
        <EventListener elementName="document" onMouseMove={this.handleMouseMove} />
        <EventListener elementName="window" onResize={this.handleResize} />
      </div>
    );
  }
}
```

### Note on Testing

In [this](https://github.com/facebook/react/issues/5043) issue from React, `TestUtils.Simulate.` methods won't bubble up to `window` or `document`. As a result, you must use [`document.dispatchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) or simulate event using [native DOM api](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click).

See our [test cases](https://github.com/oliviertassinari/react-event-listener/blob/master/src/__tests__/index.spec.js) for more information.


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


## License

MIT
