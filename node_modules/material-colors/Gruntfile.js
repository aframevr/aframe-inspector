module.exports = function(grunt) {
  grunt.initConfig({
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['json', 'css', 'sass', 'scss', 'less', 'styl', 'js']);
};
