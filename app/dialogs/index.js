var AssetsDialog = require('./assets');

function Dialogs (editor) {
  this.assets = new AssetsDialog(editor);
}

module.exports = Dialogs;
