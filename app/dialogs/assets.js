var UI = require('../../lib/vendor/ui.js'); // @todo will be replaced with the npm package
var samples = {
  "textures": [
    '758px-Canestra_di_frutta_Caravaggio.jpg',
    '2294472375_24a3b8ef46_o.jpg',
    'brick_bump.jpg',
    'brick_diffuse.jpg',
    'checkerboard.jpg',
    'crate.gif',
    'envmap.png',
    'grasslight-big.jpg',
    'sprite0.png',
    'UV_Grid_Sm.jpg'
  ]
};

function GetFilename(url) {
   if (url)
   {
      var m = url.toString().match(/.*\/(.+?)\./);
      if (m && m.length > 1)
      {
         return m[1];
      }
   }
   return '';
}

function AssetsDialog (editor) {
  var container = new UI.Panel();
  container.setClass('assets-dialog');

  // -------------------------------------
  var tabs = new UI.Div();
  tabs.setId('tabs');

  function insertNewAsset(type, id, src) {
    var element = null;
    switch (type) {
      case 'img': {
          element = document.createElement("img");
          element.id = id;

          element.src = src;
      } break;
    }
    if (element)
      document.getElementsByTagName("a-assets")[0].appendChild(element);
  }

  function insertOrGetAsset(type, src) {
    var id = GetFilename(src);
    // Search for already loaded asset by src
    var element = document.querySelector("a-assets > img[src='" + src + "']");
    if (element) {
      id = element.id;
    } else {
      // Check if first char of the ID is a number (Non a valid ID)
      // In that case a 'i' preffix will be added
      if (!isNaN(parseInt(id[0], 10))) {
        id='i' + id;
      }
      if (document.getElementById(id)) {
        var i = 1;
        while (document.getElementById(id + '_' + i)) {
          i++;
        }
        id += '_' + i;
      }
      insertNewAsset('img', id, src);
    }

    return id;
  }

  var assetsTab = new UI.Text('ASSETS').onClick(onClick);
  var samplesTab = new UI.Text('SAMPLES').onClick(onClick);
  var newTab = new UI.Text('NEW').onClick(onClick);
  // var assetsTab = new UI.Text('UPLOAD').onClick(onClick);

  tabs.add(assetsTab, samplesTab, newTab);

  container.add(tabs);

  function onClick (event) {
    select(event.target.textContent);
  }
  var assetsContent = new UI.Panel();
  var samplesContent = new UI.Panel();
  var newContent = new UI.Panel();

  var tabsContent = new UI.Span().add(assetsContent);
  container.add(tabsContent);
  container.add(samplesContent);
  container.add(newContent);

  function getImageWidget(texture, mapWidget) {
    var row = new UI.Row();
    var img = document.createElement('img');
    img.src = texture;
    img.style.width = '100px';
    img.style.height = '100px';
    row.dom.appendChild(img);

    var text = document.createTextNode(texture);
    row.dom.appendChild(text);

    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'select');
    (function (_texture) {
      button.addEventListener('click', function (event) {
        mapWidget.setValue('#'+insertOrGetAsset('img',_texture));
        if (mapWidget.onChangeCallback) {
          mapWidget.onChangeCallback();
        }
        editor.signals.hideModal.dispatch(assetsContent);
      });
    })(texture);
    row.dom.appendChild(button);
    return row;
  }

  editor.signals.showAssetsDialog.add(function (mapWidget) {
    // Assets content
    assetsContent.clear();
    var uniqueSrc = [];
    var texturesPromises = [];
    for (var texture in editor.sceneEl.systems.material.textureCache) {
      var json = JSON.parse(texture);
      if (uniqueSrc.indexOf(json.src)===-1) {
        uniqueSrc.push(json.src);
        texturesPromises.push(editor.sceneEl.systems.material.textureCache[texture]);
      }
    }

    Promise.all(texturesPromises).then(function(textures) {
        textures.forEach(function(texture){
          var row = getImageWidget(texture.image.getAttribute('src'), mapWidget);
          assetsContent.add(row);
        });
        editor.signals.showModal.dispatch(container);
    });

    // Assets content
    samplesContent.clear();
    for (var i in samples['textures']) {
      var row = getImageWidget('../assets/textures/'+samples['textures'][i], mapWidget);
      samplesContent.add(row);
    }

    // New content
    // Add new ID
    newContent.clear();
    var newUrl = new UI.Input('').setWidth('150px').setFontSize('12px').onChange(function () {
      // handleEntityChange(editor.selected.el, 'id', null, newUrl.getValue());
      // editor.signals.sceneGraphChanged.dispatch();
    });
    newContent.add(newUrl);

    var buttonAddNew = document.createElement('input');
    buttonAddNew.setAttribute('type', 'button');
    buttonAddNew.setAttribute('value', 'Add');
    buttonAddNew.addEventListener('click', function (event) {
      mapWidget.setValue('#'+insertOrGetAsset('img',newUrl.getValue()));
      //mapWidget.setValue('#'+insertOrGetAsset('img',_texture));
      //mapWidget.setValue('url(' + newUrl.getValue() + ')');
      if (mapWidget.onChangeCallback) {
        mapWidget.onChangeCallback();
      }
      editor.signals.hideModal.dispatch(assetsContent);
    });

    newContent.dom.appendChild(buttonAddNew);
  });

  function select (section) {
    samplesTab.setClass('');
    assetsTab.setClass('');
    samplesTab.setClass('');

    assetsContent.setDisplay('none');
    samplesContent.setDisplay('none');
    newContent.setDisplay('none');

    switch (section) {
      case 'SAMPLES':
        samplesTab.setClass('selected');
        samplesContent.setDisplay('');
        break;
      case 'ASSETS':
        assetsTab.setClass('selected');
        assetsContent.setDisplay('');
        break;
      case 'NEW':
        newTab.setClass('selected');
        newContent.setDisplay('');
        break;
    }
  }

  select('ASSETS');
}

module.exports = AssetsDialog;
