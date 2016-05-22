var fetch = require('../lib/fetch');

module.exports = function(grunt) {
  grunt.registerTask('json', function() {
    var done = this.async();
    fetch(function(err, colorSet) {
      if (err) {
        grunt.log.writeln(err);
        done(false);
        return;
      }

      var json = JSON.stringify(colorSet, null, 2);
      grunt.file.write('dist/colors.json', json);
      done();
    });
  });
};
