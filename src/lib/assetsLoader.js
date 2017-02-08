/* global XMLHttpRequest JSON */
import Events from './Events';

const assetsBaseUrl = 'https://aframe.io/sample-assets/';
const assetsRelativeUrl = {
  'images': 'dist/images.json'
};

/**
 * Asynchronously load and register components from the registry.
 */
function AssetsLoader () {
  this.images = [];
  this.load();
}

AssetsLoader.prototype = {
  /**
   * XHR the assets JSON.
   */
  load: function () {
    var xhr = new XMLHttpRequest();
    var url = assetsBaseUrl + assetsRelativeUrl['images'];

    // @todo Remove the sync call and use a callback
    xhr.open('GET', url);

    xhr.onload = () => {
      var data = JSON.parse(xhr.responseText);
      this.images = data.images;
      console.info('Images in registry:', Object.keys(this.images).length);
      this.images.forEach(image => {
        image.fullPath = assetsBaseUrl + data.basepath.images + image.path;
        image.fullThumbPath = assetsBaseUrl + data.basepath.images_thumbnails + image.thumbnail;
      });
      Events.emit('assetsimagesloaded', this.images);
    };
    xhr.onerror = () => { console.error('Error loading registry file.'); };
    xhr.send();
  }
};

module.exports = AssetsLoader;
