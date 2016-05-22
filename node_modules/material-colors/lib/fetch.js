var http = require('http');
var util = require('util');
var cheerio = require('cheerio');

// Create an Object from an Array of objects.
function toObject(objects, keyName, valueName) {
  return objects.reduce(function(acc, obj) {
    acc[obj[keyName]] = obj[valueName];
    return acc;
  }, {});
}

function parse(html) {
  var $ = cheerio.load(html);

  function pickColor(_i, item) {
    var $item = $(item);
    var shade = $item.find('.shade').text().toLowerCase();
    var hex = $item.find('.hex').text();
    return { shade: shade, hex: hex };
  }

  function pickGroupColors(_i, group) {
    var $group = $(group);
    var colorName = $group.find('li.main-color .name').text();
    var name = colorName.toLowerCase().split(' ').join('-');
    var $items = $group.find('li.color:not(.main-color)');
    var groupColors = $items.map(pickColor).toArray();
    var colors = toObject(groupColors, 'shade', 'hex');
    return { name: name, colors: colors };
  }

  var $groups = $('.color-group');
  var colorGroups = $groups.map(pickGroupColors).toArray();
  var colorSet = toObject(colorGroups, 'name', 'colors');
  // Put black and white at the top level.
  if ('' in colorSet) {
    util._extend(colorSet, colorSet['']);
    delete colorSet[''];
  }
  return colorSet;
}

function fetch(callback) {
  http.get('http://www.google.com/design/spec/style/color.html', function(res) {
    if (res.statusCode !== 200) {
      callback('Status code: ' + res.statusCode);
      return;
    }

    var html = '';
    res.setEncoding('utf8');
    res.on('readable', function() {
      html += res.read();
    });
    res.on('end', function() {
      var colorSet = parse(html);
      callback(null, colorSet);
    });
    res.on('error', callback);
  }).on('error', callback);
}

module.exports = fetch;
