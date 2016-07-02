# A-FRAME EDITOR

An easy-to-use editor for creating VR scenes using [A-FRAME](http://aframe.io/).

## Getting started

1. [Download A-FRAME editor script](https://aframevr.github.io/aframe-editor/dist/aframe-editor.js)

2. Add script to your A-FRAME document:

```html
<script src="js/aframe-editor.js"></script>
```

## Working on the editor

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
