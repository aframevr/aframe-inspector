# A-Frame Inspector

[![build status][travis-image]][travis-url]

A visual inspector tool for [A-Frame](https://aframe.io) scenes. Just hit
`<ctrl> + <alt> + i` on any A-Frame scene to open up the Inspector. Check out
[the guide](https://aframe.io/docs/master/introduction/visual-inspector-and-dev-tools.html).

[VIEW DEMO](https://aframe.io/aframe-inspector/example/)

![Inspector Preview](https://cloud.githubusercontent.com/assets/674727/17754902/b9f6f09a-648b-11e6-8319-a4344744fed7.png)

## Using the Inspector

A-Frame comes with a **keyboard shortcut** to inject the inspector. Just open
up any A-Frame scene (running at least A-Frame v0.3.0) and press **`<ctrl> +
<alt> + i`** to inject the inspector, just like you would use a DOM inspector:

This is done with the `inspector` component. By default, this is set on the
scene already. If we want, we can specify a specific build of the Inspector to
inject by passing a URL.

```html
<a-scene inspector="url: https://aframe.io/releases/0.3.0/aframe-inspector.min.js">
  <!-- Scene... -->
</a-scene>
```

## Local Development

```bash
git clone git@github.com:aframevr/aframe-inspector.git
cd aframe-inspector
npm install
npm start
```

Then navigate to __[http://localhost:3333/example/](http://localhost:3333/example/)__

[travis-image]: https://img.shields.io/travis/aframevr/aframe-inspector.svg?style=flat-square
[travis-url]: https://travis-ci.org/aframevr/aframe-inspector
