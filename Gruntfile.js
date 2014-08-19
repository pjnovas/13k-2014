
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    paths: {
      game: {
        root: "src/",
        js: "src/js/",
        css: "src/css/game.css",
        images: "src/images/"
      },
      dist: {
        gameJS: "game.js",
        gameCSS: "game.css",
        exportJS: "export/js/",
        exportCSS: "export/css/",
        exportImages: "export/images/"
      }
    },

    clean: {
      before: {
        src: [
          "<%= paths.dist.exportJS %>*",
          "<%= paths.dist.exportCSS %>*",
          "<%= paths.dist.exportImages %>*"
        ],
      } 
    },

    browserify: {
      game: {
        options:{
          extension: [ '.js' ]
        },
        src: ['<%= paths.game.js %>index.js'],
        dest: '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>'
      }
    },

    copy: {
      css: {
        cwd: "./", 
        files: {
          "<%= paths.dist.exportCSS %><%= paths.dist.gameCSS %>": "<%= paths.game.css %>",
        }
      },
      images: {
        expand: true,
        cwd: "<%= paths.game.images %>",
        src: "*.png",
        dest: "<%= paths.dist.exportImages %>"
      }
    },

    jshint: {
      all: {
        files: {
          src: ["<%= paths.game.root %>**/*.js"]
        },
        options: {
          bitwise: true
          ,curly: true
          ,eqeqeq: true
          ,forin: true
          ,immed: true
          ,latedef: true
          ,newcap: true
          ,noempty: true
          ,nonew: true
          ,undef: true
          ,unused: true
          ,laxcomma: true
          ,quotmark: false
          ,loopfunc: false

          ,globals: {
            window: true
            ,document: true
            ,require: true
            ,module: true
            ,console: true
            ,Time: true
            ,game: true
            ,Vector: true
            ,Mathf: true
            ,Renderer: true
            ,config: true
            ,_: true
            ,Controls: true
            ,Physics: true
            ,Color: true
            ,Repo: true
            ,DEBUG: true
          }
        }

      }
    },

    connect: {
      options: {
        hostname: 'localhost',
        livereload: 35729,
        port: 3000
      },
      server: {
        options: {
          base: 'export',
          open: true
        }
      }
    },

    watch: {
      options: {
        livereload: '<%= connect.options.livereload %>'
      },
      all: {
        files: ["<%= paths.game.root %>**/*"],
        tasks: ['default']
      }
    },

    // EXPORT TASKS

    uglify: {
      all: {
        options: {
          compress: {
            global_defs: {
              "DEBUG": false
            }
          },
          stripBanners: {
            line: true
          },
        },
        files: {
          '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>': 
            [ '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>' ]
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  var build = [
    "clean", 
    "jshint:all", 
    "browserify", 
    "copy"
  ];

  grunt.registerTask("default", build);
  grunt.registerTask("export", build.concat(["uglify"]));
  
  return grunt.registerTask('server', function() {
    grunt.task.run(build);
    grunt.task.run('connect:server');
    return grunt.task.run('watch:all');
  });
  
};
