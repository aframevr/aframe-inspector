module.exports = {
  parser: new window.DOMParser(),
  xmlToString: function (xmlData) {
    var xmlString;
    // IE
    if (window.ActiveXObject) {
      xmlString = xmlData.xml;
    } else {
      // Mozilla, Firefox, Opera, etc.
      xmlString = (new window.XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
  },
  generateHtml: function () {
    var xmlDoc = this.parser.parseFromString(document.documentElement.innerHTML, 'text/html');

    // Remove all the components that are being injected by aframe-editor or aframe
    // @todo Use custom class to prevent this hack
    var elementsToRemove = xmlDoc.querySelectorAll([
      // Injected by the editor
      '[data-aframe-editor]',
      'script[src$="aframe-editor.js"]',
      'style[type="text/css"]',
      // Injected by aframe
      '.a-enter-vr',
      '.a-orientation-modal',
      '.a-canvas',
      '.a-enter-vr-button',
      'style[data-href$="aframe.css"]',
      // Injected by stats
      '.rs-base',
      'style[data-href$="rStats.css"]'
    ].join(','));
    for (var i = 0; i < elementsToRemove.length; i++) {
      var el = elementsToRemove[i];
      el.parentNode.removeChild(el);
    }

    return this.xmlToString(xmlDoc);
  }
};
