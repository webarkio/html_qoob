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
        },
        localtunnel_client: { // remote test mobile and tablet devices
            server: {
                options: {
                    port: 8000,
                    subdomain: 'qoob',
                    local_host: 'localhost',
                    keepalive: true,
                    onSuccess: function(tunnel) {
                        grunt.log.ok('Connected at: ', tunnel.url);
                    },
                    onError: function(err) {
                        grunt.log.error('Not cool! ', err);
                    }
                }
            }
        }        

    });

    //Loading tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-localtunnel-client');

    grunt.registerTask('default', ['clean', 'compress']);
};
