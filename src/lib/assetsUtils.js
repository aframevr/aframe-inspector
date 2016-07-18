function insertNewAsset (type, id, src) {
  var element = null;
  switch (type) {
    case 'img': {
      element = document.createElement('img');
      element.id = id;
      element.src = src;
    } break;
  }
  if (element) {
    document.getElementsByTagName('a-assets')[0].appendChild(element);
  }
}

module.exports = {
  insertNewAsset: insertNewAsset
};
