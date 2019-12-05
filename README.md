# A-Frame Inspector

[![build status][travis-image]][travis-url]

A visual inspector tool for [A-Frame](https://aframe.io) scenes. Just hit
`<ctrl> + <alt> + i` on any A-Frame scene to open up the Inspector.

- [Documentation / Guide](https://aframe.io/docs/master/introduction/visual-inspector-and-dev-tools.html)
- [Example](https://aframe.io/aframe-inspector/examples/)

Also check out:

- [A-Frame Watcher](https://github.com/supermedium/aframe-watcher) - Companion server to sync changes to HTML files.

![Inspector Preview](https://user-images.githubusercontent.com/674727/50159991-fa540c80-028c-11e9-87f1-72c54e08d808.png)

## Using the Inspector

### Keyboard Shortcut

A-Frame comes with a **keyboard shortcut** to inject the inspector. Just open
up any A-Frame scene (running at least A-Frame v0.3.0) and press **`<ctrl> +
<alt> + i`** to inject the inspector, just like you would use a DOM inspector:

### Specifying Inspector Build

This is done with the `inspector` component. By default, this is set on the
scene already. If we want, we can specify a specific build of the Inspector to
inject by passing a URL. For debugging:

```html
<a-scene inspector="url: http://localhost:3333/dist/aframe-inspector.js">
  <!-- Scene... -->
</a-scene>
```

To use the master branch of the Inspector:

```html
<a-scene inspector="https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js">
</a-scene>
```

## Local Development

```bash
git clone git@github.com:aframevr/aframe-inspector.git
cd aframe-inspector
npm install
npm start
```

Then navigate to __[http://localhost:3333/examples/](http://localhost:3333/examples/)__

[travis-image]: https://img.shields.io/travis/aframevr/aframe-inspector.svg?style=flat-square
[travis-url]: https://travis-ci.org/aframevr/aframe-inspector
