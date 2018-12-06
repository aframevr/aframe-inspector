/* global XMLHttpRequest JSON */
import {getMajorVersion} from './utils.js';

function ComponentLoader () {
  this.components = [];
}

ComponentLoader.prototype = {
  /**
   * Inject component script. If already injected, then resolve.
   *
   * @returns {Promise}
   */
  addComponentToScene: function (packageName, componentName) {
    const component = this.components[packageName];
    if (component.included) { return Promise.resolve(componentName); }

    let script = document.createElement('script');
    script.src = component.file;
    script.setAttribute('data-component-description', component.description);
    script.setAttribute('data-component-names', component.names);
    script.setAttribute('data-component-url', component.npmUrl);
    script.setAttribute('data-package-name', packageName);

    return new Promise(resolve => {
      script.addEventListener('load', () => {
        script.onreadystatechange = script.onload = null;
        resolve(componentName);
      });
      (document.head || document.body).appendChild(script);
      component.included = true;
    });
  }
};

module.exports = ComponentLoader;
