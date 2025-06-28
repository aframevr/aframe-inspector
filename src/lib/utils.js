export function equal(var1, var2) {
  var keys1;
  var keys2;
  var type1 = typeof var1;
  var type2 = typeof var2;
  if (type1 !== type2) {
    return false;
  }
  if (type1 !== 'object' || var1 === null || var2 === null) {
    return var1 === var2;
  }
  if (var1 instanceof HTMLElement || var2 instanceof HTMLElement) {
    // If we're here, we're comparing a value of a schema property of type selector like movement-controls's camera property
    return var1 === var2;
  }
  keys1 = Object.keys(var1);
  keys2 = Object.keys(var2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (var i = 0; i < keys1.length; i++) {
    if (!equal(var1[keys1[i]], var2[keys2[i]])) {
      return false;
    }
  }
  return true;
}

export function getOS() {
  var userAgent = window.navigator.userAgent;
  var platform = window.navigator.platform;
  var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  var os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'macos';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'ios';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'windows';
  } else if (/Android/.test(userAgent)) {
    os = 'android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'linux';
  }

  return os;
}

export function injectCSS(url) {
  var link = document.createElement('link');
  link.href = url;
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.media = 'screen,print';
  link.setAttribute('data-aframe-inspector', 'style');
  document.head.appendChild(link);
}

export function injectJS(url, onLoad, onError) {
  var link = document.createElement('script');
  link.src = url;
  link.charset = 'utf-8';
  link.setAttribute('data-aframe-inspector', 'style');

  if (onLoad) {
    link.addEventListener('load', onLoad);
  }

  if (onError) {
    link.addEventListener('error', onError);
  }

  document.head.appendChild(link);
}

export function saveString(text, filename, mimeType) {
  saveBlob(new Blob([text], { type: mimeType }), filename);
}

export function saveBlob(blob, filename) {
  var link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename || 'ascene.html';
  link.click();
  URL.revokeObjectURL(url);
  link.remove();
}

// Compares 2 vector objects up to size 4
// Expect v1 and v2 to take format {x: number, y: number, z: number, w:number}
// Smaller vectors (ie. vec2) should work as well since their z & w vals will be the same (undefined)
export function areVectorsEqual(v1, v2) {
  return (
    Object.is(v1.x, v2.x) &&
    Object.is(v1.y, v2.y) &&
    Object.is(v1.z, v2.z) &&
    Object.is(v1.w, v2.w)
  );
}

/**
 * Check if a property should be shown in the UI based on the `if` object
 * condition included in the schema for the property.
 *
 * When more than one property is used in the object, this applies a logical AND.
 * When the value is an array, it means one of the entries in this array.
 *
 * Example in the light component:
 * ```js
 * {
 *   penumbra: {default: 0, min: 0, max: 1, if: {type: ['spot']}},
 * }
 * ```
 *
 * @param {string} propertyName - The name of the property
 * @param {Component} component - The component instance
 * @returns {boolean} Whether the property should be shown
 */
export function shouldShowProperty(propertyName, component) {
  if (!component.schema[propertyName].if) {
    return true;
  }
  let showProperty = true;
  for (const [conditionKey, conditionValue] of Object.entries(
    component.schema[propertyName].if
  )) {
    if (Array.isArray(conditionValue)) {
      if (conditionValue.indexOf(component.data[conditionKey]) === -1) {
        showProperty = false;
        break;
      }
    } else {
      if (conditionValue !== component.data[conditionKey]) {
        showProperty = false;
        break;
      }
    }
  }
  return showProperty;
}
