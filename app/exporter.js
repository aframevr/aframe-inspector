module.exports = {
  parser: new window.DOMParser(),
  generateHtml: function () {
    var xmlDoc = this.parser.parseFromString(document.documentElement.innerHTML, 'text/html');

    // Remove all the components that are being injected by aframe-editor or aframe
    // @todo Use custom class to prevent this hack
    Array.prototype.forEach.call(xmlDoc.querySelectorAll('.a-enter-vr,.a-orientation-modal,.Panel,.editor-tools,.rs-base,.a-canvas,.a-enter-vr-button,style[data-href="style/rStats.css"],style[data-href^="src/panels"],style[data-href="style/aframe-core.css"],link[href^="https://maxcdn.bootstrapcdn.com"]'), function (el) {
      el.parentNode.removeChild(el);
    });

    return this.xmlToString(xmlDoc);
  },
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
  }
};
