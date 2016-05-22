var hyphen2camel = require('../lib/hyphen2camel');

function generate(grunt, fileType) {
  var colorSet = grunt.file.readJSON('dist/colors.json');
  if (fileType === 'js') {
    colorSet = camelizeKeys(colorSet);
  }
  var tmpl = grunt.file.read('templates/' + fileType + '.tmpl');
  var data = { colorSet: colorSet };
  var generated = grunt.template.process(tmpl, { data: data });
  grunt.file.write('dist/colors.' + fileType, generated);
}

function camelizeKeys(obj) {
  var clone = {};
  Object.keys(obj).forEach(function(key) {
    var camelized = hyphen2camel(key);
    clone[camelized] = obj[key];
  });
  return clone;
}

module.exports = function(grunt) {
  var fileTypes = ['css', 'sass', 'scss', 'less', 'styl', 'js'];
  fileTypes.forEach(function(fileType) {
    grunt.registerTask(fileType, function() {
      generate(grunt, fileType);
    });
  });
};
