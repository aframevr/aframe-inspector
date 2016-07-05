# A-Frame Editor

[![build status][travis-image]][travis-url]

An easy-to-use editor for editing [A-Frame](https://aframe.io) VR scenes.

<img alt="Screenshot" src="https://cloud.githubusercontent.com/assets/674727/16597664/fd7b9748-42ae-11e6-9ece-3dfe763ea11c.png">

## Getting Started

1. [Download A-FRAME editor script](https://aframevr.github.io/aframe-editor/dist/aframe-editor.js)

2. Add script to your A-FRAME document:

```html
<a-scene>
  <!-- A-Frame scene -->
</a-scene>

<!-- Add editor script below scene markup -->
<script src="js/aframe-editor.js"></script>
```

## Working on the Editor

```
git clone git@github.com:aframevr/aframe-editor.git
cd aframe-editor
npm install
npm start
```

Navigate to __[http://localhost:3333/example](http://localhost:3333/example)__

## Bookmarklet

You can add this code to any page using the following bookmarklet:
```javascript
avascript:(function(){var script=document.createElement('script'); script.src='http://localhost:3333/build/aframe-editor.js';document.head.appendChild(script);})()
```

[travis-image]: https://img.shields.io/travis/aframevr/aframe-editor.svg?style=flat-square
[travis-url]: https://travis-ci.org/aframevr/aframe-editor
