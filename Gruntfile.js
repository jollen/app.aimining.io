var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: [
            'node_modules/**',
            'public/**'
          ],
          ext: 'js'
        }
      }
    },
    watch: {
      clientJS: {
         files: [
          'public/layouts/**/*.js', '!public/layouts/**/*.min.js',
          'public/views/**/*.js', '!public/views/**/*.min.js'
         ],
         tasks: ['newer:uglify', 'newer:jshint:client']
      },
      serverJS: {
         files: ['views/**/*.js'],
         tasks: ['newer:jshint:server']
      },
      clientLess: {
         files: [
          'public/layouts/**/*.less',
          'public/views/**/*.less',
          'public/less/**/*.less'
         ],
         tasks: ['newer:less']
      },
      less: {
          files: [
                  'public/flat-ui/less/flat-ui.less',
                  'public/ui-kit/ui-kit-content/less/*.less',
                  'public/ui-kit/ui-kit-footer/less/*.less',
                  'public/ui-kit/ui-kit-header/less/*.less',
                  'public/ui-kit/ui-kit-blog/less/*.less',
                  'public/ui-kit/ui-kit-crew/less/*.less',
                  'public/ui-kit/forbest-tw.less'
          ],
          tasks: ['less:development']
      }
    },
    uglify: {
      production: {
          options: {
              style: 'compressed'
          },
          files: {
              'public/js/all.min.js': [
                  'public/vendor/jquery/jquery.js',

                  //'public/flat-ui/js/bootstrap.min.js',
                  'public/vendor/bootstrap/js/affix.js',
                  'public/vendor/bootstrap/js/alert.js',
                  'public/vendor/bootstrap/js/button.js',
                  'public/vendor/bootstrap/js/carousel.js',
                  'public/vendor/bootstrap/js/collapse.js',
                  'public/vendor/bootstrap/js/dropdown.js',
                  'public/vendor/bootstrap/js/modal.js',
                  'public/vendor/bootstrap/js/tooltip.js',
                  'public/vendor/bootstrap/js/popover.js',
                  'public/vendor/bootstrap/js/scrollspy.js',
                  'public/vendor/bootstrap/js/tab.js',
                  'public/vendor/bootstrap/js/transition.js',

                  'public/common-files/js/modernizr.custom.js',
                  'public/common-files/js/page-transitions.js',
                  'public/common-files/js/startup-kit.js',
                  //'public/jasny/js/jasny-bootstrap.js',
                  'public/vendor/underscore/underscore-min.js',
                  'public/vendor/backbone/backbone-min.js',
                  'public/vendor/momentjs/min/moment.min.js',
                  'public/layouts/core.js'
              ]
          }
      },
      layouts: {
        files: {
          'public/layouts/ie-sucks.min.js': [
            'public/vendor/html5shiv/html5shiv.js',
            'public/vendor/respond/respond.js',
            'public/layouts/ie-sucks.js'
          ],
          'public/layouts/admin.min.js': ['public/layouts/admin.js']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.js', '!**/*.min.js'],
          dest: 'public/views/',
          ext: '.min.js'
        }]
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'public/layouts/**/*.min.js',
            'public/views/**/*.min.js'
          ]
        },
        src: [
          'public/layouts/**/*.js',
          'public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.less'],
          dest: 'public/views/',
          ext: '.min.css'
        }]
      },
      development: {
          options: {
              cleancss: true
          },
          files: {
              'public/flat-ui/css/flat-ui.css': [
                  'public/flat-ui/less/flat-ui.less',
                  'public/ui-kit/ui-kit-content/less/style.less',
                  'public/ui-kit/ui-kit-header/less/style.less',
                  'public/ui-kit/ui-kit-blog/less/style.less',
                  'public/ui-kit/ui-kit-crew/less/style.less',
                  'public/ui-kit/forbest-tw.less'
              ]
          }
      }
    },
    clean: {
      js: {
        src: [
          'public/layouts/**/*.min.js',
          'public/layouts/**/*.min.js.map',
          'public/views/**/*.min.js',
          'public/views/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'public/layouts/**/*.min.css',
          'public/views/**/*.min.css'
        ]
      },
      vendor: {
        src: ['public/vendor/**']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('default', ['uglify:production', 'less']);
  grunt.registerTask('build', ['uglify', 'less']);
  grunt.registerTask('lint', ['jshint']);
};
