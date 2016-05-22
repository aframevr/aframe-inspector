<h1 align="center"><img src="docs/res/logo.png" width=600></div>
</h1>
[![Build Status](https://travis-ci.org/rofrischmann/inline-style-prefixer.svg)](https://travis-ci.org/rofrischmann/inline-style-prefixer)
[![Test Coverage](https://codeclimate.com/github/rofrischmann/inline-style-prefixer/badges/coverage.svg)](https://codeclimate.com/github/rofrischmann/inline-style-prefixer/coverage)
[![Code Climate](https://codeclimate.com/github/rofrischmann/inline-style-prefixer/badges/gpa.svg)](https://codeclimate.com/github/rofrischmann/inline-style-prefixer)
[![npm version](https://badge.fury.io/js/inline-style-prefixer.svg)](http://badge.fury.io/js/inline-style-prefixer)
[![npm downloads](https://img.shields.io/npm/dm/inline-style-prefixer.svg)](https://img.shields.io/npm/dm/inline-style-prefixer.svg)
![Dependencies](https://david-dm.org/rofrischmann/inline-style-prefixer.svg)
![Gzipped Size](https://img.shields.io/badge/gzipped-~9.7k-brightgreen.svg)

**inline-style-prefixer** adds required **vendor prefixes** to your style object. It only adds prefixes if they're actually required by evaluating the browser's `userAgent` against data from [caniuse.com](http://caniuse.com/).

# Browser Support
Supports the major browsers with the following versions. <br>For legacy support check [custom build](#custom-build--legacy-support).
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

### Fallback
If using an unsupported browser or even run without any `userAgent`, it will use [inline-style-prefix-all](https://github.com/rofrischmann/inline-style-prefix-all) as a fallback.

# Docs
If you got any issue using this prefixer, please first check the FAQ's. Most cases are already covered and provide a solid solution.

* [FAQ](docs/FAQ.md)
* [Supported Properties](docs/Properties.md)
* [Special Plugins](docs/Plugins.md)

# Usage
```bash
npm install inline-style-prefixer --save
```
## Prefixer([config])

```javascript
import Prefixer from 'inline-style-prefixer'

const styles = {
  transition: '200ms all linear',
  userSelect: 'none',
  boxSizing: 'border-box',
  display: 'flex',
  color: 'blue'
}

const prefixer = new Prefixer()
const prefixedStyles = prefixer.prefix(styles)

// Assuming you are using e.g. Chrome version 25
// prefixedStyles === output
const output = {
  transition: '200ms all linear',
  WebkitUserSelect: 'none',
  boxSizing: 'border-box',
  display: '-webkit-flex',
  color: 'blue'
}
```
### Config
#### userAgent
*Default: `navigator.userAgent`*

Sometimes your environment does not provide a proper userAgent string e.g. if you are **rendering on server-side**. Therefore optionally just pass a userAgent-string.

```javascript
const customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'

const prefixer = new Prefixer({userAgent: customUserAgent})
```

#### keepUnprefixed
*Default: `false`*

Use this option to keep default values. This should be used if you're facing wrong prefixes.
```javascript
const styles = {
  userSelect: 'none',
  display: 'flex'
}

const prefixer = new Prefixer({keepUnprefixed: true})
const prefixedStyles = prefixer.prefix(styles)

// Assuming you are using e.g. Chrome version 22
// prefixedStyles === output
const output = {
  WebkitUserSelect: 'none',  
  // unprefixed properties do not get removed
  userSelect: 'none',
  // unprefixed values will be appended to the string
  display: '-webkit-flex;display:flex'
}
```
## Prefixer.prefixAll (static)
> **Deprecated!** Use [inline-style-prefix-all](https://github.com/rofrischmann/inline-style-prefix-all) if you only need static prefixing.

If you want static prefixing for every browser you can use `Prefixer.prefixAll` which uses [inline-style-prefix-all](https://github.com/rofrischmann/inline-style-prefix-all), but this will be removed soon.

```javascript
const styles = {alignItems: 'center'}

const prefixedStyles = Prefixer.prefixAll(styles)

// the userAgent doesn't matter
// prefixedStyles === output
const output = {
  WebkitAlignItems: 'space-around',
  msAlignItems: 'space-around',
  alignItems: 'space-around',
  // it also adds legacy properties and values
  // by running every plugin available
  WebkitBoxAlign: 'justify',
  msFlexAlign: 'distribute',
}
```

## Prefix Information
Every `Prefixer` instance also provides prefix information.
```javascript
// e.g. using a Chrome version 40 userAgent
prefixer.cssPrefix = '-webkit-'
prefixer.jsPrefix = 'Webkit'
prefixer.prefixedKeyframes = '-webkit-keyframes'
```

# Custom Build & Legacy Support
You may have to create a custom build if you need older browser versions. Just modify the [config.js](config.js) file which includes all the browser version specifications.
```sh
npm install
npm run build
```

# License
**inline-style-prefixer** is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [@rofrischmann](http://rofrischmann.de).

# Contributing
I would love to see people getting involved.<br>
If you have a feature request please create an issue. Also if you're even improving inline-style-prefixer by any kind please don't be shy and send a pull request to let everyone benefit.

### Issues
If you're having any issue please let me know as fast as possible to find a solution a hopefully fix the issue. Try to add as much information as possible such as your environment, exact case, the line of actions to reproduce the issue.

### Pull Requests
If you are creating a pull request, try to use commit messages that are self-explanatory. Also always add some **tests** unless it's totally senseless (add a reason why it's senseless) and test your code before you commit so Travis won't throw errors.
