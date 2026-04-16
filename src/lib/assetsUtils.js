export function getUrlFromId(assetId) {
  return (
    assetId.length > 1 &&
    document.querySelector(assetId) &&
    document.querySelector(assetId).getAttribute('src')
  );
}

export function getIdFromUrl(url) {
  const escaped = url.replace(/'/g, "\\'");
  return document.querySelector(`a-assets > [src='${escaped}']`)?.id;
}

export function getFilename(url, converted = false) {
  var filename = url.split('/').pop();
  if (converted) {
    filename = getValidId(filename);
  }
  return filename;
}

export function isValidId(id) {
  // The correct re should include : and . but A-frame seems to fail while accessing them
  var re = /^[A-Za-z_]+[\w-]*$/;
  return re.test(id);
}

export function getValidId(name) {
  return (
    name
      .split('.')
      .shift()
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove characters that are not letters (A–Z, a–z), numbers (0–9), underscore (_), and hyphen (-)
      .replace(/[^\w-]+/g, '')
      // Strip leading hyphens and digits
      .replace(/^[-\d]+/, '')
      .toLowerCase()
  );
}

export function insertNewAsset(type, id, src, onLoadedCallback = undefined) {
  let element;
  switch (type) {
    case 'img':
      element = document.createElement('img');
      element.id = id;
      element.src = src;
      element.crossOrigin = 'anonymous';
      break;
  }

  if (element) {
    element.onload = function () {
      if (onLoadedCallback) {
        onLoadedCallback();
      }
    };

    let assetsEl = document.querySelector('a-assets');
    if (!assetsEl) {
      assetsEl = document.createElement('a-assets');
      var sceneEl = document.querySelector('a-scene');
      if (!sceneEl) {
        throw new Error('No a-scene element found to append a-assets to');
      }
      sceneEl.appendChild(assetsEl);
    }

    assetsEl.appendChild(element);
  }
}
