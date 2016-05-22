[![Build Status](https://travis-ci.org/rofrischmann/inline-style-prefix-all.svg)](https://travis-ci.org/rofrischmann/inline-style-prefix-all)
[![Test Coverage](https://codeclimate.com/github/rofrischmann/inline-style-prefix-all/badges/coverage.svg)](https://codeclimate.com/github/rofrischmann/inline-style-prefix-all/coverage)
[![Code Climate](https://codeclimate.com/github/rofrischmann/inline-style-prefix-all/badges/gpa.svg)](https://codeclimate.com/github/rofrischmann/inline-style-prefix-all)
[![npm version](https://badge.fury.io/js/inline-style-prefix-all.svg)](http://badge.fury.io/js/inline-style-prefix-all)
[![npm downloads](https://img.shields.io/npm/dm/inline-style-prefix-all.svg)](https://img.shields.io/npm/dm/inline-style-prefix-all.svg)
![Dependencies](https://david-dm.org/rofrischmann/inline-style-prefix-all.svg)
![Gzipped Size](https://img.shields.io/badge/gzipped-3.3kb-brightgreen.svg)

**inline-style-prefix-all** is a **tiny** *(3.3kb gzipped)* static javascript **Autoprefixer** for inline style objects. It uses data from [caniuse.com](http://caniuse.com/) to get all properties that require a prefix up to a given browser version.<br>
It was extracted from [inline-style-prefixer](https://github.com/rofrischmann/inline-style-prefixer). Check that repository for detailed information on which properties are supported, which special plugins are used and other stuff.
> You could also use [inline-style-prefixer](https://github.com/rofrischmann/inline-style-prefixer) completely as it uses **prefix-all** as a fallback, but this repository has reduced file size.

# Browser Scope
It will **only** add prefixes if a property still needs them in one of the following browser versions.<br>
This means *e.g. `border-radius`* will not be prefixed at all.<br>
For legacy support check [custom build](#custom-build--legacy-support).
* Chrome: 30+
* Safari: 6+
* Firefox: 25+
* Opera: 13+
* IE: 9+
* Edge 12+
* iOS: 6+
* Android: 4+
* IE mobile: 9+
* Opera mini: 5+
* Android UC: 9+
* Android Chrome: 30+

# Usage
```bash
npm install inline-style-prefix-all --save
```
```javascript
import prefixAll from 'inline-style-prefix-all'

const styles = {
  transition: '200ms all linear',
  boxSizing: 'border-box',
  display: 'flex',
  color: 'blue'
}

const prefixedStyles = prefixAll(styles)

// prefixedStyles === output
const output = {
  WebkitTransition: '200ms all linear',
  // Firefox dropped prefixed transition with version 16
  // IE never supported prefixed transitions
  transition: '200ms all linear',
  MozBoxSizing: 'border-box',
  // Firefox up to version 28 needs a prefix
  // Others dropped prefixes out of scope
  boxSizing: 'border-box',
  // Fallback/prefixed values get grouped in arrays
  display: ['-webkit-box', '-moz-box', '-ms-flexbox', '-webkit-flex', 'flex']
  color: 'blue'
}
```

# Custom Build & Legacy Support
You may have to create a custom build if you need older browser versions. Just modify the [config.js](config.js) file which includes all the browser version specifications.
```sh
npm install
npm run build
```

# License
**inline-style-prefix-all** is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [@rofrischmann](http://rofrischmann.de).

# Contributing
I would love to see people getting involved.<br>
If you have a feature request please create an issue. Also if you're even improving inline-style-prefix-all by any kind please don't be shy and send a pull request to let everyone benefit.

### Issues
If you're having any issue please let me know as fast as possible to find a solution a hopefully fix the issue. Try to add as much information as possible such as your environment, exact case, the line of actions to reproduce the issue.

### Pull Requests
If you are creating a pull request, try to use commit messages that are self-explanatory. Also always add some **tests** unless it's totally senseless (add a reason why it's senseless) and test your code before you commit so Travis won't throw errors.
