'use strict';
module.exports = function(grunt) {

    // load all tasks
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            folder: ['build/']
        },
        compress: {
            full: {
                options: {
                    archive: 'build/html_qoob.zip'
                },
                files: [{
                    expand: true,
                    src: [
                        '**',
                        '!.git/**',
                        '!node_modules/**',
                        '!.gitignore',
                        '!**/.gitignore'
                    ],
                    dest: 'html_qoob/'
                }]
            }
        }

    });

    //Loading tasks
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'compress']);
};
