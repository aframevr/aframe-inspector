# A-Frame Inspector

[![build status][travis-image]][travis-url]

> Work in progress.

An easy-to-use inspector for editing [A-Frame](https://aframe.io) VR scenes.

[Try it out!](https://aframe.io/aframe-inspector/example/)

<img alt="screenshot" src="https://cloud.githubusercontent.com/assets/674727/16597664/fd7b9748-42ae-11e6-9ece-3dfe763ea11c.png">

## Using the Inspector

There are several ways to use the inspector on your scene.

### A-Frame Component

A-Frame comes with a component to inject the inspector. Just include the `inspector`
component, and press `ctrl + alt + e` to inject the inspector, just like you would
use a DOM inspector:

```html
<a-scene inspector>
  <!-- Scene... -->
</a-scene>
```

### Bookmarklet

Copy and paste the code from the [bookmarket](bookmarklet) into a browser bookmark. Then
open up any scene and click on the bookmarklet to inject the inspector.

### Including the Build

1. [Download the build](https://aframe.io/aframe-inspector/build/aframe-inspector.js)
2. Add the build to the bottom of your A-Frame scene:

```html
<html>
  <body>
    <a-scene></a-scene>

    <!-- Add the inspector build below the scene markup. -->
    <script src="js/aframe-inspector.js"></script>
  </body>
</html>
```

## Working on the Inspector

```bash
git clone git@github.com:aframevr/aframe-inspector.git
cd aframe-inspector
npm install
npm start
```

Then navigate to __[http://localhost:3333/example/](http://localhost:3333/example/)__

[travis-image]: https://img.shields.io/travis/aframevr/aframe-inspector.svg?style=flat-square
[travis-url]: https://travis-ci.org/aframevr/aframe-inspector
